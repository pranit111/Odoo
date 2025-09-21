from rest_framework import serializers
from .models import BOM, BOMComponent, BOMOperation
from products.serializers import ProductListSerializer
from workcenters.serializers import WorkCenterListSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class BOMComponentSerializer(serializers.ModelSerializer):
    """Serializer for BOM Components"""
    
    component_name = serializers.CharField(source='component.name', read_only=True)
    component_sku = serializers.CharField(source='component.sku', read_only=True)
    component_unit_cost = serializers.DecimalField(source='component.unit_cost', max_digits=10, decimal_places=2, read_only=True)
    total_cost = serializers.DecimalField(source='get_total_cost', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = BOMComponent
        fields = [
            'id', 'component', 'component_name', 'component_sku', 
            'quantity', 'component_unit_cost', 
            'total_cost', 'notes'
        ]

class BOMOperationSerializer(serializers.ModelSerializer):
    """Serializer for BOM Operations"""
    
    bom_name = serializers.CharField(source='bom.name', read_only=True)
    bom_product_name = serializers.CharField(source='bom.product.name', read_only=True)
    work_center_name = serializers.CharField(source='work_center.name', read_only=True)
    work_center_code = serializers.CharField(source='work_center.code', read_only=True)
    operation_cost = serializers.SerializerMethodField()
    total_time = serializers.SerializerMethodField()
    
    class Meta:
        model = BOMOperation
        fields = [
            'id', 'bom', 'bom_name', 'bom_product_name', 'name', 'sequence', 
            'work_center', 'work_center_name', 'work_center_code', 'duration_minutes', 
            'setup_time_minutes', 'description', 'operation_cost', 'total_time'
        ]
        read_only_fields = ['bom_name', 'bom_product_name', 'work_center_name', 'work_center_code']
    
    def get_operation_cost(self, obj):
        return obj.get_operation_cost(quantity=1)
    
    def get_total_time(self, obj):
        return obj.get_total_time_minutes(quantity=1)

class BOMSerializer(serializers.ModelSerializer):
    """Serializer for BOM model"""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    components = BOMComponentSerializer(many=True, read_only=True)
    operations = BOMOperationSerializer(many=True, read_only=True)
    
    total_component_cost = serializers.DecimalField(source='get_total_component_cost', max_digits=10, decimal_places=2, read_only=True)
    total_operation_cost = serializers.DecimalField(source='get_total_operation_cost', max_digits=10, decimal_places=2, read_only=True)
    total_bom_cost = serializers.DecimalField(source='get_total_bom_cost', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = BOM
        fields = [
            'bom_id', 'product', 'product_name', 'product_sku', 'name', 
            'version', 'is_active', 'description', 'created_by', 
            'created_by_name', 'created_at', 'updated_at', 'components', 
            'operations', 'total_component_cost', 'total_operation_cost', 
            'total_bom_cost'
        ]
        read_only_fields = [
            'bom_id', 'created_at', 'updated_at', 'product_name', 
            'product_sku', 'created_by_name', 'total_component_cost',
            'total_operation_cost', 'total_bom_cost'
        ]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class BOMListSerializer(serializers.ModelSerializer):
    """Simplified serializer for BOM lists"""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    component_count = serializers.SerializerMethodField()
    operation_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BOM
        fields = [
            'bom_id', 'product_name', 'name', 'version', 'is_active',
            'component_count', 'operation_count', 'created_at'
        ]
    
    def get_component_count(self, obj):
        return obj.components.count()
    
    def get_operation_count(self, obj):
        return obj.operations.count()

class BOMComponentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating BOM components"""
    
    class Meta:
        model = BOMComponent
        fields = ['component', 'quantity', 'notes']

class BOMOperationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating BOM operations"""
    
    class Meta:
        model = BOMOperation
        fields = [
            'name', 'sequence', 'work_center', 'duration_minutes',
            'setup_time_minutes', 'description'
        ]
    
    def validate(self, data):
        """Ensure sequence is unique within the BOM"""
        # Note: BOM validation will be handled in the view since bom is passed via save()
        # We can't validate sequence uniqueness here without the BOM instance
        return data

class BOMOperationListSerializer(serializers.ModelSerializer):
    """Simplified serializer for BOM operations list"""
    
    bom_name = serializers.CharField(source='bom.name', read_only=True)
    bom_product_name = serializers.CharField(source='bom.product.name', read_only=True)
    work_center_name = serializers.CharField(source='work_center.name', read_only=True)
    operation_cost = serializers.SerializerMethodField()
    
    class Meta:
        model = BOMOperation
        fields = [
            'id', 'bom', 'bom_name', 'bom_product_name', 'name', 'sequence',
            'work_center_name', 'duration_minutes', 'operation_cost'
        ]
    
    def get_operation_cost(self, obj):
        return obj.get_operation_cost(quantity=1)

class BOMOperationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating BOM operations"""
    
    class Meta:
        model = BOMOperation
        fields = [
            'name', 'sequence', 'work_center', 'duration_minutes',
            'setup_time_minutes', 'description'
        ]
    
    def validate_sequence(self, value):
        """Ensure sequence is unique within the BOM (excluding current instance)"""
        instance = getattr(self, 'instance', None)
        if instance:
            existing = BOMOperation.objects.filter(
                bom=instance.bom, 
                sequence=value
            ).exclude(id=instance.id)
            
            if existing.exists():
                raise serializers.ValidationError(
                    f'Sequence {value} already exists for this BOM'
                )
        
        return value