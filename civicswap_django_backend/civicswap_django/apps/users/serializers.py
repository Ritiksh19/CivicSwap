"""
apps/users/serializers.py

Response shapes are kept identical to the original Node.js backend so the
React frontend requires ZERO changes. MongoDB used '_id'; we expose both
'id' and '_id' (aliased) so existing frontend code works.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Public user representation.
    Exposes _id (alias for id) for frontend MongoDB compatibility.
    """
    _id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            '_id', 'id', 'name', 'email', 'bio',
            'home_lat', 'home_lng', 'reputation_score', 'created_at'
        ]
        read_only_fields = ['id', '_id', 'reputation_score', 'created_at']

    def get__id(self, obj):
        return str(obj.id)


class RegisterSerializer(serializers.ModelSerializer):
    """Handles user registration — mirrors POST /api/auth/register."""
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['name', 'email', 'password', 'home_lat', 'home_lng']

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            home_lat=validated_data.get('home_lat'),
            home_lng=validated_data.get('home_lng'),
        )


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Handles PUT /api/auth/profile — allows updating name, bio, location, password."""
    password = serializers.CharField(write_only=True, min_length=6, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['name', 'bio', 'home_lat', 'home_lng', 'password']

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
