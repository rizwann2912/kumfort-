from django.contrib import admin
from .models import Location, VanAssignment, ChildVanAssignment


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['driver', 'latitude', 'longitude', 'timestamp', 'is_active']
    list_filter = ['is_active', 'timestamp', 'driver']
    search_fields = ['driver__first_name', 'driver__last_name', 'driver__phone_number']
    readonly_fields = ['timestamp']
    ordering = ['-timestamp']


@admin.register(VanAssignment)
class VanAssignmentAdmin(admin.ModelAdmin):
    list_display = ['van_number', 'driver', 'van_model', 'capacity', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['van_number', 'driver__first_name', 'driver__last_name']
    ordering = ['van_number']


@admin.register(ChildVanAssignment)
class ChildVanAssignmentAdmin(admin.ModelAdmin):
    list_display = ['child_name', 'parent', 'van_assignment', 'school_name', 'is_active']
    list_filter = ['is_active', 'created_at', 'school_name']
    search_fields = ['child_name', 'parent__first_name', 'parent__last_name', 'school_name']
    ordering = ['child_name']
