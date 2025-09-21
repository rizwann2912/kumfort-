from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OTPVerification

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('phone_number', 'user_type', 'first_name', 'last_name', 'is_active', 'created_at')
    list_filter = ('user_type', 'is_active', 'is_staff', 'created_at')
    search_fields = ('phone_number', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'address', 'emergency_contact')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'user_type')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'user_type', 'password1', 'password2'),
        }),
    )

@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'otp_code', 'is_verified', 'attempts', 'created_at', 'expires_at')
    list_filter = ('is_verified', 'created_at')
    search_fields = ('phone_number',)
    readonly_fields = ('otp_code', 'created_at', 'expires_at')
    ordering = ('-created_at',)
