from django.contrib import admin
from .models import WorkCenter

@admin.register(WorkCenter)
class WorkCenterAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'code', 'cost_per_hour', 'capacity_hours_per_day', 
        'location', 'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'code', 'location']
    readonly_fields = ['work_center_id', 'created_at', 'updated_at']
    ordering = ['name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'location', 'description')
        }),
        ('Capacity & Costing', {
            'fields': ('cost_per_hour', 'capacity_hours_per_day')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('System Information', {
            'fields': ('work_center_id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
