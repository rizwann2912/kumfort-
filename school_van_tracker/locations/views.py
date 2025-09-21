import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q
from .models import Location, VanAssignment, ChildVanAssignment
from .serializers import LocationSerializer, VanAssignmentSerializer, ChildVanAssignmentSerializer

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_location(request):
    """Update driver's current location"""
    try:
        # Ensure user is a driver
        if request.user.user_type != 'driver':
            return Response(
                {"error": "Only drivers can update location"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if not latitude or not longitude:
            return Response(
                {"error": "Latitude and longitude are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Deactivate previous active location
        Location.objects.filter(driver=request.user, is_active=True).update(is_active=False)
        
        # Create new location
        location = Location.objects.create(
            driver=request.user,
            latitude=latitude,
            longitude=longitude,
            accuracy=data.get('accuracy'),
            speed=data.get('speed'),
            heading=data.get('heading'),
            altitude=data.get('altitude'),
            is_active=True
        )
        
        logger.info(f"📍 Location updated for driver {request.user.phone_number}: {latitude}, {longitude}")
        
        return Response({
            "message": "Location updated successfully",
            "location": LocationSerializer(location).data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"❌ Error updating location: {str(e)}")
        return Response(
            {"error": "Failed to update location"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_driver_location(request):
    """Get driver's current location (for driver)"""
    try:
        if request.user.user_type != 'driver':
            return Response(
                {"error": "Only drivers can access this endpoint"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        location = Location.objects.filter(
            driver=request.user, 
            is_active=True
        ).first()
        
        if not location:
            return Response(
                {"error": "No active location found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            "location": LocationSerializer(location).data
        })
        
    except Exception as e:
        logger.error(f"❌ Error getting driver location: {str(e)}")
        return Response(
            {"error": "Failed to get location"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_van_location(request):
    """Get van location for parents (their child's assigned van)"""
    try:
        if request.user.user_type != 'parent':
            return Response(
                {"error": "Only parents can access this endpoint"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get parent's child assignments
        child_assignments = ChildVanAssignment.objects.filter(
            parent=request.user,
            is_active=True
        ).select_related('van_assignment__driver')
        
        if not child_assignments.exists():
            return Response(
                {"error": "No van assignments found for your children"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get the van assignment (assuming one van per parent for simplicity)
        van_assignment = child_assignments.first().van_assignment
        
        # Get driver's current location
        location = Location.objects.filter(
            driver=van_assignment.driver,
            is_active=True
        ).first()
        
        if not location:
            return Response(
                {"error": "Van location not available"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            "van_assignment": VanAssignmentSerializer(van_assignment).data,
            "location": LocationSerializer(location).data,
            "children": ChildVanAssignmentSerializer(child_assignments, many=True).data
        })
        
    except Exception as e:
        logger.error(f"❌ Error getting van location: {str(e)}")
        return Response(
            {"error": "Failed to get van location"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_location_history(request):
    """Get location history for driver"""
    try:
        if request.user.user_type != 'driver':
            return Response(
                {"error": "Only drivers can access this endpoint"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get last 50 location updates
        locations = Location.objects.filter(
            driver=request.user
        ).order_by('-timestamp')[:50]
        
        return Response({
            "locations": LocationSerializer(locations, many=True).data
        })
        
    except Exception as e:
        logger.error(f"❌ Error getting location history: {str(e)}")
        return Response(
            {"error": "Failed to get location history"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_gps_tracking(request):
    """Enable/disable GPS tracking for driver"""
    try:
        if request.user.user_type != 'driver':
            return Response(
                {"error": "Only drivers can access this endpoint"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        is_enabled = request.data.get('enabled', False)
        
        # Update driver's GPS tracking preference
        # You might want to add a field to User model for this
        # For now, we'll use the location update frequency as a proxy
        
        return Response({
            "message": f"GPS tracking {'enabled' if is_enabled else 'disabled'}",
            "enabled": is_enabled
        })
        
    except Exception as e:
        logger.error(f"❌ Error toggling GPS tracking: {str(e)}")
        return Response(
            {"error": "Failed to toggle GPS tracking"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
