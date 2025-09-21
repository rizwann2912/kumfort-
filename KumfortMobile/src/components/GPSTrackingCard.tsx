import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Colors } from '../../constants/theme';
import LocationService, { LocationData } from '../services/locationService';

interface GPSTrackingCardProps {
  onLocationUpdate?: (location: LocationData) => void;
  authToken?: string;
}

export default function GPSTrackingCard({ onLocationUpdate, authToken }: GPSTrackingCardProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start pulse animation when tracking
    if (isTracking) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTracking]);

  const handleToggleTracking = async () => {
    if (isTracking) {
      LocationService.stopTracking();
      setIsTracking(false);
      setCurrentLocation(null);
      setLastUpdate(null);
    } else {
      setLoading(true);
      
      const success = await LocationService.startTracking(
        (location) => {
          setCurrentLocation(location);
          setLastUpdate(new Date());
          onLocationUpdate?.(location);
        },
        (error) => {
          Alert.alert('GPS Error', error);
          setLoading(false);
        }
      );

      if (success) {
        setIsTracking(true);
        // Get initial location
        const location = await LocationService.getCurrentLocation();
        if (location) {
          setCurrentLocation(location);
          setLastUpdate(new Date());
          onLocationUpdate?.(location);
        }
      }
      
      setLoading(false);
    }
  };

  const formatLocation = (location: LocationData) => {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.title}>GPS Tracking</Text>
        </View>
        
        <Animated.View style={[styles.statusIndicator, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? Colors.light.success : Colors.light.border }
          ]} />
        </Animated.View>
      </View>

      <View style={styles.content}>
        {isTracking ? (
          <View style={styles.trackingContent}>
            <Text style={styles.statusText}>Live tracking active</Text>
            {currentLocation && (
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>Current Location:</Text>
                <Text style={styles.locationText}>{formatLocation(currentLocation)}</Text>
                
                {currentLocation.accuracy && (
                  <Text style={styles.accuracyText}>
                    Accuracy: ±{Math.round(currentLocation.accuracy)}m
                  </Text>
                )}
                
                {currentLocation.speed && (
                  <Text style={styles.speedText}>
                    Speed: {Math.round(currentLocation.speed * 3.6)} km/h
                  </Text>
                )}
                
                {lastUpdate && (
                  <Text style={styles.lastUpdateText}>
                    Last update: {formatTime(lastUpdate)}
                  </Text>
                )}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.stoppedContent}>
            <Text style={styles.stoppedText}>GPS tracking is off</Text>
            <Text style={styles.stoppedSubtext}>
              Enable to share your location with parents
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.toggleButton,
            isTracking ? styles.stopButton : styles.startButton,
            loading && styles.loadingButton
          ]}
          onPress={handleToggleTracking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator 
              color={isTracking ? Colors.light.error : Colors.light.primaryContrast} 
              size="small" 
            />
          ) : (
            <>
              <Text style={styles.toggleButtonIcon}>
                {isTracking ? '⏹️' : '▶️'}
              </Text>
              <Text style={[
                styles.toggleButtonText,
                isTracking ? styles.stopButtonText : styles.startButtonText
              ]}>
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {isTracking && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your location is being shared with parents in real-time
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  content: {
    marginBottom: 16,
  },
  trackingContent: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.success,
    marginBottom: 12,
  },
  locationInfo: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.icon,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  accuracyText: {
    fontSize: 12,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  speedText: {
    fontSize: 12,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  lastUpdateText: {
    fontSize: 12,
    color: Colors.light.icon,
    fontStyle: 'italic',
  },
  stoppedContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  stoppedText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.icon,
    marginBottom: 8,
  },
  stoppedSubtext: {
    fontSize: 14,
    color: Colors.light.icon,
    textAlign: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  startButton: {
    backgroundColor: Colors.light.primary,
  },
  stopButton: {
    backgroundColor: Colors.light.error,
  },
  loadingButton: {
    opacity: 0.7,
  },
  toggleButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  startButtonText: {
    color: Colors.light.primaryContrast,
  },
  stopButtonText: {
    color: Colors.light.primaryContrast,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.icon,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
