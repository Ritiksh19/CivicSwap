"""
apps/items/serializers.py
Matches the response shape from the original itemController.js.
"""
from rest_framework import serializers
from .models import Item
from apps.users.serializers import UserSerializer


class ItemSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()
    owner = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    # Distance in km — populated by the view when geo-filter is applied
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            '_id', 'id', 'title', 'description', 'category',
            'image', 'image_url', 'status', 'location_lat', 'location_lng',
            'owner', 'created_at', 'distance'
        ]
        read_only_fields = ['id', '_id', 'owner', 'created_at']

    def get__id(self, obj):
        return str(obj.id)

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_distance(self, obj):
        return getattr(obj, '_distance_km', None)


class ItemCreateUpdateSerializer(serializers.ModelSerializer):
    """Used for POST (create) and PUT (update) operations."""
    class Meta:
        model = Item
        fields = [
            'title', 'description', 'category',
            'image', 'status', 'location_lat', 'location_lng'
        ]
