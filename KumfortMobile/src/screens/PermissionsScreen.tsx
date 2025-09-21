import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/theme';

interface PermissionsScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function PermissionsScreen({ onComplete, onBack }: PermissionsScreenProps) {
  const [locationPermission, setLocationPermission] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

  const requestLocationPermission = async () => {
    setIsRequesting(true);
    try {
      // In a real app, you would use expo-location or react-native-permissions
      // For now, we'll simulate the permission request
      setTimeout(() => {
        setLocationPermission(true);
        setIsRequesting(false);
        Alert.alert('Success', 'Location permission granted!');
      }, 1000);
    } catch (error) {
      setIsRequesting(false);
      Alert.alert('Permission Denied', 'Location permission is required for van tracking.');
    }
  };

  const requestNotificationPermission = async () => {
    setIsRequesting(true);
    try {
      // In a real app, you would use expo-notifications
      // For now, we'll simulate the permission request
      setTimeout(() => {
        setNotificationPermission(true);
        setIsRequesting(false);
        Alert.alert('Success', 'Notification permission granted!');
      }, 1000);
    } catch (error) {
      setIsRequesting(false);
      Alert.alert('Permission Denied', 'Notification permission is required for van alerts.');
    }
  };

  const handleContinue = () => {
    if (!locationPermission || !notificationPermission) {
      Alert.alert(
        'Permissions Required',
        'Please grant both location and notification permissions to use all features of the app.',
        [
          { text: 'Skip for Now', onPress: onComplete },
          { text: 'Grant Permissions', style: 'default' }
        ]
      );
    } else {
      onComplete();
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const getIcon = (name: string) => {
    const icons = {
      location: '📍',
      notification: '🔔',
      security: '🛡️',
      check: '✅',
      warning: '⚠️',
      settings: '⚙️',
    };
    return icons[name as keyof typeof icons] || '📍';
  };

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
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>Step 4 of 4</Text>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Enable permissions</Text>
            <Text style={styles.subtitle}>
              Grant these permissions to get the most out of Kumfort and ensure your child's safety.
            </Text>
          </View>

          {/* Location Permission */}
          <View style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <Text style={styles.permissionIcon}>{getIcon('location')}</Text>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>Location Access</Text>
                <Text style={styles.permissionSubtitle}>Track your child's van in real-time</Text>
              </View>
              {locationPermission && (
                <Text style={styles.checkIcon}>{getIcon('check')}</Text>
              )}
            </View>
            
            <Text style={styles.permissionDescription}>
              We use your location to show you when your child's van is nearby and provide accurate arrival times.
            </Text>
            
            <View style={styles.permissionFeatures}>
              <Text style={styles.featureItem}>• Real-time van tracking on map</Text>
              <Text style={styles.featureItem}>• "Van is 5 minutes away" alerts</Text>
              <Text style={styles.featureItem}>• Accurate pickup and drop-off times</Text>
            </View>

            {!locationPermission ? (
              <TouchableOpacity
                style={[styles.permissionButton, isRequesting && styles.buttonDisabled]}
                onPress={requestLocationPermission}
                disabled={isRequesting}
              >
                <Text style={styles.permissionButtonText}>
                  {isRequesting ? 'Requesting...' : 'Grant Location Access'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.grantedButton}>
                <Text style={styles.grantedButtonText}>✓ Location Access Granted</Text>
              </View>
            )}
          </View>

          {/* Notification Permission */}
          <View style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <Text style={styles.permissionIcon}>{getIcon('notification')}</Text>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>Push Notifications</Text>
                <Text style={styles.permissionSubtitle}>Get instant updates about your child</Text>
              </View>
              {notificationPermission && (
                <Text style={styles.checkIcon}>{getIcon('check')}</Text>
              )}
            </View>
            
            <Text style={styles.permissionDescription}>
              Receive important notifications about van delays, arrivals, and safety updates.
            </Text>
            
            <View style={styles.permissionFeatures}>
              <Text style={styles.featureItem}>• "Van has arrived at school" alerts</Text>
              <Text style={styles.featureItem}>• Delay notifications and updates</Text>
              <Text style={styles.featureItem}>• Emergency safety alerts</Text>
            </View>

            {!notificationPermission ? (
              <TouchableOpacity
                style={[styles.permissionButton, isRequesting && styles.buttonDisabled]}
                onPress={requestNotificationPermission}
                disabled={isRequesting}
              >
                <Text style={styles.permissionButtonText}>
                  {isRequesting ? 'Requesting...' : 'Enable Notifications'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.grantedButton}>
                <Text style={styles.grantedButtonText}>✓ Notifications Enabled</Text>
              </View>
            )}
          </View>

          {/* Security Note */}
          <View style={styles.securityCard}>
            <Text style={styles.securityIcon}>{getIcon('security')}</Text>
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Your Privacy is Protected</Text>
              <Text style={styles.securityDescription}>
                We only use your location to track your child's van. Your data is encrypted and never shared with third parties.
              </Text>
            </View>
          </View>

          {/* Settings Link */}
          <TouchableOpacity style={styles.settingsLink} onPress={openSettings}>
            <Text style={styles.settingsIcon}>{getIcon('settings')}</Text>
            <Text style={styles.settingsText}>Change permissions in Settings</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              {locationPermission && notificationPermission ? 'Complete Setup' : 'Continue Anyway'}
            </Text>
            <Text style={styles.buttonArrow}>→</Text>
          </TouchableOpacity>
        </View>
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
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  stepIndicator: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  permissionCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 2,
  },
  permissionSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  checkIcon: {
    fontSize: 20,
    color: Colors.light.primary,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  permissionFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
  },
  permissionButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primaryContrast,
  },
  grantedButton: {
    backgroundColor: Colors.light.success,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  grantedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primaryContrast,
  },
  securityCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 20,
  },
  settingsIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#64748B',
  },
  settingsText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primaryContrast,
    marginRight: 8,
  },
  buttonArrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primaryContrast,
  },
});
