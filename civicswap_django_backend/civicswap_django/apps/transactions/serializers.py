"""
apps/transactions/serializers.py
Response shapes match the original transactionController.js.
"""
from rest_framework import serializers
from .models import Transaction
from apps.items.serializers import ItemSerializer
from apps.users.serializers import UserSerializer


class TransactionSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()
    item = ItemSerializer(read_only=True)
    borrower = UserSerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = [
            '_id', 'id', 'item', 'borrower',
            'start_date', 'end_date', 'status', 'created_at'
        ]
        read_only_fields = ['id', '_id', 'item', 'borrower', 'status', 'created_at']

    def get__id(self, obj):
        return str(obj.id)


class CreateTransactionSerializer(serializers.ModelSerializer):
    item_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Transaction
        fields = ['item_id', 'start_date', 'end_date']
