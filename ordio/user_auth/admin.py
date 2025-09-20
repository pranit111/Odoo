from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'is_verified', 'otp_verified', 'date_joined']
    list_filter = ['is_verified', 'otp_verified', 'is_staff', 'is_active', 'date_joined']
    search_fields = ['username', 'email']
    ordering = ['-date_joined']
    
    fieldsets = UserAdmin.fieldsets + (
        ('OTP Information', {
            'fields': ('is_verified', 'otp', 'otp_created_at', 'otp_verified')
        }),
    )
    
    readonly_fields = ['otp_created_at', 'date_joined']
