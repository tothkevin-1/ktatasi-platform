from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    TantargyViewSet,
    KurzusViewSet,
    FeladatViewSet,
    BeadasViewSet,
    HirViewSet,
    RanglistaView,
    DashboardView,
    ChangePasswordView,
    JegyekView,
    DicsosegfalView,
    AIErtekelesView,
    AIChatView,
    AIDolgozatView,
    HianyzasViewSet,
    TanariJegyView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'tantargyak', TantargyViewSet, basename='tantargy')
router.register(r'kurzusok', KurzusViewSet, basename='kurzus')
router.register(r'feladatok', FeladatViewSet, basename='feladat')
router.register(r'beadasok', BeadasViewSet, basename='beadas')
router.register(r'hirek', HirViewSet, basename='hir')
router.register(r'hianyzasok', HianyzasViewSet, basename='hianyzas')

urlpatterns = router.urls

urlpatterns +=[
    path('ranglista/', RanglistaView.as_view(), name='ranglista'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('jegyek/', JegyekView.as_view(), name='jegyek'), # <-- Új végpont
    path('dicsosegfal/', DicsosegfalView.as_view(), name='dicsosegfal'),
    path('ai-ertekeles/', AIErtekelesView.as_view(), name='ai-ertekeles'),
    path('ai-chat/', AIChatView.as_view(), name='ai-chat'),
    path('ai-dolgozat/', AIDolgozatView.as_view(), name='ai-dolgozat'),
    path('tanar-jegy/', TanariJegyView.as_view(), name='tanar-jegy'),
]