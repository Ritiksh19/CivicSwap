"""
apps/ratings/urls.py  —  mirrors civicswap-backend/routes/ratingRoutes.js

  POST /api/ratings
  GET  /api/ratings/user/:id
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.create_rating),
    path('user/<int:user_id>', views.get_user_ratings),
]
