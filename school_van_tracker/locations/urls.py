from django.urls import path
from . import views

urlpatterns = [
    path('update-location/', views.update_location, name='update_location'),
    path('driver-location/', views.get_driver_location, name='get_driver_location'),
    path('van-location/', views.get_van_location, name='get_van_location'),
    path('location-history/', views.get_location_history, name='get_location_history'),
    path('toggle-gps/', views.toggle_gps_tracking, name='toggle_gps_tracking'),
]
