from django.contrib import admin
from .models import ManufacturingOrder, WorkOrder

@admin.register(ManufacturingOrder)
class ManufacturingOrderAdmin(admin.ModelAdmin):
    list_display = [
        'mo_number', 'product', 'quantity_to_produce', 'status', 
        'priority', 'scheduled_start_date', 'created_at'
    ]
    list_filter = ['status', 'priority', 'created_at', 'scheduled_start_date']
    search_fields = ['mo_number', 'product__name', 'product__sku']
    readonly_fields = ['mo_number', 'mo_id', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('mo_number', 'product', 'bom', 'quantity_to_produce')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority')
        }),
        ('Scheduling', {
            'fields': ('scheduled_start_date', 'scheduled_end_date', 'actual_start_date', 'completion_date')
        }),
        ('Assignment & Notes', {
            'fields': ('assignee', 'notes')
        }),
        ('System Information', {
            'fields': ('mo_id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product', 'bom', 'assignee')

@admin.register(WorkOrder)
class WorkOrderAdmin(admin.ModelAdmin):
    list_display = [
        'wo_number', 'name', 'mo', 'work_center', 
        'status', 'sequence', 'estimated_duration_minutes'
    ]
    list_filter = ['status', 'work_center']
    search_fields = ['wo_number', 'name', 'mo__mo_number', 'work_center__name']
    readonly_fields = ['wo_number', 'wo_id']
    ordering = ['mo', 'sequence']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('wo_number', 'name', 'mo', 'bom_operation', 'work_center', 'sequence')
        }),
        ('Status & Assignment', {
            'fields': ('status', 'operator')
        }),
        ('Timing', {
            'fields': ('estimated_duration_minutes', 'actual_duration_minutes', 'scheduled_start_date', 'actual_start_date', 'completion_date')
        }),
        ('Notes', {
            'fields': ('notes', 'quality_notes')
        }),
        ('System Information', {
            'fields': ('wo_id',),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('mo', 'work_center', 'operator', 'bom_operation')