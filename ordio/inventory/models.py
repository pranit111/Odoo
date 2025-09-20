from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from decimal import Decimal
import uuid

User = get_user_model()

class StockLedger(models.Model):
    """
    Immutable stock movement log - tracks every inventory transaction
    """
    MOVEMENT_TYPES = [
        ('MO_CONSUMPTION', 'Manufacturing Order - Component Consumption'),
        ('MO_PRODUCTION', 'Manufacturing Order - Finished Good Production'),
        ('MANUAL_IN', 'Manual Stock Addition'),
        ('MANUAL_OUT', 'Manual Stock Removal'),
        ('ADJUSTMENT', 'Stock Adjustment'),
        ('INITIAL_STOCK', 'Initial Stock Entry'),
    ]
    
    ledger_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # What product and how much
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='stock_movements')
    quantity_change = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Quantity changed (+ for addition, - for consumption)"
    )
    
    # Stock levels
    stock_before = models.DecimalField(max_digits=10, decimal_places=2)
    stock_after = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Transaction details
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    reference_number = models.CharField(max_length=100, blank=True, help_text="MO number, adjustment ref, etc.")
    
    # Related manufacturing order (if applicable)
    related_mo = models.ForeignKey(
        'manufacturing.ManufacturingOrder',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_movements'
    )
    
    # Metadata
    notes = models.TextField(blank=True, help_text="Additional notes about the transaction")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    transaction_time = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-transaction_time']
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['movement_type']),
            models.Index(fields=['transaction_time']),
            models.Index(fields=['related_mo']),
        ]
    
    def __str__(self):
        sign = '+' if self.quantity_change >= 0 else ''
        return f"{self.product.name}: {sign}{self.quantity_change} ({self.get_movement_type_display()})"
    
    def save(self, *args, **kwargs):
        # Calculate stock levels
        if not self.stock_before:
            self.stock_before = self.product.current_stock
        
        self.stock_after = self.stock_before + self.quantity_change
        
        super().save(*args, **kwargs)
        
        # Update product current stock
        self.product.current_stock = self.stock_after
        self.product.save(update_fields=['current_stock'])
    
    @classmethod
    def create_movement(cls, product, quantity_change, movement_type, **kwargs):
        """
        Factory method to create stock movement with atomic transaction
        """
        with transaction.atomic():
            # Lock the product row to prevent race conditions
            product = product.__class__.objects.select_for_update().get(pk=product.pk)
            
            movement = cls.objects.create(
                product=product,
                quantity_change=quantity_change,
                movement_type=movement_type,
                **kwargs
            )
            
            return movement


class StockAdjustment(models.Model):
    """
    Stock adjustments for manual inventory corrections
    """
    ADJUSTMENT_TYPES = [
        ('COUNT', 'Physical Count Adjustment'),
        ('DAMAGE', 'Damaged Goods'),
        ('LOSS', 'Lost/Missing Items'),
        ('FOUND', 'Found Items'),
        ('CORRECTION', 'Data Correction'),
    ]
    
    adjustment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    adjustment_number = models.CharField(max_length=50, unique=True)
    
    # Products and quantities
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='adjustments')
    expected_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    actual_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    adjustment_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Adjustment details
    adjustment_type = models.CharField(max_length=20, choices=ADJUSTMENT_TYPES)
    reason = models.TextField(help_text="Reason for the adjustment")
    
    # Approval workflow
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_adjustments'
    )
    approved_at = models.DateTimeField(blank=True, null=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_adjustments')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['is_approved']),
        ]
    
    def __str__(self):
        return f"Adjustment {self.adjustment_number}: {self.product.name}"
    
    def save(self, *args, **kwargs):
        if not self.adjustment_number:
            self.adjustment_number = self.generate_adjustment_number()
        
        # Calculate adjustment quantity
        self.adjustment_quantity = self.actual_quantity - self.expected_quantity
        
        super().save(*args, **kwargs)
    
    def generate_adjustment_number(self):
        """Generate unique adjustment number"""
        from datetime import datetime
        date_str = datetime.now().strftime('%Y%m')
        last_adj = StockAdjustment.objects.filter(
            adjustment_number__startswith=f'ADJ{date_str}'
        ).order_by('adjustment_number').last()
        
        if last_adj:
            last_num = int(last_adj.adjustment_number[-4:])
            new_num = last_num + 1
        else:
            new_num = 1
            
        return f'ADJ{date_str}{new_num:04d}'
    
    def approve(self, approver):
        """Approve the adjustment and create stock movement"""
        if self.is_approved:
            raise ValueError("Adjustment is already approved")
        
        with transaction.atomic():
            # Create stock ledger entry
            StockLedger.create_movement(
                product=self.product,
                quantity_change=self.adjustment_quantity,
                movement_type='ADJUSTMENT',
                reference_number=self.adjustment_number,
                notes=f"Adjustment: {self.reason}",
                created_by=approver
            )
            
            # Mark as approved
            self.is_approved = True
            self.approved_by = approver
            self.approved_at = timezone.now()
            self.save()


# Utility functions for common stock operations
class StockOperations:
    """Utility class for common stock operations"""
    
    @staticmethod
    def consume_components_for_mo(manufacturing_order):
        """Consume components when MO is completed"""
        movements = []
        
        with transaction.atomic():
            components = manufacturing_order.get_required_components()
            
            for comp_data in components:
                component = comp_data['component']
                required_qty = comp_data['total_required']
                
                if not component.can_consume(required_qty):
                    raise ValueError(
                        f"Insufficient stock for {component.name}. "
                        f"Required: {required_qty}, Available: {component.current_stock}"
                    )
                
                # Create consumption movement
                movement = StockLedger.create_movement(
                    product=component,
                    quantity_change=-required_qty,
                    movement_type='MO_CONSUMPTION',
                    reference_number=manufacturing_order.mo_number,
                    related_mo=manufacturing_order,
                    notes=f"Component consumption for {manufacturing_order.quantity_to_produce}x {manufacturing_order.product.name}"
                )
                movements.append(movement)
        
        return movements
    
    @staticmethod
    def produce_finished_goods_for_mo(manufacturing_order):
        """Add finished goods when MO is completed"""
        with transaction.atomic():
            movement = StockLedger.create_movement(
                product=manufacturing_order.product,
                quantity_change=manufacturing_order.quantity_to_produce,
                movement_type='MO_PRODUCTION',
                reference_number=manufacturing_order.mo_number,
                related_mo=manufacturing_order,
                notes=f"Production of {manufacturing_order.quantity_to_produce}x {manufacturing_order.product.name}"
            )
            
            # Update MO quantities
            manufacturing_order.quantity_produced = manufacturing_order.quantity_to_produce
            manufacturing_order.save(update_fields=['quantity_produced'])
            
            return movement
    
    @staticmethod
    def complete_manufacturing_order(manufacturing_order):
        """Complete full MO cycle - consume components and produce goods"""
        consume_movements = StockOperations.consume_components_for_mo(manufacturing_order)
        produce_movement = StockOperations.produce_finished_goods_for_mo(manufacturing_order)
        
        return {
            'consumed': consume_movements,
            'produced': produce_movement
        }
