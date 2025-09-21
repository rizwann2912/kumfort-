#!/usr/bin/env python3
"""
Setup demo data for testing GPS tracking functionality
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school_van_tracker.settings')
django.setup()

from accounts.models import User
from locations.models import VanAssignment, ChildVanAssignment, Location
from django.utils import timezone
from decimal import Decimal

def create_demo_data():
    """Create demo users and van assignments for testing"""
    
    # Create a driver
    driver, created = User.objects.get_or_create(
        phone_number='+919876543210',
        defaults={
            'user_type': 'driver',
            'first_name': 'Rajesh',
            'last_name': 'Kumar',
            'is_active': True,
        }
    )
    print(f"Driver: {'Created' if created else 'Exists'} - {driver.get_full_name()}")
    
    # Create a parent
    parent, created = User.objects.get_or_create(
        phone_number='+919876543211',
        defaults={
            'user_type': 'parent',
            'first_name': 'Priya',
            'last_name': 'Sharma',
            'is_active': True,
        }
    )
    print(f"Parent: {'Created' if created else 'Exists'} - {parent.get_full_name()}")
    
    # Create van assignment
    van, created = VanAssignment.objects.get_or_create(
        van_number='DPS-001',
        defaults={
            'driver': driver,
            'van_model': 'Tata Winger',
            'capacity': 20,
            'route_name': 'Sector 15 to DPS School',
            'is_active': True,
        }
    )
    print(f"Van: {'Created' if created else 'Exists'} - {van.van_number}")
    
    # Create child van assignment
    child_assignment, created = ChildVanAssignment.objects.get_or_create(
        parent=parent,
        child_name='Arjun Sharma',
        defaults={
            'child_grade': '5th Grade',
            'school_name': 'Delhi Public School',
            'admission_number': 'DPS2024001',
            'van_assignment': van,
            'pickup_time': '07:30:00',
            'dropoff_time': '14:30:00',
            'is_active': True,
        }
    )
    print(f"Child Assignment: {'Created' if created else 'Exists'} - {child_assignment.child_name}")
    
    # Create a sample location for the driver
    location, created = Location.objects.get_or_create(
        driver=driver,
        is_active=True,
        defaults={
            'latitude': Decimal('28.6139'),  # Delhi coordinates
            'longitude': Decimal('77.2090'),
            'accuracy': 10.5,
            'speed': 25.0,
            'heading': 180.0,
            'altitude': 216.0,
        }
    )
    print(f"Location: {'Created' if created else 'Exists'} - {location.latitude}, {location.longitude}")
    
    print("\n✅ Demo data setup complete!")
    print(f"Driver: {driver.phone_number} ({driver.get_full_name()})")
    print(f"Parent: {parent.phone_number} ({parent.get_full_name()})")
    print(f"Van: {van.van_number} - {van.driver.get_full_name()}")
    print(f"Child: {child_assignment.child_name} assigned to {van.van_number}")

if __name__ == "__main__":
    create_demo_data()
