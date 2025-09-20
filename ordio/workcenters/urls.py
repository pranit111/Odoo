from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkCenterViewSet

router = DefaultRouter()
router.register(r'workcenters', WorkCenterViewSet, basename='workcenters')

urlpatterns = [
    path('', include(router.urls)),
]