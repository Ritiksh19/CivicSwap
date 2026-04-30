"""
apps/transactions/urls.py  —  mirrors civicswap-backend/routes/transactionRoutes.js

  POST /api/transactions
  GET  /api/transactions/my
  GET  /api/transactions/requests
  PUT  /api/transactions/:id/approve
  PUT  /api/transactions/:id/reject
  PUT  /api/transactions/:id/return
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.create_transaction),
    path('my', views.my_transactions),
    path('requests', views.incoming_requests),
    path('<int:transaction_id>/approve', views.approve_transaction),
    path('<int:transaction_id>/reject', views.reject_transaction),
    path('<int:transaction_id>/return', views.return_transaction),
]
