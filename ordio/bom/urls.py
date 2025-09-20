from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BOMViewSet

router = DefaultRouter()
router.register(r'boms', BOMViewSet, basename='boms')

urlpatterns = [
    path('', include(router.urls)),
]