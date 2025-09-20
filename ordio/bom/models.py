from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import uuid

User = get_user_model()

class BOM(models.Model):
    """
    Bill of Materials - Recipe for manufacturing a product
    """
    bom_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='boms')
    name = models.CharField(max_length=150, help_text="Descriptive name (e.g., 'Wooden Table Recipe V1')")
    version = models.CharField(max_length=20, default='1.0', help_text="BOM version")
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Only one active BOM per product")
    
    # Metadata
    description = models.TextField(blank=True, help_text="BOM description or notes")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_boms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product', 'is_active']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['product'], 
                condition=models.Q(is_active=True),
                name='unique_active_bom_per_product'
            )
        ]
    
    def __str__(self):
        return f"BOM: {self.product.name} - {self.name}"
    
    def clean(self):
        """Ensure only one active BOM per product"""
        if self.is_active:
            existing_active = BOM.objects.filter(
                product=self.product, 
                is_active=True
            ).exclude(bom_id=self.bom_id)
            
            if existing_active.exists():
                raise ValidationError(
                    f"Product '{self.product.name}' already has an active BOM. "
                    "Please deactivate the existing BOM first."
                )
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def get_total_component_cost(self):
        """Calculate total cost of all components"""
        total = 0
        for component in self.components.all():
            total += component.get_total_cost()
        return total
    
    def get_total_operation_cost(self):
        """Calculate total cost of all operations (for 1 unit)"""
        total = 0
        for operation in self.operations.all():
            total += operation.get_operation_cost()
        return total
    
    def get_total_bom_cost(self):
        """Get total BOM cost (components + operations)"""
        return self.get_total_component_cost() + self.get_total_operation_cost()


class BOMComponent(models.Model):
    """
    Raw materials/components required by a BOM
    """
    bom = models.ForeignKey(BOM, on_delete=models.CASCADE, related_name='components')
    component = models.ForeignKey('products.Product', on_delete=models.CASCADE, help_text="Raw material required")
    quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Quantity needed to make one unit of the finished product"
    )
    
    # Optional fields
    notes = models.TextField(blank=True, help_text="Component-specific notes")
    
    class Meta:
        unique_together = ['bom', 'component']  # Prevent duplicate components in same BOM
        ordering = ['component__name']
    
    def __str__(self):
        return f"{self.quantity} × {self.component.name}"
    
    def get_total_cost(self):
        """Calculate total cost for this component line"""
        return float(self.quantity) * float(self.component.unit_cost)
    
    def check_availability(self, mo_quantity=1):
        """Check if sufficient stock is available for MO quantity"""
        required = float(self.quantity) * mo_quantity
        available = float(self.component.current_stock)
        return {
            'required': required,
            'available': available,
            'shortage': max(0, required - available),
            'is_sufficient': available >= required
        }


class BOMOperation(models.Model):
    """
    Operations/work steps required by a BOM
    """
    bom = models.ForeignKey(BOM, on_delete=models.CASCADE, related_name='operations')
    name = models.CharField(max_length=100, help_text="Operation name (e.g., 'Assembly', 'Painting')")
    sequence = models.PositiveIntegerField(help_text="Order of operations (1, 2, 3...)")
    work_center = models.ForeignKey('workcenters.WorkCenter', on_delete=models.CASCADE)
    duration_minutes = models.PositiveIntegerField(help_text="Estimated time to complete (per unit)")
    
    # Optional fields
    description = models.TextField(blank=True, help_text="Detailed operation instructions")
    setup_time_minutes = models.PositiveIntegerField(default=0, help_text="One-time setup time")
    
    class Meta:
        unique_together = ['bom', 'sequence']  # Ensure unique sequence per BOM
        ordering = ['sequence']
    
    def __str__(self):
        return f"{self.sequence}. {self.name} @ {self.work_center.name}"
    
    def get_operation_cost(self, quantity=1):
        """Calculate cost for this operation"""
        total_minutes = (float(self.duration_minutes) * quantity) + float(self.setup_time_minutes)
        return self.work_center.calculate_operation_cost(total_minutes)
    
    def get_total_time_minutes(self, quantity=1):
        """Get total time including setup for given quantity"""
        return (self.duration_minutes * quantity) + self.setup_time_minutes
