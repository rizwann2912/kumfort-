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

interface PhoneOnlyLoginScreenProps {
  onUserExists: (phoneNumber: string, userType: string, userData: any) => void;
  onUserNotExists: (phoneNumber: string) => void;
  onBack: () => void;
}

const countryCodes = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
];

export default function PhoneOnlyLoginScreen({ onUserExists, onUserNotExists, onBack }: PhoneOnlyLoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

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
      phone: '📱',
      back: '←',
      check: '✓',
      error: '❌',
      info: 'ℹ️',
      success: '✅',
    };
    return icons[name] || '';
  };

  const testConnection = async () => {
    try {
      const testUrl = getApiUrl('/test/');
      console.log('🔍 Testing connection to:', testUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(testUrl, { 
        method: 'GET', 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      console.log('✅ Connection test result:', data);
      return true;
    } catch (err) {
      console.error('❌ Connection test failed:', err);
      return false;
    }
  };

  const checkUserExists = async () => {
    if (!phoneNumber.trim()) {
      showMessage('error', 'Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const isConnected = await testConnection();
      if (!isConnected) {
        showMessage('error', 'Cannot connect to server. Please check your internet connection.');
        return;
      }

      const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.CHECK_USER);
      console.log('🔍 Checking user existence:', apiUrl);
      console.log('📱 Phone number:', `${countryCode}${phoneNumber}`);
      
      const requestBody = {
        phone_number: `${countryCode}${phoneNumber}`,
      };
      console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log('📡 Check user response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Check user response not OK:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          showMessage('error', errorData.error || 'Failed to check user status');
        } catch {
          showMessage('error', `Server error: ${response.status} - ${errorText}`);
        }
        return;
      }

      const data = await response.json();
      console.log('✅ Check user response data:', data);

      if (data.exists) {
        showMessage('success', `Welcome back, ${data.first_name || 'User'}!`);
        onUserExists(`${countryCode}${phoneNumber}`, data.user_type, data);
      } else {
        showMessage('info', 'New user detected. Let\'s get you registered!');
        onUserNotExists(`${countryCode}${phoneNumber}`);
      }
    } catch (err: unknown) {
      console.error('Check user error:', err);
      const message = err instanceof Error ? err.message : 'Please check your connection and try again.';
      showMessage('error', `Network error: ${message}`);
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
          <Text style={styles.title}>Enter Your Phone Number</Text>
          <Text style={styles.subtitle}>
            We'll check if you're already registered with us
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

        {/* Phone Input Section */}
        <Animated.View 
          style={[
            styles.inputSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.inputLabel}>Phone Number</Text>
          
          <View style={styles.phoneInputContainer}>
            {/* Country Code Selector */}
            <TouchableOpacity 
              style={styles.countryCodeButton}
              onPress={() => setShowCountryPicker(!showCountryPicker)}
            >
              <Text style={styles.countryFlag}>
                {countryCodes.find(cc => cc.code === countryCode)?.flag}
              </Text>
              <Text style={styles.countryCode}>{countryCode}</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>

            {/* Country Code Picker */}
            {showCountryPicker && (
              <View style={styles.countryPicker}>
                {countryCodes.map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={[
                      styles.countryOption,
                      countryCode === country.code && styles.countryOptionSelected
                    ]}
                    onPress={() => {
                      setCountryCode(country.code);
                      setShowCountryPicker(false);
                    }}
                  >
                    <Text style={styles.countryFlag}>{country.flag}</Text>
                    <Text style={styles.countryName}>{country.country}</Text>
                    <Text style={styles.countryCode}>{country.code}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Phone Number Input */}
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter your phone number"
              placeholderTextColor="#94A3B8"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={15}
              autoFocus
            />
          </View>

          <Text style={styles.inputHint}>
            We'll send you an OTP to verify your number
          </Text>
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
            onPress={checkUserExists}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.light.primaryContrast} />
            ) : (
              <>
                <Text style={styles.continueIcon}>{getIcon('check')}</Text>
                <Text style={styles.continueText}>Continue</Text>
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
    marginBottom: 40,
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
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

  // Input Section
  inputSection: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: Colors.light.border,
    marginRight: 12,
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginRight: 4,
  },
  dropdownIcon: {
    fontSize: 12,
    color: Colors.light.icon,
  },
  countryPicker: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  countryOptionSelected: {
    backgroundColor: Colors.light.primary + '10',
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 16,
  },
  inputHint: {
    fontSize: 14,
    color: Colors.light.icon,
    marginTop: 8,
    textAlign: 'center',
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
  continueIcon: {
    fontSize: 18,
    marginRight: 8,
    color: Colors.light.primaryContrast,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primaryContrast,
  },
});
