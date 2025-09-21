import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { getApiUrl } from '../config/api';

interface LocationData {
  id: number;
  latitude: number | string; // Can be string from DecimalField
  longitude: number | string; // Can be string from DecimalField
  accuracy?: number | string;
  speed?: number | string;
  heading?: number | string;
  altitude?: number | string;
  timestamp: string;
  is_active: boolean;
  driver_name: string;
  driver_phone: string;
}

interface VanAssignment {
  id: number;
  van_number: string;
  van_model: string;
  capacity: number;
  route_name: string;
  is_active: boolean;
  driver_name: string;
  driver_phone: string;
}

interface ChildAssignment {
  id: number;
  child_name: string;
  child_grade: string;
  school_name: string;
  admission_number: string;
  pickup_time?: string;
  dropoff_time?: string;
  is_active: boolean;
  van_number: string;
  driver_name: string;
  driver_phone: string;
}

interface VanTrackingCardProps {
  authToken?: string;
  onError?: (error: string) => void;
}

export default function VanTrackingCard({ authToken, onError }: VanTrackingCardProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [vanAssignment, setVanAssignment] = useState<VanAssignment | null>(null);
  const [children, setChildren] = useState<ChildAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const updateInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchVanLocation();
    
    // Set up periodic updates every 30 seconds
    updateInterval.current = setInterval(() => {
      fetchVanLocation(true);
    }, 30000);

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [authToken]);

  useEffect(() => {
    // Start pulse animation when location is recent (within 2 minutes)
    if (location && lastUpdate) {
      const timeDiff = Date.now() - lastUpdate.getTime();
      const isRecent = timeDiff < 120000; // 2 minutes
      
      if (isRecent) {
        const pulse = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
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
    }
  }, [location, lastUpdate]);

  const fetchVanLocation = async (isRefresh = false) => {
    if (!authToken) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const apiUrl = getApiUrl('/locations/van-location/');
      console.log('🚐 VanTrackingCard - API URL:', apiUrl);
      console.log('🚐 VanTrackingCard - Auth Token:', authToken ? 'exists' : 'none');
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🚐 VanTrackingCard - Response Status:', response.status);
      console.log('🚐 VanTrackingCard - Response Headers:', response.headers.get('content-type'));

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setLocation(data.location);
          setVanAssignment(data.van_assignment);
          setChildren(data.children || []);
          setLastUpdate(new Date());
        } else {
          // Response is not JSON, likely an HTML error page
          const text = await response.text();
          console.error('Non-JSON response received:', text.substring(0, 200));
          throw new Error('Server returned invalid response format');
        }
      } else {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server error: ${response.status}`);
        } else {
          // Response is not JSON, likely an HTML error page
          const text = await response.text();
          console.error('Error response (non-JSON):', text.substring(0, 200));
          throw new Error(`Server error: ${response.status} - ${response.statusText}`);
        }
      }
    } catch (err) {
      let errorMessage = 'Network error';
      if (err instanceof Error) {
        if (err.message.includes('JSON Parse error')) {
          errorMessage = 'Server returned invalid data format';
        } else {
          errorMessage = err.message;
        }
      }
      console.error('Van tracking error:', errorMessage);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatLocation = (location: LocationData) => {
    if (!location || !location.latitude || !location.longitude) {
      return 'Location data unavailable';
    }
    
    // Handle both string and number types (API returns strings for DecimalField)
    const lat = typeof location.latitude === 'string' ? parseFloat(location.latitude) : location.latitude;
    const lng = typeof location.longitude === 'string' ? parseFloat(location.longitude) : location.longitude;
    
    if (isNaN(lat) || isNaN(lng)) {
      return 'Invalid location data';
    }
    
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const isLocationRecent = () => {
    if (!lastUpdate) return false;
    const timeDiff = Date.now() - lastUpdate.getTime();
    return timeDiff < 120000; // 2 minutes
  };

  const handleRefresh = () => {
    fetchVanLocation(true);
  };

  const handleCallDriver = () => {
    if (vanAssignment?.driver_phone) {
      Alert.alert(
        'Call Driver',
        `Call ${vanAssignment.driver_name} at ${vanAssignment.driver_phone}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => {
            // Implement calling functionality
            console.log('Calling driver:', vanAssignment.driver_phone);
          }}
        ]
      );
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading van location...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchVanLocation()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!location || !vanAssignment) {
    return (
      <View style={styles.container}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataIcon}>🚐</Text>
          <Text style={styles.noDataText}>No van assignment found</Text>
          <Text style={styles.noDataSubtext}>
            Please contact your school to set up van tracking
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>🚐</Text>
          <Text style={styles.title}>Van Tracking</Text>
        </View>
        
        <Animated.View style={[styles.statusIndicator, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isLocationRecent() ? Colors.light.success : Colors.light.border }
          ]} />
        </Animated.View>
      </View>

      <View style={styles.vanInfo}>
        <Text style={styles.vanNumber}>Van {vanAssignment.van_number}</Text>
        <Text style={styles.driverName}>Driver: {vanAssignment.driver_name}</Text>
        <Text style={styles.routeName}>{vanAssignment.route_name}</Text>
      </View>

      {children.length > 0 && (
        <View style={styles.childrenSection}>
          <Text style={styles.sectionTitle}>Your Children</Text>
          {children.map((child) => (
            <View key={child.id} style={styles.childCard}>
              <Text style={styles.childName}>{child.child_name}</Text>
              <Text style={styles.childGrade}>{child.child_grade}</Text>
              <Text style={styles.childSchool}>{child.school_name}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.locationSection}>
        <Text style={styles.sectionTitle}>Current Location</Text>
        <View style={styles.locationCard}>
          <Text style={styles.locationLabel}>Coordinates:</Text>
          <Text style={styles.locationText}>{formatLocation(location)}</Text>
          
          {location && location.accuracy && (
            <Text style={styles.accuracyText}>
              Accuracy: ±{Math.round(typeof location.accuracy === 'string' ? parseFloat(location.accuracy) : location.accuracy)}m
            </Text>
          )}
          
          {location && location.speed && (
            <Text style={styles.speedText}>
              Speed: {Math.round((typeof location.speed === 'string' ? parseFloat(location.speed) : location.speed) * 3.6)} km/h
            </Text>
          )}
          
          {lastUpdate && (
            <Text style={styles.lastUpdateText}>
              Last update: {formatTime(lastUpdate)} ({getTimeAgo(lastUpdate)})
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCallDriver}>
          <Text style={styles.actionButtonIcon}>📞</Text>
          <Text style={styles.actionButtonText}>Call Driver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleRefresh}>
          <Text style={styles.actionButtonIcon}>🔄</Text>
          <Text style={styles.actionButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
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
    padding: 20,
    paddingBottom: 16,
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.light.icon,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.light.primaryContrast,
    fontWeight: '600',
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: Colors.light.icon,
    textAlign: 'center',
  },
  vanInfo: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  vanNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  driverName: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 4,
  },
  routeName: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  childrenSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  childCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  childGrade: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 2,
  },
  childSchool: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  locationSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  locationCard: {
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
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionButtonText: {
    color: Colors.light.primaryContrast,
    fontWeight: '600',
  },
});
