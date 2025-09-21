from rest_framework import serializers
from .models import ManufacturingOrder, WorkOrder, MOComponentRequirement
from bom.serializers import BOMListSerializer
from products.serializers import ProductListSerializer
from workcenters.serializers import WorkCenterListSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class MOComponentRequirementSerializer(serializers.ModelSerializer):
    """Serializer for MO Component Requirements"""
    
    component_name = serializers.CharField(source='component.name', read_only=True)
    component_sku = serializers.CharField(source='component.sku', read_only=True)
    available_stock = serializers.DecimalField(source='component.current_stock', read_only=True, max_digits=10, decimal_places=2)
    is_satisfied = serializers.BooleanField(read_only=True)
    remaining_quantity = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)
    shortage = serializers.SerializerMethodField()
    
    class Meta:
        model = MOComponentRequirement
        fields = [
            'requirement_id', 'component', 'component_name', 'component_sku',
            'quantity_per_unit', 'required_quantity', 'consumed_quantity',
            'available_stock', 'is_satisfied', 'remaining_quantity', 'shortage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['requirement_id', 'created_at', 'updated_at']
    
    def get_shortage(self, obj):
        """Calculate shortage: max(0, required - available)"""
        shortage = obj.required_quantity - obj.component.current_stock
        return max(0, shortage)

class WorkOrderSerializer(serializers.ModelSerializer):
    """Serializer for Work Orders"""
    
    work_center_name = serializers.CharField(source='work_center.name', read_only=True)
    operator_name = serializers.CharField(source='operator.username', read_only=True)
    efficiency_percentage = serializers.FloatField(source='get_efficiency_percentage', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = WorkOrder
        fields = [
            'wo_id', 'wo_number', 'name', 'work_center', 'work_center_name',
            'sequence', 'estimated_duration_minutes', 'actual_duration_minutes',
            'status', 'operator', 'operator_name', 'scheduled_start_date',
            'actual_start_date', 'completion_date', 'notes', 'quality_notes',
            'created_at', 'updated_at', 'efficiency_percentage', 'is_overdue'
        ]
        read_only_fields = [
            'wo_id', 'wo_number', 'created_at', 'updated_at', 
            'work_center_name', 'operator_name', 'efficiency_percentage', 'is_overdue'
        ]

class WorkOrderUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating work orders"""
    
    class Meta:
        model = WorkOrder
        fields = ['status', 'operator', 'notes', 'quality_notes', 'actual_duration_minutes']

class ManufacturingOrderSerializer(serializers.ModelSerializer):
    """Serializer for Manufacturing Orders"""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    bom_name = serializers.CharField(source='bom.name', read_only=True)
    assignee_name = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    work_orders = WorkOrderSerializer(many=True, read_only=True)
    component_requirements = MOComponentRequirementSerializer(many=True, read_only=True)
    progress_percentage = serializers.FloatField(source='get_progress_percentage', read_only=True)
    total_estimated_cost = serializers.FloatField(source='get_total_estimated_cost', read_only=True)
    component_availability_check = serializers.BooleanField(source='check_component_availability', read_only=True)
    can_start = serializers.SerializerMethodField()
    
    class Meta:
        model = ManufacturingOrder
        fields = [
            'mo_id', 'mo_number', 'product', 'product_name', 'bom', 'bom_name',
            'quantity_to_produce', 'status', 'priority', 'scheduled_start_date',
            'scheduled_end_date', 'actual_start_date', 'completion_date',
            'assignee', 'assignee_name', 'quantity_produced', 'notes',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
            'work_orders', 'component_requirements', 'progress_percentage', 
            'total_estimated_cost', 'component_availability_check', 'can_start'
        ]
        read_only_fields = [
            'mo_id', 'mo_number', 'created_at', 'updated_at', 'product_name',
            'bom_name', 'assignee_name', 'created_by_name', 'progress_percentage',
            'total_estimated_cost', 'component_availability_check', 'can_start'
        ]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        mo = super().create(validated_data)
        # Populate components from BOM after creation
        mo.populate_components_from_bom()
        return mo
    
    def get_assignee_name(self, obj):
        """Return assignee username or None if not assigned"""
        return obj.assignee.username if obj.assignee else None
    
    def get_can_start(self, obj):
        """Return whether the MO can be started"""
        return obj.can_start()

class ManufacturingOrderListSerializer(serializers.ModelSerializer):
    """Simplified serializer for MO lists"""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    assignee_name = serializers.SerializerMethodField()
    progress_percentage = serializers.FloatField(source='get_progress_percentage', read_only=True)
    work_order_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ManufacturingOrder
        fields = [
            'mo_id', 'mo_number', 'product_name', 'quantity_to_produce',
            'status', 'priority', 'scheduled_start_date', 'assignee_name',
            'progress_percentage', 'work_order_count', 'created_at'
        ]
    
    def get_work_order_count(self, obj):
        return obj.work_orders.count()
    
    def get_assignee_name(self, obj):
        """Return assignee username or None if not assigned"""
        return obj.assignee.username if obj.assignee else None

class ManufacturingOrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Manufacturing Orders"""
    
    class Meta:
        model = ManufacturingOrder
        fields = [
            'product', 'bom', 'quantity_to_produce', 'priority',
            'scheduled_start_date', 'scheduled_end_date', 'assignee', 'notes'
        ]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        mo = super().create(validated_data)
        # Populate components from BOM after creation
        mo.populate_components_from_bom()
        return mo

class ComponentRequirementSerializer(serializers.Serializer):
    """Serializer for component requirements display"""
    
    component_id = serializers.UUIDField()
    component_name = serializers.CharField()
    component_sku = serializers.CharField()
    quantity_per_unit = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_required = serializers.DecimalField(max_digits=10, decimal_places=2)
    available_stock = serializers.DecimalField(max_digits=10, decimal_places=2)
    shortage = serializers.DecimalField(max_digits=10, decimal_places=2)
    is_sufficient = serializers.BooleanField()

class WorkOrderActionSerializer(serializers.Serializer):
    """Serializer for work order actions (start, pause, complete)"""
    
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    actual_duration = serializers.IntegerField(required=False, min_value=0)
    operator = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role__in=['OPERATOR', 'MANAGER']),
        required=False
    )