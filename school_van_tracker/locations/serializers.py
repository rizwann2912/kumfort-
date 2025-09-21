from rest_framework import serializers
from .models import Location, VanAssignment, ChildVanAssignment


class LocationSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.get_full_name', read_only=True)
    driver_phone = serializers.CharField(source='driver.phone_number', read_only=True)
    
    class Meta:
        model = Location
        fields = [
            'id', 'latitude', 'longitude', 'accuracy', 'speed', 
            'heading', 'altitude', 'timestamp', 'is_active',
            'driver_name', 'driver_phone', 'coordinates'
        ]
        read_only_fields = ['id', 'timestamp', 'coordinates']


class VanAssignmentSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.get_full_name', read_only=True)
    driver_phone = serializers.CharField(source='driver.phone_number', read_only=True)
    
    class Meta:
        model = VanAssignment
        fields = [
            'id', 'van_number', 'van_model', 'capacity', 
            'route_name', 'is_active', 'driver_name', 'driver_phone',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChildVanAssignmentSerializer(serializers.ModelSerializer):
    van_number = serializers.CharField(source='van_assignment.van_number', read_only=True)
    driver_name = serializers.CharField(source='van_assignment.driver.get_full_name', read_only=True)
    driver_phone = serializers.CharField(source='van_assignment.driver.phone_number', read_only=True)
    
    class Meta:
        model = ChildVanAssignment
        fields = [
            'id', 'child_name', 'child_grade', 'school_name', 
            'admission_number', 'pickup_time', 'dropoff_time',
            'is_active', 'van_number', 'driver_name', 'driver_phone',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
