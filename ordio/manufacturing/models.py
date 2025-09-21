from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
from decimal import Decimal
import uuid

User = get_user_model()

class ManufacturingOrder(models.Model):
    """
    Manufacturing Order - Authorization to produce a specific quantity of goods
    """
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('CONFIRMED', 'Confirmed'),
        ('IN_PROGRESS', 'In Progress'),
        ('DONE', 'Done'),
        ('CANCELED', 'Canceled'),
    ]
    
    mo_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mo_number = models.CharField(max_length=50, unique=True, help_text="Human-readable MO number")
    
    # Product and BOM
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='manufacturing_orders')
    bom = models.ForeignKey('bom.BOM', on_delete=models.CASCADE, related_name='manufacturing_orders')
    quantity_to_produce = models.PositiveIntegerField(help_text="Target quantity of finished product")
    
    # Status and scheduling
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    priority = models.CharField(
        max_length=10,
        choices=[('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High')],
        default='MEDIUM'
    )
    
    # Dates
    scheduled_start_date = models.DateField(help_text="Planned start date for production")
    scheduled_end_date = models.DateField(blank=True, null=True)
    actual_start_date = models.DateTimeField(blank=True, null=True)
    completion_date = models.DateTimeField(blank=True, null=True)
    
    # Assignment and tracking
    assignee = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='assigned_manufacturing_orders',
        help_text="Manager responsible for this order"
    )
    quantity_produced = models.PositiveIntegerField(default=0, help_text="Actual quantity produced")
    
    # Notes and metadata
    notes = models.TextField(blank=True, help_text="MO notes or special instructions")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_manufacturing_orders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['scheduled_start_date']),
            models.Index(fields=['assignee']),
        ]
    
    def __str__(self):
        return f"MO-{self.mo_number}: {self.quantity_to_produce}x {self.product.name}"
    
    def save(self, *args, **kwargs):
        if not self.mo_number:
            self.mo_number = self.generate_mo_number()
        super().save(*args, **kwargs)
    
    def generate_mo_number(self):
        """Generate unique MO number"""
        from datetime import datetime
        date_str = datetime.now().strftime('%Y%m')
        last_mo = ManufacturingOrder.objects.filter(
            mo_number__startswith=f'MO{date_str}'
        ).order_by('mo_number').last()
        
        if last_mo:
            last_num = int(last_mo.mo_number[-4:])
            new_num = last_num + 1
        else:
            new_num = 1
            
        return f'MO{date_str}{new_num:04d}'
    
    def get_required_components(self):
        """Get component requirements from stored MO components"""
        components = []
        for mo_comp in self.component_requirements.all():
            # Get current stock availability
            current_stock = mo_comp.component.current_stock
            shortage = max(0, mo_comp.required_quantity - current_stock)
            
            components.append({
                'component_id': mo_comp.component.product_id,
                'component_name': mo_comp.component.name,
                'component_sku': mo_comp.component.sku,
                'quantity_per_unit': mo_comp.quantity_per_unit,
                'required_quantity': mo_comp.required_quantity,
                'available_stock': current_stock,
                'shortage': shortage,
                'is_sufficient': current_stock >= mo_comp.required_quantity
            })
        return components
    
    def check_component_availability(self):
        """Check if all components are available"""
        for mo_comp in self.component_requirements.all():
            current_stock = mo_comp.component.current_stock
            if current_stock < mo_comp.required_quantity:
                return False
        return True
    
    def get_total_estimated_cost(self):
        """Calculate total estimated cost for this MO"""
        return float(self.bom.get_total_bom_cost()) * self.quantity_to_produce
    
    def create_work_orders(self):
        """Create Work Orders from BOM Operations"""
        if self.status != 'CONFIRMED':
            raise ValidationError("MO must be confirmed to create work orders")
        
        # Delete existing work orders if any
        self.work_orders.all().delete()
        
        for bom_op in self.bom.operations.all():
            WorkOrder.objects.create(
                mo=self,
                bom_operation=bom_op,
                name=bom_op.name,
                work_center=bom_op.work_center,
                estimated_duration_minutes=bom_op.get_total_time_minutes(self.quantity_to_produce),
                sequence=bom_op.sequence
            )
    
    def get_progress_percentage(self):
        """Calculate MO progress based on completed work orders"""
        work_orders = self.work_orders.all()
        if not work_orders:
            return 0
        
        completed = work_orders.filter(status='COMPLETED').count()
        return (completed / work_orders.count()) * 100
    
    def populate_components_from_bom(self):
        """Populate component requirements from BOM"""
        # Clear existing components
        self.component_requirements.all().delete()
        
        # Add components from BOM
        for bom_comp in self.bom.components.all():
            MOComponentRequirement.objects.create(
                mo=self,
                component=bom_comp.component,
                quantity_per_unit=bom_comp.quantity,
                required_quantity=bom_comp.quantity * self.quantity_to_produce
            )
    
    def can_start(self):
        """Check if MO can be started"""
        return (
            self.status == 'CONFIRMED' and 
            self.check_component_availability() and
            self.work_orders.exists()
        )


class MOComponentRequirement(models.Model):
    """
    Component requirement for a specific Manufacturing Order
    """
    requirement_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    mo = models.ForeignKey(ManufacturingOrder, on_delete=models.CASCADE, related_name='component_requirements')
    component = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='mo_requirements')
    
    # Quantities
    quantity_per_unit = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Quantity of this component needed per unit of finished product"
    )
    required_quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Total quantity required for this MO"
    )
    consumed_quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0,
        help_text="Quantity already consumed/allocated"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = [['mo', 'component']]
        ordering = ['component__name']
    
    def __str__(self):
        return f"{self.mo.mo_number} - {self.component.name}: {self.required_quantity}"
    
    @property
    def remaining_quantity(self):
        """Quantity still needed"""
        return self.required_quantity - self.consumed_quantity
    
    @property
    def is_satisfied(self):
        """Check if requirement is fully satisfied"""
        return self.component.current_stock >= self.remaining_quantity


class WorkOrder(models.Model):
    """
    Work Order - Individual task/operation within a Manufacturing Order
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'), 
        ('PAUSED', 'Paused'),
        ('COMPLETED', 'Completed'),
        ('CANCELED', 'Canceled'),
    ]
    
    wo_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wo_number = models.CharField(max_length=50, unique=True, help_text="Human-readable WO number")
    
    # Relationships
    mo = models.ForeignKey(ManufacturingOrder, on_delete=models.CASCADE, related_name='work_orders')
    bom_operation = models.ForeignKey('bom.BOMOperation', on_delete=models.CASCADE, related_name='work_orders')
    
    # Operation details
    name = models.CharField(max_length=100, help_text="Operation name")
    work_center = models.ForeignKey('workcenters.WorkCenter', on_delete=models.CASCADE, related_name='work_orders')
    sequence = models.PositiveIntegerField(help_text="Order in the manufacturing process")
    
    # Time tracking
    estimated_duration_minutes = models.PositiveIntegerField(help_text="Estimated completion time")
    actual_duration_minutes = models.PositiveIntegerField(default=0, help_text="Actual time taken")
    
    # Status and assignment
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    operator = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_work_orders',
        help_text="Operator assigned to this task"
    )
    
    # Dates and tracking
    scheduled_start_date = models.DateTimeField(blank=True, null=True)
    actual_start_date = models.DateTimeField(blank=True, null=True)
    completion_date = models.DateTimeField(blank=True, null=True)
    pause_start_time = models.DateTimeField(blank=True, null=True, help_text="When work was paused")
    total_pause_minutes = models.PositiveIntegerField(default=0, help_text="Total time paused in minutes")
    
    # Notes and issues
    notes = models.TextField(blank=True, help_text="Work order notes, instructions, or issues")
    quality_notes = models.TextField(blank=True, help_text="Quality control notes")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['mo', 'sequence']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['operator']),
            models.Index(fields=['work_center']),
        ]
    
    def __str__(self):
        return f"WO-{self.wo_number}: {self.name} ({self.mo.mo_number})"
    
    def save(self, *args, **kwargs):
        if not self.wo_number:
            self.wo_number = self.generate_wo_number()
        super().save(*args, **kwargs)
    
    def generate_wo_number(self):
        """Generate unique WO number"""
        mo_num = self.mo.mo_number if self.mo else "000000"
        return f"{mo_num}-{self.sequence:02d}"
    
    def start_work(self, operator=None):
        """Start or resume the work order"""
        if self.status == 'PAUSED':
            # Resume paused work
            self.resume_work()
            return
        
        if self.status != 'PENDING':
            raise ValidationError(f"Work order must be PENDING to start (current: {self.status})")
        
        self.status = 'IN_PROGRESS'
        self.actual_start_date = timezone.now()
        if operator:
            self.operator = operator
        self.save()
        
        # Update MO status if this is the first WO to start
        if self.mo.status == 'CONFIRMED':
            self.mo.status = 'IN_PROGRESS'
            self.mo.actual_start_date = timezone.now()
            self.mo.save()
    
    def pause_work(self, notes=None):
        """Pause the work order"""
        if self.status != 'IN_PROGRESS':
            raise ValidationError("Can only pause work orders that are in progress")
        
        # Calculate time worked so far and add to actual duration
        if self.actual_start_date and not self.pause_start_time:
            time_worked = timezone.now() - self.actual_start_date
            self.actual_duration_minutes += int(time_worked.total_seconds() / 60)
        
        self.status = 'PAUSED'
        self.pause_start_time = timezone.now()
        
        if notes:
            self.notes += f"\n[PAUSED {timezone.now()}]: {notes}"
        self.save()
    
    def resume_work(self, notes=None):
        """Resume paused work order"""
        if self.status != 'PAUSED':
            raise ValidationError("Can only resume paused work orders")
        
        # Calculate pause duration
        if self.pause_start_time:
            pause_duration = timezone.now() - self.pause_start_time
            self.total_pause_minutes += int(pause_duration.total_seconds() / 60)
        
        self.status = 'IN_PROGRESS'
        self.actual_start_date = timezone.now()  # Reset start time for resumed work
        self.pause_start_time = None
        
        if notes:
            self.notes += f"\n[RESUMED {timezone.now()}]: {notes}"
        self.save()
    
    def complete_work(self, notes=None, actual_duration=None):
        """Complete the work order"""
        if self.status not in ['IN_PROGRESS', 'PAUSED']:
            raise ValidationError("Can only complete work orders that are in progress or paused")
        
        self.status = 'COMPLETED'
        self.completion_date = timezone.now()
        
        if actual_duration:
            self.actual_duration_minutes = actual_duration
        else:
            # Calculate final duration
            if self.status == 'IN_PROGRESS' and self.actual_start_date:
                # Add current work session time
                current_session = timezone.now() - self.actual_start_date
                self.actual_duration_minutes += int(current_session.total_seconds() / 60)
            elif self.status == 'PAUSED' and self.pause_start_time:
                # Work was paused, duration already calculated during pause
                pass
        
        if notes:
            self.notes += f"\n[COMPLETED {timezone.now()}]: {notes}"
        
        # Clear pause tracking
        self.pause_start_time = None
        
        self.save()
        
        # Check if all WOs are complete to update MO status
        pending_wos = self.mo.work_orders.filter(status__in=['PENDING', 'IN_PROGRESS', 'PAUSED'])
        if pending_wos.count() == 0:
            # All work orders completed - complete the MO
            self.mo.status = 'DONE'
            self.mo.completion_date = timezone.now()
            self.mo.quantity_produced = self.mo.quantity_to_produce
            self.mo.save()
            
            # Process inventory movements
            try:
                from inventory.models import StockOperations
                StockOperations.complete_manufacturing_order(self.mo)
            except Exception as e:
                # Log the error but don't prevent MO completion
                import logging
                logging.error(f"Error processing inventory for MO {self.mo.mo_number}: {e}")
    
    def get_efficiency_percentage(self):
        """Calculate efficiency based on estimated vs actual time"""
        if self.actual_duration_minutes == 0:
            return 0
        return (self.estimated_duration_minutes / self.actual_duration_minutes) * 100
    
    def is_overdue(self):
        """Check if work order is overdue"""
        if not self.scheduled_start_date or self.status == 'COMPLETED':
            return False
        return timezone.now() > self.scheduled_start_date