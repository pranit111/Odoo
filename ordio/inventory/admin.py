from django.contrib import admin
from .models import StockLedger, StockAdjustment

@admin.register(StockLedger)
class StockLedgerAdmin(admin.ModelAdmin):
    list_display = [
        'product', 'quantity_change', 'stock_before', 'stock_after', 
        'movement_type', 'reference_number', 'transaction_time'
    ]
    list_filter = ['movement_type', 'transaction_time', 'created_by']
    search_fields = ['product__name', 'product__sku', 'reference_number', 'notes']
    readonly_fields = ['ledger_id', 'stock_before', 'stock_after', 'transaction_time']
    ordering = ['-transaction_time']
    
    fieldsets = (
        ('Transaction Details', {
            'fields': ('product', 'quantity_change', 'movement_type', 'reference_number')
        }),
        ('Stock Levels', {
            'fields': ('stock_before', 'stock_after')
        }),
        ('Related Information', {
            'fields': ('related_mo', 'notes', 'created_by')
        }),
        ('System Information', {
            'fields': ('ledger_id', 'transaction_time'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product', 'related_mo', 'created_by')
    
    def has_add_permission(self, request):
        # Typically stock movements should be created through the system, not manually
        return False
    
    def has_change_permission(self, request, obj=None):
        # Stock ledger entries should be immutable
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Stock ledger entries should not be deleted
        return False

@admin.register(StockAdjustment)
class StockAdjustmentAdmin(admin.ModelAdmin):
    list_display = [
        'adjustment_number', 'product', 'expected_quantity', 'actual_quantity', 'adjustment_quantity',
        'adjustment_type', 'is_approved', 'created_at'
    ]
    list_filter = ['adjustment_type', 'is_approved', 'created_at', 'approved_by']
    search_fields = ['adjustment_number', 'product__name', 'product__sku', 'reason']
    readonly_fields = ['adjustment_id', 'adjustment_quantity', 'created_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Adjustment Details', {
            'fields': ('adjustment_number', 'product', 'expected_quantity', 'actual_quantity', 'adjustment_quantity', 'adjustment_type')
        }),
        ('Approval', {
            'fields': ('is_approved', 'approved_by', 'approved_at')
        }),
        ('Reason', {
            'fields': ('reason',)
        }),
        ('System Information', {
            'fields': ('adjustment_id', 'created_by', 'created_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product', 'created_by', 'approved_by')
