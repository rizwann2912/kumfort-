import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Switch,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/theme';
import GPSTrackingCard from '../components/GPSTrackingCard';
import VanTrackingCard from '../components/VanTrackingCard';
import VanLocationMap from '../components/VanLocationMap';
import LiveStatusCard from '../components/LiveStatusCard';
import SideMenu from '../components/SideMenu';
import NewParentDashboard from './NewParentDashboard';
import { LocationData } from '../services/locationService';

interface EnhancedDashboardScreenProps {
  user: User;
  token?: string;
  onLogout: () => void;
  onUpdateProfile: () => void;
}

interface User {
  id: number;
  phone_number: string;
  user_type: string;
  first_name: string;
  last_name: string;
  is_new_user?: boolean;
  created_at?: string;
  is_active?: boolean;
}

interface Child {
  name: string;
  grade: string;
  school: string;
  admissionNumber: string;
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

const { width } = Dimensions.get('window');

export default function EnhancedDashboardScreen({ user, token, onLogout, onUpdateProfile }: EnhancedDashboardScreenProps) {
  const [children] = useState<Child[]>([
    { name: 'Arjun Sharma', grade: '5th Grade', school: 'Delhi Public School', admissionNumber: 'DPS2024001' },
    { name: 'Priya Sharma', grade: '3rd Grade', school: 'Delhi Public School', admissionNumber: 'DPS2024002' },
  ]);
  
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

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isTracking, setIsTracking] = useState(true);
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
      home: '🏠',
      user: '👤',
      van: '🚐',
      driver: '👨‍💼',
      phone: '📞',
      route: '🗺️',
      location: '📍',
      time: '⏰',
      bell: '🔔',
      logout: '🚪',
      edit: '✏️',
      check: '✅',
      warning: '⚠️',
      child: '👶',
      school: '🏫',
      grade: '📚',
      menu: '☰',
      arrow: '→',
    };
    return icons[name as keyof typeof icons] || '🏠';
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
        // Navigate to children screen
        break;
      case 'van_details':
        // Show van details
        break;
      case 'notifications':
        // Open notifications settings
        break;
      default:
        console.log('Menu item not implemented:', itemId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return Colors.light.success;
      case 'delayed': return '#F59E0B';
      case 'arrived': return Colors.light.primary;
      default: return Colors.light.text;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-time': return 'On Time';
      case 'delayed': return 'Delayed';
      case 'arrived': return 'Arrived';
      default: return status;
    }
  };

  // Use new parent dashboard for parents
  if (user.user_type === 'parent') {
    return (
      <NewParentDashboard
        user={user}
        token={token}
        onLogout={onLogout}
        onUpdateProfile={onUpdateProfile}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeIcon}>{getIcon('home')}</Text>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user.first_name || 'User'}!</Text>
            </View>
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

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Van Status Card - Different for Drivers vs Parents */}
          {user.user_type === 'driver' ? (
            // Driver's own van info
            <View style={styles.vanStatusCard}>
              <View style={styles.vanHeader}>
                <Text style={styles.vanIcon}>{getIcon('van')}</Text>
                <View style={styles.vanInfo}>
                  <Text style={styles.vanNumber}>{vanInfo.vanNumber}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vanInfo.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(vanInfo.status)}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.vanDetails}>
                <View style={styles.vanDetailRow}>
                  <Text style={styles.vanDetailIcon}>{getIcon('route')}</Text>
                  <Text style={styles.vanDetailText}>{vanInfo.route}</Text>
                </View>
                <View style={styles.vanDetailRow}>
                  <Text style={styles.vanDetailIcon}>{getIcon('location')}</Text>
                  <Text style={styles.vanDetailText}>{vanInfo.currentLocation}</Text>
                </View>
                <View style={styles.vanDetailRow}>
                  <Text style={styles.vanDetailIcon}>{getIcon('time')}</Text>
                  <Text style={styles.vanDetailText}>Next Stop: {vanInfo.estimatedArrival}</Text>
                </View>
                <View style={styles.vanDetailRow}>
                  <Text style={styles.vanDetailIcon}>{getIcon('child')}</Text>
                  <Text style={styles.vanDetailText}>Students: 12 on board</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.trackButton}>
                <Text style={styles.trackButtonText}>Navigate Route</Text>
                <Text style={styles.trackButtonIcon}>{getIcon('route')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Parent's van tracking info
            <View style={styles.vanStatusCard}>
              <View style={styles.vanHeader}>
                <Text style={styles.vanIcon}>{getIcon('van')}</Text>
                <View style={styles.vanInfo}>
                  <Text style={styles.vanNumber}>{vanInfo.vanNumber}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vanInfo.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(vanInfo.status)}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.vanDetails}>
                <View style={styles.vanDetailRow}>
                  <Text style={styles.vanDetailIcon}>{getIcon('driver')}</Text>
                  <Text style={styles.vanDetailText}>{vanInfo.driverName}</Text>
                </View>
                <View style={styles.vanDetailRow}>
                  <Text style={styles.vanDetailIcon}>{getIcon('phone')}</Text>
                  <Text style={styles.vanDetailText}>{vanInfo.driverPhone}</Text>
                </View>
                <View style={styles.vanDetailRow}>
                  <Text style={styles.vanDetailIcon}>{getIcon('location')}</Text>
                  <Text style={styles.vanDetailText}>{vanInfo.currentLocation}</Text>
                </View>
                <View style={styles.vanDetailRow}>
                  <Text style={styles.vanDetailIcon}>{getIcon('time')}</Text>
                  <Text style={styles.vanDetailText}>ETA: {vanInfo.estimatedArrival}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.trackButton}>
                <Text style={styles.trackButtonText}>View on Map</Text>
                <Text style={styles.trackButtonIcon}>{getIcon('route')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Children Cards - Only for Parents */}
          {user.user_type === 'parent' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Children</Text>
              {children.map((child, index) => (
                <View key={index} style={styles.childCard}>
                  <View style={styles.childHeader}>
                    <Text style={styles.childIcon}>{getIcon('child')}</Text>
                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>{child.name}</Text>
                      <Text style={styles.childGrade}>{child.grade}</Text>
                    </View>
                    <View style={styles.childStatus}>
                      <Text style={styles.statusIcon}>{getIcon('check')}</Text>
                      <Text style={styles.statusText}>Safe</Text>
                    </View>
                  </View>
                  
                  <View style={styles.childDetails}>
                    <View style={styles.childDetailRow}>
                      <Text style={styles.childDetailIcon}>{getIcon('school')}</Text>
                      <Text style={styles.childDetailText}>{child.school}</Text>
                    </View>
                    <View style={styles.childDetailRow}>
                      <Text style={styles.childDetailIcon}>{getIcon('grade')}</Text>
                      <Text style={styles.childDetailText}>Admission: {child.admissionNumber}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Students on Board - Only for Drivers */}
          {user.user_type === 'driver' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Students on Board</Text>
              <View style={styles.studentsCard}>
                <View style={styles.studentsHeader}>
                  <Text style={styles.studentsIcon}>{getIcon('child')}</Text>
                  <View style={styles.studentsInfo}>
                    <Text style={styles.studentsCount}>12 Students</Text>
                    <Text style={styles.studentsStatus}>All Present</Text>
                  </View>
                  <View style={styles.studentsStatusBadge}>
                    <Text style={styles.studentsStatusText}>Safe</Text>
                  </View>
                </View>
                
                <View style={styles.studentsDetails}>
                  <View style={styles.studentsDetailRow}>
                    <Text style={styles.studentsDetailIcon}>{getIcon('school')}</Text>
                    <Text style={styles.studentsDetailText}>Delhi Public School</Text>
                  </View>
                  <View style={styles.studentsDetailRow}>
                    <Text style={styles.studentsDetailIcon}>{getIcon('time')}</Text>
                    <Text style={styles.studentsDetailText}>Pickup: 7:30 AM | Drop: 2:30 PM</Text>
                  </View>
                  <View style={styles.studentsDetailRow}>
                    <Text style={styles.studentsDetailIcon}>{getIcon('route')}</Text>
                    <Text style={styles.studentsDetailText}>Route: Sector 45 → Sector 31 → Barakhamba Road</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.studentsButton}>
                  <Text style={styles.studentsButtonText}>View Student List</Text>
                  <Text style={styles.studentsButtonIcon}>{getIcon('arrow')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* GPS Tracking - Show different components based on user type */}
          {user.user_type === 'driver' ? (
            <GPSTrackingCard 
              onLocationUpdate={(location: LocationData) => {
                console.log('Location updated:', location);
              }}
              authToken={token || ''}
            />
          ) : user.user_type === 'parent' ? (
            <VanTrackingCard 
              authToken={token || ''}
              onError={(error: string) => {
                console.error('Van tracking error:', error);
              }}
            />
          ) : null}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              {user.user_type === 'driver' ? (
                // Driver-specific actions
                <>
                  <TouchableOpacity style={styles.actionCard}>
                    <Text style={styles.actionIcon}>{getIcon('location')}</Text>
                    <Text style={styles.actionTitle}>Share Location</Text>
                    <Text style={styles.actionSubtitle}>GPS tracking</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionCard}>
                    <Text style={styles.actionIcon}>{getIcon('child')}</Text>
                    <Text style={styles.actionTitle}>Student List</Text>
                    <Text style={styles.actionSubtitle}>On board</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionCard}>
                    <Text style={styles.actionIcon}>{getIcon('route')}</Text>
                    <Text style={styles.actionTitle}>Route Map</Text>
                    <Text style={styles.actionSubtitle}>Navigation</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionCard}>
                    <Text style={styles.actionIcon}>{getIcon('bell')}</Text>
                    <Text style={styles.actionTitle}>Alerts</Text>
                    <Text style={styles.actionSubtitle}>Emergency</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Parent-specific actions
                <>
                  <TouchableOpacity style={styles.actionCard}>
                    <Text style={styles.actionIcon}>{getIcon('van')}</Text>
                    <Text style={styles.actionTitle}>Track Van</Text>
                    <Text style={styles.actionSubtitle}>Live location</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionCard}>
                    <Text style={styles.actionIcon}>{getIcon('phone')}</Text>
                    <Text style={styles.actionTitle}>Call Driver</Text>
                    <Text style={styles.actionSubtitle}>Direct contact</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionCard}>
                    <Text style={styles.actionIcon}>{getIcon('bell')}</Text>
                    <Text style={styles.actionTitle}>Notifications</Text>
                    <Text style={styles.actionSubtitle}>Alerts & updates</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionCard}>
                    <Text style={styles.actionIcon}>{getIcon('route')}</Text>
                    <Text style={styles.actionTitle}>Route Info</Text>
                    <Text style={styles.actionSubtitle}>Pickup points</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingIcon}>{getIcon('bell')}</Text>
                  <View>
                    <Text style={styles.settingTitle}>Push Notifications</Text>
                    <Text style={styles.settingSubtitle}>Get alerts about van status</Text>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#E2E8F0', true: Colors.light.primary }}
                  thumbColor={notificationsEnabled ? Colors.light.primaryContrast : '#F4F4F4'}
                />
              </View>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingIcon}>{getIcon('location')}</Text>
                  <View>
                    <Text style={styles.settingTitle}>Location Tracking</Text>
                    <Text style={styles.settingSubtitle}>Track van location</Text>
                  </View>
                </View>
                <Switch
                  value={isTracking}
                  onValueChange={setIsTracking}
                  trackColor={{ false: '#E2E8F0', true: Colors.light.primary }}
                  thumbColor={isTracking ? Colors.light.primaryContrast : '#F4F4F4'}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  welcomeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.light.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  editIcon: {
    fontSize: 20,
    color: Colors.light.primary,
  },
  logoutButton: {
    padding: 8,
  },
  logoutIcon: {
    fontSize: 20,
    color: '#EF4444',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  vanStatusCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  vanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  vanIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  vanInfo: {
    flex: 1,
  },
  vanNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.primaryContrast,
    textTransform: 'uppercase',
  },
  vanDetails: {
    marginBottom: 20,
  },
  vanDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vanDetailIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  vanDetailText: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  trackButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primaryContrast,
    marginRight: 8,
  },
  trackButtonIcon: {
    fontSize: 16,
    color: Colors.light.primaryContrast,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 16,
  },
  childCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  childIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 2,
  },
  childGrade: {
    fontSize: 14,
    color: '#64748B',
  },
  childStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
    color: Colors.light.primaryContrast,
  },
  childDetails: {
    gap: 8,
  },
  childDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childDetailIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 16,
  },
  childDetailText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    width: (width - 60) / 2,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  settingsCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },

  // Students Card (Driver-specific)
  studentsCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  studentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  studentsInfo: {
    flex: 1,
  },
  studentsCount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  studentsStatus: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  studentsStatusBadge: {
    backgroundColor: Colors.light.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  studentsStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primaryContrast,
  },
  studentsDetails: {
    marginBottom: 16,
  },
  studentsDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentsDetailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  studentsDetailText: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  studentsButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  studentsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primaryContrast,
    marginRight: 8,
  },
  studentsButtonIcon: {
    fontSize: 16,
    color: Colors.light.primaryContrast,
  },
});
