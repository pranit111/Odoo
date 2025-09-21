from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import ManufacturingOrder, WorkOrder, MOComponentRequirement
from .serializers import (
    ManufacturingOrderSerializer, ManufacturingOrderListSerializer,
    ManufacturingOrderCreateSerializer, WorkOrderSerializer,
    WorkOrderUpdateSerializer, ComponentRequirementSerializer,
    WorkOrderActionSerializer, MOComponentRequirementSerializer
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
    
    def create(self, request, *args, **kwargs):
        """
        Override create to return full MO data after creation
        This ensures frontend gets mo_id for auto-confirmation
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        
        # Return full MO data using the regular serializer
        response_serializer = ManufacturingOrderSerializer(instance, context={'request': request})
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

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
            
            # Update MO status to DONE and set completion date
            mo.status = 'DONE'
            mo.completion_date = timezone.now()
            mo.quantity_produced = mo.quantity_to_produce
            mo.save(update_fields=['status', 'completion_date', 'quantity_produced'])
            
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
        requirements = mo.component_requirements.all()
        serializer = MOComponentRequirementSerializer(requirements, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_component(self, request, pk=None):
        """
        Add a component requirement to MO
        POST /api/manufacturing-orders/{id}/add_component/
        """
        mo = self.get_object()
        
        if mo.status not in ['DRAFT', 'CONFIRMED']:
            return Response(
                {'error': 'Can only add components to draft or confirmed MOs'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = MOComponentRequirementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(mo=mo)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['put', 'patch'])
    def update_component(self, request, pk=None):
        """
        Update a component requirement
        PUT/PATCH /api/manufacturing-orders/{id}/update_component/?component_id=xxx
        """
        mo = self.get_object()
        component_id = request.query_params.get('component_id')
        
        if not component_id:
            return Response(
                {'error': 'component_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            component_req = mo.component_requirements.get(requirement_id=component_id)
        except MOComponentRequirement.DoesNotExist:
            return Response(
                {'error': 'Component requirement not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        partial = request.method == 'PATCH'
        serializer = MOComponentRequirementSerializer(component_req, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'])
    def remove_component(self, request, pk=None):
        """
        Remove a component requirement
        DELETE /api/manufacturing-orders/{id}/remove_component/?component_id=xxx
        """
        mo = self.get_object()
        component_id = request.query_params.get('component_id')
        
        if not component_id:
            return Response(
                {'error': 'component_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            component_req = mo.component_requirements.get(requirement_id=component_id)
            component_req.delete()
            return Response({'message': 'Component requirement removed'})
        except MOComponentRequirement.DoesNotExist:
            return Response(
                {'error': 'Component requirement not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
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