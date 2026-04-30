"""
apps/transactions/views.py
Replaces civicswap-backend/controllers/transactionController.js

Endpoints:
  POST /api/transactions                     → create_transaction()
  GET  /api/transactions/my                  → my_transactions()
  GET  /api/transactions/requests            → incoming_requests()
  PUT  /api/transactions/:id/approve         → approve_transaction()
  PUT  /api/transactions/:id/reject          → reject_transaction()
  PUT  /api/transactions/:id/return          → return_transaction()

Overlap validation:
  Prevents double-booking — mirrors the original $or date-conflict query.
  
Email notifications:
  Triggered at every lifecycle stage via utils/email.py (Brevo REST API),
  replacing the original transactionController.js email triggers.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Transaction
from .serializers import TransactionSerializer, CreateTransactionSerializer
from apps.items.models import Item
from utils.email import (
    send_borrow_request_email,
    send_request_approved_email,
    send_request_rejected_email,
    send_return_confirmation_email,
    send_rating_prompt_email,
)


def check_overlap(item, start_date, end_date, exclude_id=None):
    """
    Detect scheduling conflicts.
    Mirrors the original overlap validation:
      approved or on_loan transactions where date ranges intersect.
    """
    qs = Transaction.objects.filter(
        item=item,
        status__in=[Transaction.STATUS_APPROVED, Transaction.STATUS_ON_LOAN],
        start_date__lte=end_date,
        end_date__gte=start_date,
    )
    if exclude_id:
        qs = qs.exclude(pk=exclude_id)
    return qs.exists()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_transaction(request):
    """
    POST /api/transactions
    Body: { item_id, start_date, end_date }
    """
    serializer = CreateTransactionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'message': list(serializer.errors.values())[0][0]},
            status=status.HTTP_400_BAD_REQUEST
        )

    item_id = serializer.validated_data['item_id']
    start_date = serializer.validated_data['start_date']
    end_date = serializer.validated_data['end_date']

    # Validate item exists
    try:
        item = Item.objects.select_related('owner').get(pk=item_id)
    except Item.DoesNotExist:
        return Response({'message': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

    # Cannot borrow your own item
    if item.owner == request.user:
        return Response(
            {'message': 'You cannot borrow your own item'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Item must be available
    if item.status != 'AVAILABLE':
        return Response(
            {'message': 'Item is not available for borrowing'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Date validation
    if start_date > end_date:
        return Response(
            {'message': 'Start date must be before end date'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Overlap check — mirrors original conflict detection
    if check_overlap(item, start_date, end_date):
        return Response(
            {'message': 'Item is already booked for these dates'},
            status=status.HTTP_400_BAD_REQUEST
        )

    transaction = Transaction.objects.create(
        item=item,
        borrower=request.user,
        start_date=start_date,
        end_date=end_date,
        status=Transaction.STATUS_PENDING,
    )

    # ── Email: notify owner of new request ───────────────────────────────────
    send_borrow_request_email(
        owner_email=item.owner.email,
        owner_name=item.owner.name,
        borrower_name=request.user.name,
        item_title=item.title,
        start_date=str(start_date),
        end_date=str(end_date),
    )

    return Response(
        TransactionSerializer(transaction).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_transactions(request):
    """
    GET /api/transactions/my
    Returns all transactions where the current user is the borrower.
    """
    transactions = Transaction.objects.filter(
        borrower=request.user
    ).select_related('item__owner', 'borrower')
    return Response(TransactionSerializer(transactions, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def incoming_requests(request):
    """
    GET /api/transactions/requests
    Returns pending requests for items owned by the current user.
    """
    transactions = Transaction.objects.filter(
        item__owner=request.user,
        status=Transaction.STATUS_PENDING,
    ).select_related('item__owner', 'borrower')
    return Response(TransactionSerializer(transactions, many=True).data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def approve_transaction(request, transaction_id):
    """
    PUT /api/transactions/:id/approve
    Lender approves a PENDING request → status becomes APPROVED,
    item status becomes ON_LOAN.
    """
    try:
        transaction = Transaction.objects.select_related(
            'item__owner', 'borrower'
        ).get(pk=transaction_id)
    except Transaction.DoesNotExist:
        return Response({'message': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

    if transaction.item.owner != request.user:
        return Response({'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    if transaction.status != Transaction.STATUS_PENDING:
        return Response(
            {'message': 'Only pending transactions can be approved'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Final overlap check before approval
    if check_overlap(transaction.item, transaction.start_date, transaction.end_date, exclude_id=transaction.id):
        return Response(
            {'message': 'Conflicting booking exists for these dates'},
            status=status.HTTP_400_BAD_REQUEST
        )

    transaction.status = Transaction.STATUS_APPROVED
    transaction.save()

    # Update item status to ON_LOAN
    transaction.item.status = 'ON_LOAN'
    transaction.item.save()

    # ── Email: notify borrower of approval ────────────────────────────────────
    send_request_approved_email(
        borrower_email=transaction.borrower.email,
        borrower_name=transaction.borrower.name,
        owner_name=transaction.item.owner.name,
        item_title=transaction.item.title,
        start_date=str(transaction.start_date),
        end_date=str(transaction.end_date),
    )

    return Response(TransactionSerializer(transaction).data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def reject_transaction(request, transaction_id):
    """
    PUT /api/transactions/:id/reject
    Lender rejects a PENDING request.
    """
    try:
        transaction = Transaction.objects.select_related(
            'item__owner', 'borrower'
        ).get(pk=transaction_id)
    except Transaction.DoesNotExist:
        return Response({'message': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

    if transaction.item.owner != request.user:
        return Response({'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    if transaction.status != Transaction.STATUS_PENDING:
        return Response(
            {'message': 'Only pending transactions can be rejected'},
            status=status.HTTP_400_BAD_REQUEST
        )

    transaction.status = Transaction.STATUS_REJECTED
    transaction.save()

    # ── Email: notify borrower of rejection ───────────────────────────────────
    send_request_rejected_email(
        borrower_email=transaction.borrower.email,
        borrower_name=transaction.borrower.name,
        item_title=transaction.item.title,
    )

    return Response(TransactionSerializer(transaction).data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def return_transaction(request, transaction_id):
    """
    PUT /api/transactions/:id/return
    Borrower marks item as returned → status becomes RETURNED,
    item status goes back to AVAILABLE.
    Both parties are then prompted to rate each other.
    """
    try:
        transaction = Transaction.objects.select_related(
            'item__owner', 'borrower'
        ).get(pk=transaction_id)
    except Transaction.DoesNotExist:
        return Response({'message': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

    if transaction.borrower != request.user:
        return Response({'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    if transaction.status not in [Transaction.STATUS_APPROVED, Transaction.STATUS_ON_LOAN]:
        return Response(
            {'message': 'Item must be approved or on loan to be returned'},
            status=status.HTTP_400_BAD_REQUEST
        )

    transaction.status = Transaction.STATUS_RETURNED
    transaction.save()

    # Set item back to AVAILABLE
    transaction.item.status = 'AVAILABLE'
    transaction.item.save()

    # ── Emails: return confirmation + rating prompts ──────────────────────────
    send_return_confirmation_email(
        owner_email=transaction.item.owner.email,
        owner_name=transaction.item.owner.name,
        borrower_name=transaction.borrower.name,
        item_title=transaction.item.title,
    )
    send_rating_prompt_email(
        user_email=transaction.borrower.email,
        user_name=transaction.borrower.name,
        other_name=transaction.item.owner.name,
        item_title=transaction.item.title,
    )
    send_rating_prompt_email(
        user_email=transaction.item.owner.email,
        user_name=transaction.item.owner.name,
        other_name=transaction.borrower.name,
        item_title=transaction.item.title,
    )

    return Response(TransactionSerializer(transaction).data)
