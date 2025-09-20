from django.contrib import admin
from .models import BOM, BOMComponent, BOMOperation

@admin.register(BOM)
class BOMAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'product', 'version', 'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'product__name', 'product__sku', 'version']
    readonly_fields = ['bom_id', 'created_at', 'updated_at']
    ordering = ['product__name', 'version']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'product', 'version', 'is_active')
        }),
        ('System Information', {
            'fields': ('bom_id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product')

@admin.register(BOMComponent)
class BOMComponentAdmin(admin.ModelAdmin):
    list_display = [
        'bom', 'component', 'quantity', 'get_total_cost'
    ]
    search_fields = ['bom__name', 'component__name', 'component__sku']
    ordering = ['bom', 'component']
    
    fieldsets = (
        ('BOM Component', {
            'fields': ('bom', 'component', 'quantity', 'notes')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('bom', 'component')
    
    def get_total_cost(self, obj):
        return f"${obj.get_total_cost():.2f}"
    get_total_cost.short_description = 'Total Cost'

@admin.register(BOMOperation)
class BOMOperationAdmin(admin.ModelAdmin):
    list_display = [
        'bom', 'name', 'sequence', 'work_center', 'duration_minutes', 'setup_time_minutes'
    ]
    list_filter = ['work_center', 'bom__product']
    search_fields = ['name', 'bom__name', 'work_center__name']
    ordering = ['bom', 'sequence']
    
    fieldsets = (
        ('Operation Details', {
            'fields': ('bom', 'name', 'sequence', 'work_center')
        }),
        ('Timing', {
            'fields': ('duration_minutes', 'setup_time_minutes')
        }),
        ('Description', {
            'fields': ('description',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('bom', 'work_center')
