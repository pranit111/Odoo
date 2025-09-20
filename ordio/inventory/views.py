from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Sum, Q, F
from django.utils import timezone
from datetime import timedelta
from .models import StockLedger, StockAdjustment, StockOperations
from .serializers import (
    StockLedgerSerializer, StockLedgerCreateSerializer,
    StockAdjustmentSerializer, StockAdjustmentApprovalSerializer,
    ProductStockSummarySerializer, StockMovementSummarySerializer
)
from products.models import Product

class StockLedgerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Stock Ledger operations
    """
    queryset = StockLedger.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['product__name', 'product__sku', 'reference_number', 'notes']
    ordering_fields = ['transaction_time', 'quantity_change']
    ordering = ['-transaction_time']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StockLedgerCreateSerializer
        return StockLedgerSerializer
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get stock movement summary
        GET /api/stock-ledger/summary/
        """
        # Filter by date range if provided
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        movements = StockLedger.objects.filter(transaction_time__gte=start_date)
        
        # Calculate totals
        total_in = movements.filter(quantity_change__gt=0).aggregate(
            total=Sum('quantity_change')
        )['total'] or 0
        
        total_out = movements.filter(quantity_change__lt=0).aggregate(
            total=Sum('quantity_change')
        )['total'] or 0
        
        # Movement types breakdown
        movement_types = {}
        for movement_type, display_name in StockLedger.MOVEMENT_TYPES:
            count = movements.filter(movement_type=movement_type).count()
            if count > 0:
                movement_types[movement_type] = {
                    'display_name': display_name,
                    'count': count
                }
        
        # Recent movements
        recent = movements[:20]
        
        return Response({
            'period_days': days,
            'total_movements': movements.count(),
            'total_in': total_in,
            'total_out': abs(total_out),
            'net_change': total_in + total_out,
            'movement_types': movement_types,
            'recent_movements': StockLedgerSerializer(recent, many=True).data
        })
    
    @action(detail=False, methods=['get'])
    def by_product(self, request):
        """
        Get stock movements for a specific product
        GET /api/stock-ledger/by_product/?product_id={uuid}
        """
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response(
                {'error': 'product_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        movements = StockLedger.objects.filter(product_id=product_id)
        serializer = StockLedgerSerializer(movements, many=True)
        return Response(serializer.data)

class StockAdjustmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Stock Adjustment operations
    """
    queryset = StockAdjustment.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['adjustment_number', 'product__name', 'reason']
    ordering_fields = ['created_at', 'adjustment_number']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve stock adjustment
        POST /api/stock-adjustments/{id}/approve/
        """
        adjustment = self.get_object()
        serializer = StockAdjustmentApprovalSerializer(data=request.data)
        
        if serializer.is_valid():
            approved = serializer.validated_data['approved']
            notes = serializer.validated_data.get('notes', '')
            
            if approved:
                try:
                    adjustment.approve(request.user)
                    return Response({
                        'message': 'Stock adjustment approved and processed',
                        'adjustment': StockAdjustmentSerializer(adjustment).data
                    })
                except Exception as e:
                    return Response(
                        {'error': str(e)},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                # Reject adjustment
                adjustment.delete()
                return Response({
                    'message': 'Stock adjustment rejected and deleted'
                })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        Get pending adjustments requiring approval
        GET /api/stock-adjustments/pending/
        """
        pending = StockAdjustment.objects.filter(is_approved=False)
        serializer = StockAdjustmentSerializer(pending, many=True)
        return Response(serializer.data)

class InventoryReportView(viewsets.ViewSet):
    """
    ViewSet for inventory reports and analytics
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def stock_summary(self, request):
        """
        Get current stock summary for all products
        GET /api/inventory-reports/stock_summary/
        """
        products = Product.objects.filter(is_active=True)
        
        # Add stock status counts
        total_products = products.count()
        in_stock = products.filter(current_stock__gt=0).count()
        out_of_stock = products.filter(current_stock__lte=0).count()
        low_stock = products.filter(
            current_stock__lte=F('minimum_stock'),
            current_stock__gt=0
        ).count()
        
        # Get products with recent movements
        recent_movements = StockLedger.objects.select_related('product').all()[:100]
        
        return Response({
            'summary': {
                'total_products': total_products,
                'in_stock': in_stock,
                'out_of_stock': out_of_stock,
                'low_stock': low_stock
            },
            'recent_movements': StockLedgerSerializer(recent_movements, many=True).data
        })
    
    @action(detail=False, methods=['get'])
    def consumption_analysis(self, request):
        """
        Get consumption analysis for components
        GET /api/inventory-reports/consumption_analysis/
        """
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        consumption_data = StockLedger.objects.filter(
            movement_type='MO_CONSUMPTION',
            transaction_time__gte=start_date
        ).values(
            'product__name', 'product__sku'
        ).annotate(
            total_consumed=Sum('quantity_change')
        ).order_by('total_consumed')
        
        return Response({
            'period_days': days,
            'consumption_data': list(consumption_data)
        })
    
    @action(detail=False, methods=['get'])
    def production_analysis(self, request):
        """
        Get production analysis for finished goods
        GET /api/inventory-reports/production_analysis/
        """
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        production_data = StockLedger.objects.filter(
            movement_type='MO_PRODUCTION',
            transaction_time__gte=start_date
        ).values(
            'product__name', 'product__sku'
        ).annotate(
            total_produced=Sum('quantity_change')
        ).order_by('-total_produced')
        
        return Response({
            'period_days': days,
            'production_data': list(production_data)
        })
