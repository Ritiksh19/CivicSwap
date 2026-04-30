"""
apps/users/models.py
Replaces civicswap-backend/models/User.js

Original Mongoose schema fields preserved:
  name, email, password (hashed), home_lat, home_lng,
  reputation_score, created_at
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model that uses email as the login field.
    Mirrors the Node.js User.js Mongoose schema.
    """
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True, default='')

    # Geographic home location (set during registration via browser Geolocation API)
    home_lat = models.FloatField(null=True, blank=True)
    home_lng = models.FloatField(null=True, blank=True)

    # Reputation score (weighted average from ratings — mirrors reputationScore in Mongoose)
    reputation_score = models.FloatField(default=0.0)

    # Django admin fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.name} <{self.email}>"
