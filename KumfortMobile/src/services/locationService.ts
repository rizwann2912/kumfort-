import { Platform, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import { getApiUrl } from '../config/api';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  altitude?: number;
}

class LocationService {
  private watchId: Location.LocationSubscription | null = null;
  private isTracking = false;
  private updateInterval: NodeJS.Timeout | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to track your van. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }

      // Request background location permission for continuous tracking
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission not granted. Tracking will be limited.');
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        heading: location.coords.heading,
        altitude: location.coords.altitude,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async startTracking(
    onLocationUpdate: (location: LocationData) => void,
    onError: (error: string) => void
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        onError('Location permission denied');
        return false;
      }

      if (this.isTracking) {
        console.warn('Location tracking is already active');
        return true;
      }

      this.isTracking = true;

      // Start watching position changes
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            speed: location.coords.speed,
            heading: location.coords.heading,
            altitude: location.coords.altitude,
          };
          onLocationUpdate(locationData);
        }
      );

      // Also send periodic updates to server
      this.updateInterval = setInterval(async () => {
        const location = await this.getCurrentLocation();
        if (location) {
          await this.sendLocationToServer(location);
        }
      }, 30000); // Send to server every 30 seconds

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      onError('Failed to start location tracking');
      return false;
    }
  }

  stopTracking(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.isTracking = false;
  }

  private async sendLocationToServer(location: LocationData): Promise<void> {
    try {
      const apiUrl = getApiUrl('/locations/update-location/');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(location),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to send location to server:', errorData);
      }
    } catch (error) {
      console.error('Error sending location to server:', error);
    }
  }

  private async getAuthToken(): Promise<string> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('auth_token');
      return token || '';
    } catch (error) {
      console.error('Error getting auth token:', error);
      return '';
    }
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }
}

export default new LocationService();
