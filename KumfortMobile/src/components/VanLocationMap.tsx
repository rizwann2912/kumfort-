import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/theme';

interface LocationData {
  id: number;
  latitude: number | string;
  longitude: number | string;
  accuracy?: number | string;
  speed?: number | string;
  heading?: number | string;
  altitude?: number | string;
  timestamp: string;
  is_active: boolean;
  driver_name: string;
  driver_phone: string;
}

interface VanInfo {
  vanId: string;
  vanNumber: string;
  driverName: string;
  driverPhone: string;
  route: string;
  currentLocation: string;
  estimatedArrival: string;
  status: 'on-time' | 'delayed' | 'arrived';
}

interface VanLocationMapProps {
  location: LocationData | null;
  vanInfo: VanInfo;
  onRefresh: () => void;
  loading?: boolean;
}

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.4; // 40% of screen height

export default function VanLocationMap({ location, vanInfo, onRefresh, loading = false }: VanLocationMapProps) {
  const [mapCenter, setMapCenter] = useState({ latitude: 28.6139, longitude: 77.2090 }); // Default to Delhi
  const [zoomLevel, setZoomLevel] = useState(15);

  useEffect(() => {
    if (location && location.latitude && location.longitude) {
      const lat = typeof location.latitude === 'string' ? parseFloat(location.latitude) : location.latitude;
      const lng = typeof location.longitude === 'string' ? parseFloat(location.longitude) : location.longitude;
      
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter({ latitude: lat, longitude: lng });
      }
    }
  }, [location]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return Colors.light.success;
      case 'delayed': return Colors.light.warning;
      case 'arrived': return Colors.light.info;
      default: return Colors.light.border;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-time': return 'On Time';
      case 'delayed': return 'Delayed';
      case 'arrived': return 'Arrived';
      default: return 'Unknown';
    }
  };

  const formatLocation = (location: LocationData) => {
    if (!location || !location.latitude || !location.longitude) {
      return 'Location unavailable';
    }
    
    const lat = typeof location.latitude === 'string' ? parseFloat(location.latitude) : location.latitude;
    const lng = typeof location.longitude === 'string' ? parseFloat(location.longitude) : location.longitude;
    
    if (isNaN(lat) || isNaN(lng)) {
      return 'Invalid location';
    }
    
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  return (
    <View style={styles.container}>
      {/* Map Header */}
      <View style={styles.mapHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.mapTitle}>Van Location</Text>
          <Text style={styles.vanNumber}>{vanInfo.vanNumber}</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <Text style={styles.refreshIcon}>🔄</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Map Area */}
      <View style={styles.mapContainer}>
        {location ? (
          <View style={styles.mapPlaceholder}>
            {/* In a real app, this would be a proper map component like react-native-maps */}
            <View style={styles.mapContent}>
              <Text style={styles.mapIcon}>🗺️</Text>
              <Text style={styles.mapText}>Live Map View</Text>
              <Text style={styles.coordinatesText}>{formatLocation(location)}</Text>
              
              {/* Van marker simulation */}
              <View style={styles.vanMarker}>
                <Text style={styles.vanMarkerIcon}>🚐</Text>
                <View style={styles.vanMarkerPulse} />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noLocationContainer}>
            <Text style={styles.noLocationIcon}>📍</Text>
            <Text style={styles.noLocationText}>Location not available</Text>
            <Text style={styles.noLocationSubtext}>Driver GPS is off or no signal</Text>
          </View>
        )}
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(vanInfo.status) }]} />
          <Text style={styles.statusText}>{getStatusText(vanInfo.status)}</Text>
        </View>
        <View style={styles.statusRight}>
          <Text style={styles.etaText}>ETA: {vanInfo.estimatedArrival}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: MAP_HEIGHT,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
  },
  headerLeft: {
    flex: 1,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  vanNumber: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  refreshIcon: {
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f4f8',
    position: 'relative',
  },
  mapContent: {
    alignItems: 'center',
  },
  mapIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  mapText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: Colors.light.icon,
    fontFamily: 'monospace',
  },
  vanMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vanMarkerIcon: {
    fontSize: 24,
    zIndex: 2,
  },
  vanMarkerPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    opacity: 0.3,
    zIndex: 1,
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLocationIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  noLocationSubtext: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  statusRight: {
    alignItems: 'flex-end',
  },
  etaText: {
    fontSize: 14,
    color: Colors.light.icon,
  },
});
