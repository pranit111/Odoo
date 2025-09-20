from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'sku', 'name', 'product_type', 'current_stock', 'minimum_stock', 
        'unit_cost', 'is_active', 'created_at'
    ]
    list_filter = ['product_type', 'is_active', 'created_at']
    search_fields = ['name', 'sku', 'description']
    readonly_fields = ['product_id', 'created_at', 'updated_at']
    ordering = ['name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'sku', 'product_type', 'description')
        }),
        ('Inventory', {
            'fields': ('current_stock', 'minimum_stock', 'unit_of_measure')
        }),
        ('Pricing', {
            'fields': ('unit_cost',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('System Information', {
            'fields': ('product_id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
