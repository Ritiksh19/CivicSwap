"""
apps/ratings/views.py
Replaces civicswap-backend/controllers/ratingController.js

Endpoints:
  POST /api/ratings              → create_rating()
  GET  /api/ratings/user/:id     → get_user_ratings()

After each rating submission, reputation_score is recalculated as a
weighted average and saved to the user profile — mirrors the original
auto reputation update logic.

The transaction is also marked CLOSED once both parties have rated.
"""
from django.db.models import Avg
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Rating
from .serializers import RatingSerializer, CreateRatingSerializer
from apps.transactions.models import Transaction

User = get_user_model()


def recalculate_reputation(user):
    """
    Recalculate and save the reputation score for a user.
    Uses simple average of all received ratings — mirrors original logic.
    """
    avg = Rating.objects.filter(ratee=user).aggregate(avg=Avg('score'))['avg']
    user.reputation_score = round(avg, 2) if avg else 0.0
    user.save(update_fields=['reputation_score'])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_rating(request):
    """
    POST /api/ratings
    Body: { transaction_id, score, comments? }

    Who is being rated:
      - If rater is the borrower  → ratee is the item owner (lender)
      - If rater is the item owner → ratee is the borrower

    After rating, close the transaction if both parties have rated.
    """
    serializer = CreateRatingSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'message': list(serializer.errors.values())[0][0]},
            status=status.HTTP_400_BAD_REQUEST
        )

    transaction_id = serializer.validated_data['transaction_id']
    score = serializer.validated_data['score']
    comments = serializer.validated_data.get('comments', '')

    try:
        transaction = Transaction.objects.select_related(
            'item__owner', 'borrower'
        ).get(pk=transaction_id)
    except Transaction.DoesNotExist:
        return Response({'message': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

    # Must be a participant
    is_borrower = request.user == transaction.borrower
    is_owner = request.user == transaction.item.owner

    if not is_borrower and not is_owner:
        return Response({'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    # Transaction must be RETURNED or CLOSED
    if transaction.status not in [Transaction.STATUS_RETURNED, Transaction.STATUS_CLOSED]:
        return Response(
            {'message': 'Can only rate after item has been returned'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Determine ratee
    ratee = transaction.item.owner if is_borrower else transaction.borrower

    # Unique constraint check
    if Rating.objects.filter(transaction=transaction, rater=request.user).exists():
        return Response(
            {'message': 'You have already rated this transaction'},
            status=status.HTTP_400_BAD_REQUEST
        )

    rating = Rating.objects.create(
        transaction=transaction,
        rater=request.user,
        ratee=ratee,
        score=score,
        comments=comments,
    )

    # ── Recalculate ratee's reputation score ─────────────────────────────────
    recalculate_reputation(ratee)

    # ── Close transaction if both parties have now rated ──────────────────────
    rating_count = Rating.objects.filter(transaction=transaction).count()
    if rating_count >= 2:
        transaction.status = Transaction.STATUS_CLOSED
        transaction.save(update_fields=['status'])

    return Response(
        RatingSerializer(rating).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_ratings(request, user_id):
    """
    GET /api/ratings/user/:id
    Returns all ratings received by a user (for profile page).
    """
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    ratings = Rating.objects.filter(ratee=user).select_related('rater', 'ratee', 'transaction')
    return Response(RatingSerializer(ratings, many=True).data)
