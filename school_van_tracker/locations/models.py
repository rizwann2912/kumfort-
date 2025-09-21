from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Location(models.Model):
    """Model to store driver GPS coordinates and location data"""
    driver = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='locations',
        limit_choices_to={'user_type': 'driver'}
    )
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    accuracy = models.FloatField(help_text="GPS accuracy in meters", null=True, blank=True)
    speed = models.FloatField(help_text="Speed in km/h", null=True, blank=True)
    heading = models.FloatField(help_text="Direction in degrees", null=True, blank=True)
    altitude = models.FloatField(help_text="Altitude in meters", null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True, help_text="Whether this is the current location")
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['driver', '-timestamp']),
            models.Index(fields=['is_active', 'driver']),
        ]
    
    def __str__(self):
        return f"{self.driver.get_full_name()} - {self.latitude}, {self.longitude} at {self.timestamp}"
    
    @property
    def coordinates(self):
        """Return coordinates as a tuple for easy use in maps"""
        return (float(self.latitude), float(self.longitude))


class VanAssignment(models.Model):
    """Model to link drivers with vans and parents with their children's van assignments"""
    driver = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='van_assignments',
        limit_choices_to={'user_type': 'driver'}
    )
    van_number = models.CharField(max_length=20, unique=True)
    van_model = models.CharField(max_length=100, blank=True)
    capacity = models.PositiveIntegerField(default=20)
    route_name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['van_number']
    
    def __str__(self):
        return f"Van {self.van_number} - {self.driver.get_full_name()}"


class ChildVanAssignment(models.Model):
    """Model to link children with their assigned van and driver"""
    parent = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='child_assignments',
        limit_choices_to={'user_type': 'parent'}
    )
    child_name = models.CharField(max_length=100)
    child_grade = models.CharField(max_length=20, blank=True)
    school_name = models.CharField(max_length=200, blank=True)
    admission_number = models.CharField(max_length=50, blank=True)
    van_assignment = models.ForeignKey(
        VanAssignment, 
        on_delete=models.CASCADE, 
        related_name='child_assignments'
    )
    pickup_time = models.TimeField(null=True, blank=True)
    dropoff_time = models.TimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['child_name']
        unique_together = ['parent', 'child_name']
    
    def __str__(self):
        return f"{self.child_name} - Van {self.van_assignment.van_number}"
