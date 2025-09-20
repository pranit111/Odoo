from rest_framework import serializers
from .models import StockLedger, StockAdjustment
from products.serializers import ProductListSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class StockLedgerSerializer(serializers.ModelSerializer):
    """Serializer for Stock Ledger entries"""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    mo_number = serializers.CharField(source='related_mo.mo_number', read_only=True)
    
    class Meta:
        model = StockLedger
        fields = [
            'ledger_id', 'product', 'product_name', 'product_sku',
            'quantity_change', 'stock_before', 'stock_after',
            'movement_type', 'reference_number', 'related_mo',
            'mo_number', 'notes', 'created_by', 'created_by_name',
            'transaction_time'
        ]
        read_only_fields = [
            'ledger_id', 'stock_before', 'stock_after', 'product_name',
            'product_sku', 'created_by_name', 'mo_number', 'transaction_time'
        ]

class StockLedgerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating manual stock movements"""
    
    class Meta:
        model = StockLedger
        fields = [
            'product', 'quantity_change', 'movement_type', 
            'reference_number', 'notes'
        ]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return StockLedger.create_movement(**validated_data)

class StockAdjustmentSerializer(serializers.ModelSerializer):
    """Serializer for Stock Adjustments"""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.username', read_only=True)
    
    class Meta:
        model = StockAdjustment
        fields = [
            'adjustment_id', 'adjustment_number', 'product', 'product_name',
            'expected_quantity', 'actual_quantity', 'adjustment_quantity',
            'adjustment_type', 'reason', 'is_approved', 'approved_by',
            'approved_by_name', 'approved_at', 'created_by', 'created_by_name',
            'created_at'
        ]
        read_only_fields = [
            'adjustment_id', 'adjustment_number', 'adjustment_quantity',
            'product_name', 'is_approved', 'approved_by', 'approved_by_name',
            'approved_at', 'created_by_name', 'created_at'
        ]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class StockAdjustmentApprovalSerializer(serializers.Serializer):
    """Serializer for approving stock adjustments"""
    
    approved = serializers.BooleanField()
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)

class ProductStockSummarySerializer(serializers.Serializer):
    """Serializer for product stock summary"""
    
    product = ProductListSerializer(read_only=True)
    current_stock = serializers.DecimalField(max_digits=10, decimal_places=2)
    recent_movements = serializers.SerializerMethodField()
    
    def get_recent_movements(self, obj):
        recent = obj.stock_movements.all()[:5]
        return StockLedgerSerializer(recent, many=True).data

class StockMovementSummarySerializer(serializers.Serializer):
    """Serializer for stock movement summary"""
    
    total_movements = serializers.IntegerField()
    total_in = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_out = serializers.DecimalField(max_digits=15, decimal_places=2)
    movement_types = serializers.DictField()
    recent_movements = StockLedgerSerializer(many=True, read_only=True)