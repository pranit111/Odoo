from django.contrib import admin
from .models import ManufacturingOrder, WorkOrder, MOComponentRequirement

class MOComponentRequirementInline(admin.TabularInline):
    model = MOComponentRequirement
    extra = 0
    fields = ['component', 'quantity_per_unit', 'required_quantity', 'consumed_quantity']
    readonly_fields = ['consumed_quantity']

class WorkOrderInline(admin.TabularInline):
    model = WorkOrder
    extra = 0
    fields = ['sequence', 'name', 'work_center', 'status', 'estimated_duration_minutes', 'actual_duration_minutes']
    readonly_fields = ['wo_number', 'actual_duration_minutes']
    ordering = ['sequence']

@admin.register(ManufacturingOrder)
class ManufacturingOrderAdmin(admin.ModelAdmin):
    list_display = [
        'mo_number', 'product', 'quantity_to_produce', 'quantity_produced', 
        'status', 'priority', 'scheduled_start_date', 'progress_display', 'created_at'
    ]
    list_filter = ['status', 'priority', 'created_at', 'scheduled_start_date']
    search_fields = ['mo_number', 'product__name', 'product__sku']
    readonly_fields = [
        'mo_number', 'mo_id', 'created_at', 'updated_at'
    ]
    ordering = ['-created_at']
    inlines = [MOComponentRequirementInline, WorkOrderInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('mo_number', 'product', 'bom', 'quantity_to_produce', 'quantity_produced')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority')
        }),
        ('Scheduling', {
            'fields': ('scheduled_start_date', 'scheduled_end_date', 'actual_start_date', 'completion_date')
        }),
        ('Assignment & Notes', {
            'fields': ('assignee', 'created_by', 'notes')
        }),
        ('System Information', {
            'fields': ('mo_id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'product', 'bom', 'assignee', 'created_by'
        ).prefetch_related('component_requirements', 'work_orders')
    
    def progress_display(self, obj):
        """Display progress as percentage"""
        return f"{obj.get_progress_percentage():.1f}%"
    progress_display.short_description = 'Progress'
    
    def component_availability_status(self, obj):
        """Display component availability status"""
        if obj.check_component_availability():
            return "✅ All Available"
        else:
            return "❌ Shortage"
    component_availability_status.short_description = 'Components'

@admin.register(WorkOrder)
class WorkOrderAdmin(admin.ModelAdmin):
    list_display = [
        'wo_number', 'name', 'mo', 'work_center', 
        'status', 'sequence', 'duration_display', 'efficiency_display', 'operator'
    ]
    list_filter = ['status', 'work_center', 'operator']
    search_fields = ['wo_number', 'name', 'mo__mo_number', 'work_center__name']
    readonly_fields = [
        'wo_number', 'wo_id', 'created_at', 'updated_at'
    ]
    ordering = ['mo', 'sequence']
    
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('wo_number', 'name', 'mo', 'bom_operation', 'work_center', 'sequence')
        }),
        ('Status & Assignment', {
            'fields': ('status', 'operator')
        }),
        ('Timing', {
            'fields': (
                'estimated_duration_minutes', 'actual_duration_minutes', 
                'scheduled_start_date', 'actual_start_date', 'completion_date'
            )
        }),
        ('Notes', {
            'fields': ('notes', 'quality_notes')
        }),
        ('System Information', {
            'fields': ('wo_id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'mo', 'work_center', 'operator', 'bom_operation'
        )
    
    def duration_display(self, obj):
        """Display duration in hours:minutes format"""
        hours = obj.estimated_duration_minutes // 60
        minutes = obj.estimated_duration_minutes % 60
        actual_hours = obj.actual_duration_minutes // 60
        actual_minutes = obj.actual_duration_minutes % 60
        return f"{hours:02d}:{minutes:02d} / {actual_hours:02d}:{actual_minutes:02d}"
    duration_display.short_description = 'Est/Actual Duration'
    
    def efficiency_display(self, obj):
        """Display efficiency percentage"""
        efficiency = obj.get_efficiency_percentage()
        if efficiency > 0:
            return f"{efficiency:.1f}%"
        return "N/A"
    efficiency_display.short_description = 'Efficiency'

@admin.register(MOComponentRequirement)
class MOComponentRequirementAdmin(admin.ModelAdmin):
    list_display = [
        'mo', 'component', 'quantity_per_unit', 'required_quantity', 
        'consumed_quantity', 'remaining_quantity', 'availability_status'
    ]
    list_filter = ['mo__status', 'component__product_type']
    search_fields = ['mo__mo_number', 'component__name', 'component__sku']
    readonly_fields = ['requirement_id', 'remaining_quantity', 'is_satisfied', 'created_at', 'updated_at']
    ordering = ['mo__mo_number', 'component__name']
    
    fieldsets = (
        ('Component Information', {
            'fields': ('mo', 'component')
        }),
        ('Quantities', {
            'fields': ('quantity_per_unit', 'required_quantity', 'consumed_quantity', 'remaining_quantity')
        }),
        ('Status', {
            'fields': ('is_satisfied',)
        }),
        ('System Information', {
            'fields': ('requirement_id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('mo', 'component')
    
    def availability_status(self, obj):
        """Display availability status"""
        if obj.is_satisfied:
            return "✅ Available"
        else:
            shortage = obj.required_quantity - obj.component.current_stock
            return f"❌ Short by {shortage}"
    availability_status.short_description = 'Availability'