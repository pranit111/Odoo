from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import models
from .models import Product
from .serializers import (
    ProductSerializer, ProductListSerializer, ProductStockUpdateSerializer
)
from inventory.models import StockLedger

class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product CRUD operations
    """
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['name', 'created_at', 'current_stock']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer
    
    def get_queryset(self):
        queryset = Product.objects.all()
        product_type = self.request.query_params.get('product_type')
        is_active = self.request.query_params.get('is_active')
        
        if product_type:
            queryset = queryset.filter(product_type=product_type)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
        return queryset
    
    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        """
        Manual stock update endpoint
        POST /api/products/{id}/update_stock/
        """
        product = self.get_object()
        serializer = ProductStockUpdateSerializer(
            data=request.data,
            context={'product': product, 'request': request}
        )
        
        if serializer.is_valid():
            quantity_change = serializer.validated_data['quantity_change']
            notes = serializer.validated_data.get('notes', '')
            
            # Create stock movement
            movement_type = 'MANUAL_IN' if quantity_change > 0 else 'MANUAL_OUT'
            StockLedger.create_movement(
                product=product,
                quantity_change=quantity_change,
                movement_type=movement_type,
                reference_number=f'MANUAL-{product.sku}',
                notes=notes,
                created_by=request.user
            )
            
            return Response({
                'message': 'Stock updated successfully',
                'new_stock': product.current_stock,
                'quantity_changed': quantity_change
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """
        Get products with low stock
        GET /api/products/low_stock/
        """
        low_stock_products = Product.objects.filter(
            current_stock__lte=models.F('minimum_stock'),
            is_active=True
        )
        serializer = ProductListSerializer(low_stock_products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def out_of_stock(self, request):
        """
        Get out of stock products
        GET /api/products/out_of_stock/
        """
        out_of_stock = Product.objects.filter(current_stock__lte=0, is_active=True)
        serializer = ProductListSerializer(out_of_stock, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def finished_products(self, request):
        """
        Get all finished products
        GET /api/products/finished_products/
        """
        finished_products = Product.objects.filter(
            product_type='FINISHED_GOOD',
            is_active=True
        ).order_by('name')
        serializer = ProductListSerializer(finished_products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def raw_materials(self, request):
        """
        Get all raw materials
        GET /api/products/raw_materials/
        """
        raw_materials = Product.objects.filter(
            product_type='RAW_MATERIAL',
            is_active=True
        ).order_by('name')
        serializer = ProductListSerializer(raw_materials, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stock_movements(self, request, pk=None):
        """
        Get stock movement history for a product
        GET /api/products/{id}/stock_movements/
        """
        product = self.get_object()
        movements = product.stock_movements.all()[:50]  # Last 50 movements
        
        from inventory.serializers import StockLedgerSerializer
        serializer = StockLedgerSerializer(movements, many=True)
        return Response(serializer.data)
