"""
apps/items/models.py
Replaces civicswap-backend/models/Item.js

Original Mongoose schema fields preserved:
  title, description, category, image, status,
  location (lat/lng — replaces GeoJSON Point with 2dsphere),
  owner (FK), created_at

Geo-filtering is done via Haversine formula in Python
(no PostGIS required, mirrors the original $nearSphere logic).
"""
from django.db import models
from django.conf import settings


class Item(models.Model):
    CATEGORY_CHOICES = [
        ('Tools', 'Tools'),
        ('Books', 'Books'),
        ('Kitchenware', 'Kitchenware'),
        ('Electronics', 'Electronics'),
        ('Sports', 'Sports'),
        ('Furniture', 'Furniture'),
        ('Clothing', 'Clothing'),
        ('Garden', 'Garden'),
        ('Toys', 'Toys'),
        ('Other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('ON_LOAN', 'On Loan'),
        ('UNAVAILABLE', 'Unavailable'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    image = models.ImageField(upload_to='items/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')

    # Geographic location of the item (replaces GeoJSON Point + 2dsphere index)
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='items'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'items'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.status})"
