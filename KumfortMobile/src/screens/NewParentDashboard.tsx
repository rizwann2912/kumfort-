import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/theme';
import VanLocationMap from '../components/VanLocationMap';
import LiveStatusCard from '../components/LiveStatusCard';
import SideMenu from '../components/SideMenu';
import { LocationData } from '../services/locationService';

interface User {
  id: number;
  phone_number: string;
  user_type: 'parent' | 'driver';
  first_name: string;
  last_name: string;
  is_new_user?: boolean;
  created_at?: string;
  is_active?: boolean;
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

interface NewParentDashboardProps {
  user: User;
  token?: string;
  onLogout: () => void;
  onUpdateProfile: () => void;
}

const { width, height } = Dimensions.get('window');

export default function NewParentDashboard({ user, token, onLogout, onUpdateProfile }: NewParentDashboardProps) {
  const [vanInfo] = useState<VanInfo>({
    vanId: 'VAN001',
    vanNumber: 'DL-01-AB-1234',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91-9876543210',
    route: 'Sector 45 → Sector 31 → Barakhamba Road',
    currentLocation: 'Near Sector 31 Metro Station',
    estimatedArrival: '5 minutes',
    status: 'on-time'
  });

  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getIcon = (name: string) => {
    const icons = {
      menu: '☰',
      edit: '✏️',
      logout: '🚪',
    };
    return icons[name as keyof typeof icons] || '❓';
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleCallDriver = () => {
    Alert.alert(
      'Call Driver',
      `Call ${vanInfo.driverName} at ${vanInfo.driverPhone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          console.log('Calling driver:', vanInfo.driverPhone);
        }}
      ]
    );
  };

  const handleMenuItemPress = (itemId: string) => {
    console.log('Menu item pressed:', itemId);
    // Handle different menu items
    switch (itemId) {
      case 'children':
        Alert.alert('Children', 'Children screen coming soon!');
        break;
      case 'van_details':
        Alert.alert('Van Details', 'Van details screen coming soon!');
        break;
      case 'notifications':
        Alert.alert('Notifications', 'Notifications settings coming soon!');
        break;
      case 'emergency':
        handleCallDriver();
        break;
      case 'settings':
        onUpdateProfile();
        break;
      case 'help':
        Alert.alert('Help', 'Help & Support coming soon!');
        break;
      default:
        console.log('Menu item not implemented:', itemId);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setSideMenuVisible(true)}
        >
          <Text style={styles.menuIcon}>{getIcon('menu')}</Text>
        </TouchableOpacity>
        
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back, {user.first_name}!</Text>
          <Text style={styles.welcomeSubtitle}>Track your child's van</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.editButton} onPress={onUpdateProfile}>
            <Text style={styles.editIcon}>{getIcon('edit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutIcon}>{getIcon('logout')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map View - 40% of screen */}
      <VanLocationMap
        location={currentLocation}
        vanInfo={vanInfo}
        onRefresh={handleRefresh}
        loading={refreshing}
      />

      {/* Live Status Card */}
      <Animated.View 
        style={[
          styles.statusContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <LiveStatusCard
          location={currentLocation}
          vanInfo={vanInfo}
          onCallDriver={handleCallDriver}
          onRefresh={handleRefresh}
          loading={refreshing}
        />
      </Animated.View>

      {/* Side Menu */}
      <SideMenu
        visible={sideMenuVisible}
        onClose={() => setSideMenuVisible(false)}
        onMenuItemPress={handleMenuItemPress}
        userType="parent"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  menuIcon: {
    fontSize: 20,
    color: Colors.light.text,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  editIcon: {
    fontSize: 16,
    color: Colors.light.text,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 16,
    color: Colors.light.primaryContrast,
  },
  statusContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});
