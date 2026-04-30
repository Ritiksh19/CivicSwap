"""
apps/users/urls.py  —  mirrors civicswap-backend/routes/authRoutes.js

  POST  /api/auth/register
  POST  /api/auth/login
  GET   /api/auth/profile
  PUT   /api/auth/profile
  GET   /api/auth/users/:id
"""
from django.urls import path
from . import views

urlpatterns = [
    path('register', views.register),
    path('login', views.login),
    path('profile', views.profile),
    path('users/<int:user_id>', views.get_user_by_id),
]
