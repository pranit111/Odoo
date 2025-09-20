from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class WorkCenter(models.Model):
    """
    Work centers represent machines, workstations, or areas where operations take place
    """
    work_center_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text="Name (e.g., 'Assembly Line 1', 'Paint Floor')")
    code = models.CharField(max_length=20, unique=True, help_text="Short code (e.g., 'ASM1', 'PAINT')")
    
    # Costing and capacity
    cost_per_hour = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        help_text="Costing rate for this work center (per hour)"
    )
    capacity_hours_per_day = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        default=8.00,
        help_text="Available working hours per day"
    )
    
    # Operational details
    description = models.TextField(blank=True, help_text="Description of the work center")
    location = models.CharField(max_length=100, blank=True, help_text="Physical location")
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Whether this work center is operational")
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_workcenters')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    def get_daily_capacity_minutes(self):
        """Get daily capacity in minutes"""
        return float(self.capacity_hours_per_day) * 60
    
    def calculate_operation_cost(self, duration_minutes):
        """Calculate cost for an operation based on duration"""
        hours = duration_minutes / 60
        return float(self.cost_per_hour) * hours
