import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
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

interface LiveStatusCardProps {
  location: LocationData | null;
  vanInfo: VanInfo;
  onCallDriver: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export default function LiveStatusCard({ location, vanInfo, onCallDriver, onRefresh, loading = false }: LiveStatusCardProps) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (location && location.is_active) {
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
    if (!location) return false;
    const timeDiff = Date.now() - new Date(location.timestamp).getTime();
    return timeDiff < 120000; // 2 minutes
  };

  return (
    <View style={styles.container}>
      {/* Status Header */}
      <View style={styles.statusHeader}>
        <View style={styles.statusLeft}>
          <Animated.View style={[styles.statusIndicator, { transform: [{ scale: pulseAnim }] }]}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: isLocationRecent() ? Colors.light.success : Colors.light.border }
            ]} />
          </Animated.View>
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>
              {isLocationRecent() ? 'Live Tracking' : 'Location Offline'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isLocationRecent() ? 'Real-time updates active' : 'Last seen: ' + (location ? getTimeAgo(new Date(location.timestamp)) : 'Unknown')}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vanInfo.status) }]}>
          <Text style={styles.statusBadgeText}>{getStatusText(vanInfo.status)}</Text>
        </View>
      </View>

      {/* Driver Info */}
      <View style={styles.driverInfo}>
        <View style={styles.driverLeft}>
          <Text style={styles.driverIcon}>👨‍💼</Text>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{vanInfo.driverName}</Text>
            <Text style={styles.driverPhone}>{vanInfo.driverPhone}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.callButton} onPress={onCallDriver}>
          <Text style={styles.callIcon}>📞</Text>
          <Text style={styles.callText}>Call</Text>
        </TouchableOpacity>
      </View>

      {/* Location Info */}
      <View style={styles.locationInfo}>
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{vanInfo.currentLocation}</Text>
        </View>
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>⏰</Text>
          <Text style={styles.locationText}>ETA: {vanInfo.estimatedArrival}</Text>
        </View>
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>🛣️</Text>
          <Text style={styles.locationText}>{vanInfo.route}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={loading}>
          <Text style={styles.refreshIcon}>🔄</Text>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewMapButton}>
          <Text style={styles.viewMapIcon}>🗺️</Text>
          <Text style={styles.viewMapText}>View Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    marginRight: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primaryContrast,
  },
  driverInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  driverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  driverPhone: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  callIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  callText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primaryContrast,
  },
  locationInfo: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  locationText: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  refreshIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  viewMapIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  viewMapText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primaryContrast,
  },
});
