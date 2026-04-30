"""
apps/items/views.py
Replaces civicswap-backend/controllers/itemController.js

Endpoints:
  GET    /api/items             → list_items()   (with geo-filter)
  POST   /api/items             → create_item()
  GET    /api/items/:id         → get_item()
  PUT    /api/items/:id         → update_item()
  DELETE /api/items/:id         → delete_item()

Geo-filter params: ?latitude=28.59&longitude=78.55&radius=5&category=Tools&search=drill
Haversine formula replaces MongoDB $nearSphere.
"""
import math
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status

from .models import Item
from .serializers import ItemSerializer, ItemCreateUpdateSerializer


def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance in km between two points.
    Replaces MongoDB $nearSphere / $geoNear.
    """
    R = 6371  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def items_list_create(request):
    if request.method == 'GET':
        return list_items(request)
    return create_item(request)


def list_items(request):
    """
    GET /api/items
    Supports geo-filter + category + keyword search + sort.
    Mirrors the original itemController getItems().
    """
    qs = Item.objects.select_related('owner').all()

    # ── Category filter ──────────────────────────────────────────────────────
    category = request.query_params.get('category')
    if category and category != 'All':
        qs = qs.filter(category=category)

    # ── Keyword search ───────────────────────────────────────────────────────
    search = request.query_params.get('search', '').strip()
    if search:
        qs = qs.filter(title__icontains=search) | qs.filter(description__icontains=search)

    # ── Geo-filter (Haversine) ───────────────────────────────────────────────
    try:
        lat = float(request.query_params['latitude'])
        lng = float(request.query_params['longitude'])
        radius_km = float(request.query_params.get('radius', 5))
        geo_filter = True
    except (KeyError, ValueError):
        geo_filter = False

    items = list(qs)

    if geo_filter:
        result = []
        for item in items:
            if item.location_lat is None or item.location_lng is None:
                continue
            dist = haversine(lat, lng, item.location_lat, item.location_lng)
            if dist <= radius_km:
                item._distance_km = round(dist, 2)
                result.append(item)
        # Sort by distance ascending (mirrors $nearSphere default sort)
        result.sort(key=lambda x: x._distance_km)
        items = result
    else:
        for item in items:
            item._distance_km = None

    serializer = ItemSerializer(items, many=True, context={'request': request})
    return Response(serializer.data)


def create_item(request):
    """POST /api/items — create a new listing."""
    serializer = ItemCreateUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'message': list(serializer.errors.values())[0][0]},
            status=status.HTTP_400_BAD_REQUEST
        )
    item = serializer.save(owner=request.user)
    return Response(
        ItemSerializer(item, context={'request': request}).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def item_detail(request, item_id):
    try:
        item = Item.objects.select_related('owner').get(pk=item_id)
    except Item.DoesNotExist:
        return Response({'message': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(ItemSerializer(item, context={'request': request}).data)

    # PUT and DELETE require ownership
    if item.owner != request.user:
        return Response({'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'PUT':
        serializer = ItemCreateUpdateSerializer(item, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(
                {'message': list(serializer.errors.values())[0][0]},
                status=status.HTTP_400_BAD_REQUEST
            )
        item = serializer.save()
        return Response(ItemSerializer(item, context={'request': request}).data)

    # DELETE
    item.delete()
    return Response({'message': 'Item removed'})
