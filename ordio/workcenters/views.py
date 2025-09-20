from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import WorkCenter
from .serializers import WorkCenterSerializer, WorkCenterListSerializer

class WorkCenterViewSet(viewsets.ModelViewSet):
    """
    ViewSet for WorkCenter CRUD operations
    """
    queryset = WorkCenter.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'code', 'location']
    ordering_fields = ['name', 'created_at', 'cost_per_hour']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return WorkCenterListSerializer
        return WorkCenterSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get only active work centers
        GET /api/workcenters/active/
        """
        active_centers = WorkCenter.objects.filter(is_active=True)
        serializer = WorkCenterListSerializer(active_centers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def utilization(self, request, pk=None):
        """
        Get work center utilization statistics
        GET /api/workcenters/{id}/utilization/
        """
        work_center = self.get_object()
        
        # Get work orders for this work center
        from manufacturing.models import WorkOrder
        from django.utils import timezone
        from datetime import timedelta
        
        # Last 30 days
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        work_orders = WorkOrder.objects.filter(
            work_center=work_center,
            actual_start_date__gte=start_date,
            actual_start_date__lte=end_date
        )
        
        total_minutes = sum(wo.actual_duration_minutes for wo in work_orders if wo.actual_duration_minutes)
        capacity_minutes = float(work_center.get_daily_capacity_minutes()) * 30
        utilization_percentage = (total_minutes / capacity_minutes * 100) if capacity_minutes > 0 else 0
        
        return Response({
            'work_center': WorkCenterListSerializer(work_center).data,
            'period_days': 30,
            'total_work_orders': work_orders.count(),
            'total_minutes_used': total_minutes,
            'capacity_minutes': capacity_minutes,
            'utilization_percentage': round(utilization_percentage, 2)
        })
