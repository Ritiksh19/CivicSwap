from rest_framework import serializers
from .models import Rating
from apps.users.serializers import UserSerializer


class RatingSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()
    rater = UserSerializer(read_only=True)
    ratee = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ['_id', 'id', 'transaction', 'rater', 'ratee', 'score', 'comments', 'created_at']
        read_only_fields = ['id', '_id', 'rater', 'ratee', 'created_at']

    def get__id(self, obj):
        return str(obj.id)


class CreateRatingSerializer(serializers.ModelSerializer):
    transaction_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Rating
        fields = ['transaction_id', 'score', 'comments']
