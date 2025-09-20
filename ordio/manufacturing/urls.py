from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ManufacturingOrderViewSet, WorkOrderViewSet

router = DefaultRouter()
router.register(r'manufacturing-orders', ManufacturingOrderViewSet, basename='manufacturing-orders')
router.register(r'work-orders', WorkOrderViewSet, basename='work-orders')

urlpatterns = [
    path('', include(router.urls)),
]