from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from .models import ManufacturingOrder, WorkOrder
from .serializers import (
    ManufacturingOrderSerializer, ManufacturingOrderListSerializer,
    ManufacturingOrderCreateSerializer, WorkOrderSerializer,
    WorkOrderUpdateSerializer, ComponentRequirementSerializer,
    WorkOrderActionSerializer
)
from inventory.models import StockOperations

class ManufacturingOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Manufacturing Order CRUD operations
    """
    queryset = ManufacturingOrder.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['mo_number', 'product__name', 'product__sku']
    ordering_fields = ['mo_number', 'created_at', 'scheduled_start_date']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ManufacturingOrderListSerializer
        elif self.action == 'create':
            return ManufacturingOrderCreateSerializer
        return ManufacturingOrderSerializer
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """
        Confirm MO and create work orders
        POST /api/manufacturing-orders/{id}/confirm/
        """
        mo = self.get_object()
        
        if mo.status != 'DRAFT':
            return Response(
                {'error': 'Only draft MOs can be confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not mo.check_component_availability():
            return Response(
                {'error': 'Insufficient components available'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        mo.status = 'CONFIRMED'
        mo.save()
        mo.create_work_orders()
        
        return Response({
            'message': 'MO confirmed and work orders created',
            'mo': ManufacturingOrderSerializer(mo, context={'request': request}).data
        })
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Complete MO and process stock movements
        POST /api/manufacturing-orders/{id}/complete/
        """
        mo = self.get_object()
        
        if mo.status != 'IN_PROGRESS':
            return Response(
                {'error': 'Only in-progress MOs can be completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if all work orders are completed
        pending_wos = mo.work_orders.filter(status__in=['PENDING', 'IN_PROGRESS', 'PAUSED'])
        if pending_wos.exists():
            return Response(
                {'error': 'All work orders must be completed first'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Process stock movements
            movements = StockOperations.complete_manufacturing_order(mo)
            
            return Response({
                'message': 'MO completed successfully',
                'consumed_components': len(movements['consumed']),
                'produced_quantity': mo.quantity_to_produce,
                'mo': ManufacturingOrderSerializer(mo, context={'request': request}).data
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def component_requirements(self, request, pk=None):
        """
        Get component requirements with availability
        GET /api/manufacturing-orders/{id}/component_requirements/
        """
        mo = self.get_object()
        requirements = mo.get_required_components()
        
        serializer = ComponentRequirementSerializer(requirements, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Get MO dashboard data
        GET /api/manufacturing-orders/dashboard/
        """
        mos = ManufacturingOrder.objects.all()
        
        stats = {
            'total_mos': mos.count(),
            'draft': mos.filter(status='DRAFT').count(),
            'confirmed': mos.filter(status='CONFIRMED').count(),
            'in_progress': mos.filter(status='IN_PROGRESS').count(),
            'completed': mos.filter(status='DONE').count(),
            'canceled': mos.filter(status='CANCELED').count(),
        }
        
        # Recent MOs
        recent_mos = mos[:10]
        recent_data = ManufacturingOrderListSerializer(recent_mos, many=True).data
        
        return Response({
            'statistics': stats,
            'recent_orders': recent_data
        })

class WorkOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Work Order operations
    """
    queryset = WorkOrder.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['wo_number', 'name', 'mo__mo_number']
    ordering_fields = ['wo_number', 'created_at', 'scheduled_start_date']
    ordering = ['mo', 'sequence']
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return WorkOrderUpdateSerializer
        return WorkOrderSerializer
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """
        Start work order
        POST /api/work-orders/{id}/start/
        """
        wo = self.get_object()
        serializer = WorkOrderActionSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                operator = serializer.validated_data.get('operator')
                notes = serializer.validated_data.get('notes', '')
                
                wo.start_work(operator=operator)
                if notes:
                    wo.notes += f"\n[STARTED]: {notes}"
                    wo.save()
                
                return Response({
                    'message': 'Work order started',
                    'wo': WorkOrderSerializer(wo).data
                })
            except ValidationError as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """
        Pause work order
        POST /api/work-orders/{id}/pause/
        """
        wo = self.get_object()
        serializer = WorkOrderActionSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                notes = serializer.validated_data.get('notes', '')
                wo.pause_work(notes=notes)
                
                return Response({
                    'message': 'Work order paused',
                    'wo': WorkOrderSerializer(wo).data
                })
            except ValidationError as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Complete work order
        POST /api/work-orders/{id}/complete/
        """
        wo = self.get_object()
        serializer = WorkOrderActionSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                notes = serializer.validated_data.get('notes', '')
                actual_duration = serializer.validated_data.get('actual_duration')
                
                wo.complete_work(notes=notes, actual_duration=actual_duration)
                
                return Response({
                    'message': 'Work order completed',
                    'wo': WorkOrderSerializer(wo).data
                })
            except ValidationError as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """
        Get work orders assigned to current user
        GET /api/work-orders/my_tasks/
        """
        my_wos = WorkOrder.objects.filter(operator=request.user)
        serializer = WorkOrderSerializer(my_wos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        Get all pending work orders
        GET /api/work-orders/pending/
        """
        pending_wos = WorkOrder.objects.filter(status='PENDING')
        serializer = WorkOrderSerializer(pending_wos, many=True)
        return Response(serializer.data)