from django.contrib import admin
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'item', 'borrower', 'status', 'start_date', 'end_date', 'created_at']
    list_filter = ['status']
    search_fields = ['item__title', 'borrower__name', 'borrower__email']
    ordering = ['-created_at']
