"""
apps/ratings/models.py
Replaces civicswap-backend/models/Rating.js

Unique constraint: one rating per (transaction, rater) pair —
mirrors the original Mongoose { unique: true } on that combination.
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Rating(models.Model):
    transaction = models.ForeignKey(
        'transactions.Transaction',
        on_delete=models.CASCADE,
        related_name='ratings'
    )
    rater = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_given'
    )
    ratee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_received'
    )
    score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comments = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ratings'
        # Unique constraint: one rating per rater per transaction
        unique_together = [('transaction', 'rater')]
        ordering = ['-created_at']

    def __str__(self):
        return f"Rating by {self.rater.name} → {self.ratee.name}: {self.score}★"
