from django.contrib import admin
from .models import Item


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'status', 'owner', 'created_at']
    list_filter = ['status', 'category']
    search_fields = ['title', 'description', 'owner__name', 'owner__email']
    ordering = ['-created_at']
