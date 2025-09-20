from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import random
import string

class CustomUser(AbstractUser):
    """
    Custom User model with OTP functionality and manufacturing roles
    """
    ROLE_CHOICES = [
        ('ADMIN', 'Administrator'),
        ('MANAGER', 'Manufacturing Manager'),
        ('OPERATOR', 'Shop Floor Operator'),
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='OPERATOR')
    is_verified = models.BooleanField(default=False)
    
    # OTP fields
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    otp_verified = models.BooleanField(default=False)
    
    # Use username as the primary identifier
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']
    
    def generate_otp(self):
        """Generate a 6-digit OTP"""
        self.otp = ''.join(random.choices(string.digits, k=6))
        self.otp_created_at = timezone.now()
        self.otp_verified = False
        self.save()
        return self.otp
    
    def verify_otp(self, otp):
        """Verify the provided OTP"""
        if not self.otp or not self.otp_created_at:
            return False
        
        # Check if OTP is expired (10 minutes)
        if (timezone.now() - self.otp_created_at).seconds > 600:
            return False
        
        if self.otp == otp:
            self.otp_verified = True
            self.is_verified = True
            self.otp = None  # Clear OTP after verification
            self.otp_created_at = None
            self.save()
            return True
        return False
    
    def __str__(self):
        return self.username
