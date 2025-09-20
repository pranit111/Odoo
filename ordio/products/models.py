from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class Product(models.Model):
    """
    Master product table for both raw materials and finished goods
    """
    PRODUCT_TYPES = [
        ('RAW_MATERIAL', 'Raw Material'),
        ('FINISHED_GOOD', 'Finished Good'),
    ]
    
    # Primary key and basic info
    product_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150, help_text="Product name (e.g., 'Wooden Table', 'Screw')")
    sku = models.CharField(max_length=50, unique=True, help_text="Stock Keeping Unit or product code")
    
    # Product classification
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPES, default='RAW_MATERIAL')
    
    # Inventory tracking
    current_stock = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        help_text="Real-time available quantity in inventory"
    )
    minimum_stock = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        help_text="Minimum stock level for alerts"
    )
    unit_of_measure = models.CharField(
        max_length=20, 
        default='units',
        help_text="e.g., 'units', 'kg', 'liters', 'meters'"
    )
    
    # Costing
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Metadata
    description = models.TextField(blank=True, help_text="Product description or notes")
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_products')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['product_type']),
            models.Index(fields=['sku']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.sku})"
    
    def is_low_stock(self):
        """Check if product stock is below minimum threshold"""
        return self.current_stock <= self.minimum_stock
    
    def get_stock_status(self):
        """Get human-readable stock status"""
        if self.current_stock <= 0:
            return "Out of Stock"
        elif self.is_low_stock():
            return "Low Stock"
        else:
            return "In Stock"
    
    def can_consume(self, quantity):
        """Check if we can consume the specified quantity"""
        return self.current_stock >= quantity
