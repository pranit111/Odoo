from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from .models import BOM, BOMComponent, BOMOperation
from .serializers import (
    BOMSerializer, BOMListSerializer, BOMComponentSerializer,
    BOMOperationSerializer, BOMComponentCreateSerializer,
    BOMOperationCreateSerializer
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
