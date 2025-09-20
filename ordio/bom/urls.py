from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BOMViewSet, BOMOperationViewSet

router = DefaultRouter()
router.register(r'boms', BOMViewSet, basename='boms')
router.register(r'bom-operations', BOMOperationViewSet, basename='bom-operations')

urlpatterns = [
    path('', include(router.urls)),
]