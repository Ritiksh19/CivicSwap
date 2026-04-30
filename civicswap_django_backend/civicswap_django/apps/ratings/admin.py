from django.contrib import admin
from .models import Rating


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['rater', 'ratee', 'score', 'transaction', 'created_at']
    list_filter = ['score']
    search_fields = ['rater__name', 'ratee__name']
    ordering = ['-created_at']
