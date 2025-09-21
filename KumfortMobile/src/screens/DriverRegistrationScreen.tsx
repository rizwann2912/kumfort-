import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { getApiUrl, API_CONFIG } from '../config/api';

const { width } = Dimensions.get('window');

interface DriverRegistrationScreenProps {
  onComplete: (driverData: any) => void;
  onBack: () => void;
  phoneNumber: string;
}

export default function DriverRegistrationScreen({ onComplete, onBack, phoneNumber }: DriverRegistrationScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const getIcon = (name: string) => {
    const icons: { [key: string]: string } = {
      back: '←',
      driver: '🚐',
      check: '✓',
      error: '❌',
      info: 'ℹ️',
      success: '✅',
      arrow: '→',
    };
    return icons[name] || '';
  };

  const handleComplete = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showMessage('error', 'Please enter your full name');
      return;
    }

    if (!licenseNumber.trim()) {
      showMessage('error', 'Please enter your driving license number');
      return;
    }

    setLoading(true);
    try {
      // Here you would typically send the driver data to the backend
      // For now, we'll just pass it to the next screen
      const driverData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        licenseNumber: licenseNumber.trim(),
        phoneNumber,
        userType: 'driver',
      };

      showMessage('success', 'Driver registration completed!');
      
      // Small delay to show success message
      setTimeout(() => {
        onComplete(driverData);
      }, 1000);
    } catch (err: unknown) {
      console.error('Driver registration error:', err);
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      showMessage('error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>{getIcon('back')}</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.titleIcon}>{getIcon('driver')}</Text>
            <Text style={styles.title}>Driver Registration</Text>
          </View>
          <Text style={styles.subtitle}>
            Tell us a bit about yourself to get started
          </Text>
        </Animated.View>

        {/* Message Banner */}
        {message && (
          <Animated.View 
            style={[
              styles.messageBanner,
              styles[`messageBanner${message.type.charAt(0).toUpperCase() + message.type.slice(1)}`]
            ]}
          >
            <Text style={styles.messageIcon}>{getIcon(message.type)}</Text>
            <Text style={styles.messageText}>{message.text}</Text>
          </Animated.View>
        )}

        {/* Form Section */}
        <Animated.View 
          style={[
            styles.formSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Phone Number Display */}
          <View style={styles.phoneDisplay}>
            <Text style={styles.phoneLabel}>Registering for:</Text>
            <Text style={styles.phoneNumber}>{phoneNumber}</Text>
          </View>

          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your first name"
              placeholderTextColor="#94A3B8"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your last name"
              placeholderTextColor="#94A3B8"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* License Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Driving License Number *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your license number"
              placeholderTextColor="#94A3B8"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Text style={styles.inputHint}>
              This helps us verify your identity
            </Text>
          </View>
        </Animated.View>

        {/* Continue Button */}
        <Animated.View 
          style={[
            styles.buttonSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <TouchableOpacity
            style={[styles.continueButton, loading && styles.buttonDisabled]}
            onPress={handleComplete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.light.primaryContrast} />
            ) : (
              <>
                <Text style={styles.continueText}>Complete Registration</Text>
                <Text style={styles.continueIcon}>{getIcon('arrow')}</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  
  // Header
  header: {
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.light.text,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.icon,
    lineHeight: 24,
  },

  // Message Banner
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  messageBannerSuccess: {
    backgroundColor: Colors.light.success + '20',
    borderColor: Colors.light.success,
    borderWidth: 1,
  },
  messageBannerError: {
    backgroundColor: Colors.light.error + '20',
    borderColor: Colors.light.error,
    borderWidth: 1,
  },
  messageBannerInfo: {
    backgroundColor: Colors.light.info + '20',
    borderColor: Colors.light.info,
    borderWidth: 1,
  },
  messageIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },

  // Form Section
  formSection: {
    marginBottom: 40,
  },
  phoneDisplay: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  phoneLabel: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.light.text,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputHint: {
    fontSize: 14,
    color: Colors.light.icon,
    marginTop: 8,
  },

  // Button Section
  buttonSection: {
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primaryContrast,
    marginRight: 8,
  },
  continueIcon: {
    fontSize: 18,
    color: Colors.light.primaryContrast,
  },
});
