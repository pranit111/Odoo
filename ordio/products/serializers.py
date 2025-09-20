from rest_framework import serializers
from .models import Product
from django.contrib.auth import get_user_model

User = get_user_model()

class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    stock_status = serializers.CharField(source='get_stock_status', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'product_id', 'name', 'sku', 'product_type', 'current_stock',
            'minimum_stock', 'unit_of_measure', 'unit_cost', 'description',
            'is_active', 'created_by', 'created_by_name', 'created_at',
            'updated_at', 'stock_status', 'is_low_stock'
        ]
        read_only_fields = ['product_id', 'created_at', 'updated_at', 'created_by_name', 'stock_status', 'is_low_stock']
    
    def create(self, validated_data):
        # Set created_by to current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ProductListSerializer(serializers.ModelSerializer):
    """Simplified serializer for product lists"""
    
    stock_status = serializers.CharField(source='get_stock_status', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'product_id', 'name', 'sku', 'product_type', 'current_stock',
            'unit_of_measure', 'stock_status', 'is_active'
        ]

class ProductStockUpdateSerializer(serializers.Serializer):
    """Serializer for updating product stock"""
    
    quantity_change = serializers.DecimalField(max_digits=10, decimal_places=2)
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_quantity_change(self, value):
        product = self.context.get('product')
        if product and value < 0:
            if not product.can_consume(abs(value)):
                raise serializers.ValidationError(
                    f"Insufficient stock. Available: {product.current_stock}, "
                    f"Requested: {abs(value)}"
                )
        return value