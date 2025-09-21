from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from django.utils import timezone
import random
import string

class User(AbstractBaseUser, PermissionsMixin):
    # Production-ready user types for school van tracking system
    # Only Parent and Driver are needed for this use case
    USER_TYPE_CHOICES = [
        ("parent", "Parent"),
        ("driver", "Driver"),
    ]
    
    phone_number = PhoneNumberField(unique=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default="parent")
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True, null=True)
    emergency_contact = PhoneNumberField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = "phone_number"
    REQUIRED_FIELDS = ["user_type"]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_user_type_display()})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        return self.first_name

class OTPVerification(models.Model):
    phone_number = PhoneNumberField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    
    class Meta:
        ordering = ["-created_at"]
    
    def save(self, *args, **kwargs):
        if not self.pk:
            self.otp_code = self.generate_otp()
            self.expires_at = timezone.now() + timezone.timedelta(minutes=10)
        super().save(*args, **kwargs)
    
    def generate_otp(self):
        return "".join(random.choices(string.digits, k=6))
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        return not self.is_expired() and not self.is_verified and self.attempts < 3
    
    def __str__(self):
        return f"OTP for {self.phone_number}: {self.otp_code}"
