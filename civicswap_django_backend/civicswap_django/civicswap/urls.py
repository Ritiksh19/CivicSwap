"""
URL Configuration — mirrors the original Express /api/* route structure exactly.

Original routes:
  /api/auth/*          → authRoutes.js
  /api/items/*         → itemRoutes.js
  /api/transactions/*  → transactionRoutes.js
  /api/ratings/*       → ratingRoutes.js
  /api/health          → server.js health check
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({'status': 'ok', 'message': 'CivicSwap Django API is running'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health', health_check),
    path('api/auth/', include('apps.users.urls')),
    path('api/items/', include('apps.items.urls')),
    path('api/transactions/', include('apps.transactions.urls')),
    path('api/ratings/', include('apps.ratings.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
