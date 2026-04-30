"""
apps/transactions/models.py
Replaces civicswap-backend/models/Transaction.js

6-state machine: PENDING → APPROVED → ON_LOAN → RETURNED → CLOSED
                                    ↘ REJECTED

Fields mirror the original Mongoose Transaction schema exactly.
"""
from django.db import models
from django.conf import settings


class Transaction(models.Model):
    STATUS_PENDING = 'PENDING'
    STATUS_APPROVED = 'APPROVED'
    STATUS_ON_LOAN = 'ON_LOAN'
    STATUS_RETURNED = 'RETURNED'
    STATUS_CLOSED = 'CLOSED'
    STATUS_REJECTED = 'REJECTED'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_ON_LOAN, 'On Loan'),
        (STATUS_RETURNED, 'Returned'),
        (STATUS_CLOSED, 'Closed'),
        (STATUS_REJECTED, 'Rejected'),
    ]

    item = models.ForeignKey(
        'items.Item',
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    borrower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='borrowed_transactions'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"Transaction #{self.id}: {self.item.title} — {self.status}"
