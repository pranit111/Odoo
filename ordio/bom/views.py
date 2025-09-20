from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from django.db import models
from .models import BOM, BOMComponent, BOMOperation
from .serializers import (
    BOMSerializer, BOMListSerializer, BOMComponentSerializer,
    BOMOperationSerializer, BOMComponentCreateSerializer,
    BOMOperationCreateSerializer, BOMOperationListSerializer,
    BOMOperationUpdateSerializer
)

class BOMViewSet(viewsets.ModelViewSet):
    """
    ViewSet for BOM CRUD operations
    """
    queryset = BOM.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'product__name', 'product__sku']
    ordering_fields = ['name', 'created_at', 'product__name']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BOMListSerializer
        return BOMSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get only active BOMs
        GET /api/boms/active/
        """
        active_boms = BOM.objects.filter(is_active=True)
        serializer = BOMListSerializer(active_boms, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_component(self, request, pk=None):
        """
        Add a component to BOM
        POST /api/boms/{id}/add_component/
        """
        bom = self.get_object()
        serializer = BOMComponentCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(bom=bom)
            return Response(
                BOMComponentSerializer(serializer.instance).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_operation(self, request, pk=None):
        """
        Add an operation to BOM
        POST /api/boms/{id}/add_operation/
        """
        bom = self.get_object()
        serializer = BOMOperationCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(bom=bom)
            return Response(
                BOMOperationSerializer(serializer.instance).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'])
    def remove_component(self, request, pk=None):
        """
        Remove a component from BOM
        DELETE /api/boms/{id}/remove_component/{component_id}/
        """
        bom = self.get_object()
        component_id = request.data.get('component_id')
        
        try:
            component = BOMComponent.objects.get(bom=bom, id=component_id)
            component.delete()
            return Response({'message': 'Component removed successfully'})
        except BOMComponent.DoesNotExist:
            return Response(
                {'error': 'Component not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['delete'])
    def remove_operation(self, request, pk=None):
        """
        Remove an operation from BOM
        DELETE /api/boms/{id}/remove_operation/{operation_id}/
        """
        bom = self.get_object()
        operation_id = request.data.get('operation_id')
        
        try:
            operation = BOMOperation.objects.get(bom=bom, id=operation_id)
            operation.delete()
            return Response({'message': 'Operation removed successfully'})
        except BOMOperation.DoesNotExist:
            return Response(
                {'error': 'Operation not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def clone(self, request, pk=None):
        """
        Clone a BOM with new version
        POST /api/boms/{id}/clone/
        """
        original_bom = self.get_object()
        new_version = request.data.get('version', f'{original_bom.version}-copy')
        new_name = request.data.get('name', f'{original_bom.name} (Copy)')
        
        # Deactivate original if requested
        if request.data.get('deactivate_original', False):
            original_bom.is_active = False
            original_bom.save()
        
        # Clone BOM
        new_bom = BOM.objects.create(
            product=original_bom.product,
            name=new_name,
            version=new_version,
            description=f'Cloned from {original_bom.name}',
            created_by=request.user,
            is_active=not original_bom.is_active  # Make active if original was deactivated
        )
        
        # Clone components
        for component in original_bom.components.all():
            BOMComponent.objects.create(
                bom=new_bom,
                component=component.component,
                quantity=component.quantity,
                unit_of_measure=component.unit_of_measure,
                notes=component.notes
            )
        
        # Clone operations
        for operation in original_bom.operations.all():
            BOMOperation.objects.create(
                bom=new_bom,
                name=operation.name,
                sequence=operation.sequence,
                work_center=operation.work_center,
                duration_minutes=operation.duration_minutes,
                setup_time_minutes=operation.setup_time_minutes,
                description=operation.description
            )
        
        return Response(
            BOMSerializer(new_bom, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class BOMOperationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for BOM Operation CRUD operations
    """
    queryset = BOMOperation.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'bom__name', 'bom__product__name', 'work_center__name']
    ordering_fields = ['name', 'sequence', 'bom__name', 'work_center__name']
    ordering = ['bom__product__name', 'sequence']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BOMOperationListSerializer
        elif self.action in ['update', 'partial_update']:
            return BOMOperationUpdateSerializer
        elif self.action == 'create':
            return BOMOperationCreateSerializer
        return BOMOperationSerializer
    
    def get_queryset(self):
        """Filter operations by BOM if specified"""
        queryset = BOMOperation.objects.all()
        bom_id = self.request.query_params.get('bom', None)
        if bom_id:
            queryset = queryset.filter(bom__bom_id=bom_id)
        return queryset
    
    @action(detail=False, methods=['get'])
    def by_bom(self, request):
        """
        Get operations for a specific BOM
        GET /api/bom-operations/by_bom/?bom_id={uuid}
        """
        bom_id = request.query_params.get('bom_id')
        if not bom_id:
            return Response(
                {'error': 'bom_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        operations = BOMOperation.objects.filter(bom__bom_id=bom_id).order_by('sequence')
        serializer = BOMOperationListSerializer(operations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_work_center(self, request):
        """
        Get operations for a specific work center
        GET /api/bom-operations/by_work_center/?work_center_id={uuid}
        """
        work_center_id = request.query_params.get('work_center_id')
        if not work_center_id:
            return Response(
                {'error': 'work_center_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        operations = BOMOperation.objects.filter(work_center__work_center_id=work_center_id)
        serializer = BOMOperationListSerializer(operations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """
        Duplicate an operation to another BOM
        POST /api/bom-operations/{id}/duplicate/
        """
        operation = self.get_object()
        target_bom_id = request.data.get('target_bom_id')
        sequence = request.data.get('sequence')
        
        if not target_bom_id:
            return Response(
                {'error': 'target_bom_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            target_bom = BOM.objects.get(bom_id=target_bom_id)
            
            # Check if sequence already exists
            if sequence and BOMOperation.objects.filter(bom=target_bom, sequence=sequence).exists():
                return Response(
                    {'error': f'Sequence {sequence} already exists in target BOM'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Find next available sequence if not provided
            if not sequence:
                max_seq = BOMOperation.objects.filter(bom=target_bom).aggregate(
                    max_seq=models.Max('sequence')
                )['max_seq'] or 0
                sequence = max_seq + 1
            
            # Create duplicate
            new_operation = BOMOperation.objects.create(
                bom=target_bom,
                name=operation.name,
                sequence=sequence,
                work_center=operation.work_center,
                duration_minutes=operation.duration_minutes,
                setup_time_minutes=operation.setup_time_minutes,
                description=operation.description
            )
            
            return Response(
                BOMOperationSerializer(new_operation).data,
                status=status.HTTP_201_CREATED
            )
            
        except BOM.DoesNotExist:
            return Response(
                {'error': 'Target BOM not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
