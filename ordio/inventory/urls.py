from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StockLedgerViewSet, StockAdjustmentViewSet, InventoryReportView

router = DefaultRouter()
router.register(r'stock-ledger', StockLedgerViewSet, basename='stock-ledger')
router.register(r'stock-adjustments', StockAdjustmentViewSet, basename='stock-adjustments')
router.register(r'inventory-reports', InventoryReportView, basename='inventory-reports')

urlpatterns = [
    path('', include(router.urls)),
]