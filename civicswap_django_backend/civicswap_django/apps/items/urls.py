"""
apps/items/urls.py  —  mirrors civicswap-backend/routes/itemRoutes.js

  GET    /api/items
  POST   /api/items
  GET    /api/items/:id
  PUT    /api/items/:id
  DELETE /api/items/:id
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.items_list_create),
    path('<int:item_id>', views.item_detail),
]
