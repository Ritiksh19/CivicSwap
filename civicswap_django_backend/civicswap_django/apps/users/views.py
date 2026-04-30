"""
apps/users/views.py
Replaces civicswap-backend/controllers/authController.js

Endpoints:
  POST  /api/auth/register  → register()
  POST  /api/auth/login     → login()
  GET   /api/auth/profile   → get_profile()
  PUT   /api/auth/profile   → update_profile()

Token format: { token, user: {...} }
Matches the original Node.js response exactly so the React frontend
(AuthContext.jsx + axios.js) works without any changes.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model

from .serializers import UserSerializer, RegisterSerializer, UpdateProfileSerializer

User = get_user_model()


def get_tokens_for_user(user):
    """
    Generate JWT access token.
    The frontend stores only the access token in localStorage as 'token'.
    """
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    POST /api/auth/register
    Body: { name, email, password, home_lat?, home_lng? }
    Returns: { token, user }
    """
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'message': list(serializer.errors.values())[0][0]},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check for duplicate email
    email = serializer.validated_data.get('email')
    if User.objects.filter(email=email).exists():
        return Response(
            {'message': 'User with this email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = serializer.save()
    token = get_tokens_for_user(user)
    return Response(
        {'token': token, 'user': UserSerializer(user).data},
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    POST /api/auth/login
    Body: { email, password }
    Returns: { token, user }
    """
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response(
            {'message': 'Please provide email and password'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=email, password=password)
    if not user:
        return Response(
            {'message': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    token = get_tokens_for_user(user)
    return Response({'token': token, 'user': UserSerializer(user).data})


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    GET  /api/auth/profile  → returns current user
    PUT  /api/auth/profile  → updates name, bio, location, password
    """
    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)

    # PUT
    serializer = UpdateProfileSerializer(
        request.user, data=request.data, partial=True
    )
    if not serializer.is_valid():
        return Response(
            {'message': list(serializer.errors.values())[0][0]},
            status=status.HTTP_400_BAD_REQUEST
        )
    user = serializer.save()
    return Response(UserSerializer(user).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_by_id(request, user_id):
    """
    GET /api/auth/users/:id
    Used by the frontend to display other users' profiles.
    """
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(UserSerializer(user).data)
