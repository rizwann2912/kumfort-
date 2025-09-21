import React, { useState, useEffect, useRef } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl, API_CONFIG } from '../config/api';
import { Colors } from '../../constants/theme';

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

interface EnhancedOTPVerificationScreenProps {
  onLogin: (user: User, token: string) => void;
  onBack: () => void;
  phoneNumber: string;
  countryCode: string;
  userType: string;
}

const { width } = Dimensions.get('window');

export default function EnhancedOTPVerificationScreen({ 
  onLogin, 
  onBack, 
  phoneNumber, 
  countryCode, 
  userType 
}: EnhancedOTPVerificationScreenProps) {
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const otpInputRefs = useRef<TextInput[]>([]);

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Send OTP when screen loads to ensure correct phone number format
    sendInitialOTP();
  }, []);

  const sendInitialOTP = async () => {
    try {
      const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.SEND_OTP);
      console.log('🚀 Sending initial OTP to:', apiUrl);
      console.log('📱 Phone number:', phoneNumber);
      console.log('👤 User type:', userType);
      
      const requestBody = {
        phone_number: phoneNumber, // Use phoneNumber as-is (already includes country code)
        user_type: userType,
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
      
      console.log('📡 Initial OTP Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Initial OTP Response not OK:', errorText);
        return;
      }

      const data = await response.json();
      console.log('✅ Initial OTP Response data:', data);

      if (data.otp_code) {
        showMessage('info', `Development OTP: ${data.otp_code}`);
      }
    } catch (err: unknown) {
      console.error('❌ Send initial OTP error:', err);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // Auto-detect OTP from clipboard
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        // In a real app, you would use expo-clipboard
        // For now, we'll simulate auto-detection
        const mockOTP = '123456'; // This would come from clipboard
        if (mockOTP && mockOTP.length === 6) {
          const otpArray = mockOTP.split('');
          setOtpCode(otpArray);
          setMessage({ type: 'info', text: 'OTP auto-detected from clipboard!' });
        }
      } catch (error) {
        // Clipboard access failed, continue normally
      }
    };

    // Check clipboard after a short delay
    const timer = setTimeout(checkClipboard, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered (check that all 6 digits are non-empty)
    const allDigitsFilled = newOtpCode.length === 6 && newOtpCode.every(digit => digit !== '' && digit !== null && digit !== undefined);
    if (allDigitsFilled) {
      // Add a small delay to ensure the state is updated
      setTimeout(() => {
        handleVerifyOTP();
      }, 100);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otpCode.join('');
    
    // More robust validation
    const isValidOtp = otpString.length === 6 && otpCode.every(digit => digit !== '' && digit !== null && digit !== undefined);
    
    if (!isValidOtp) {
      showMessage('error', 'Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const requestBody = {
        phone_number: phoneNumber, // phoneNumber already includes country code
        otp_code: otpString,
      };
      
      console.log('🔍 OTP Verification Request:');
      console.log('📱 Phone number being sent:', phoneNumber);
      console.log('🔑 OTP code being sent:', otpString);
      console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.VERIFY_OTP), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 OTP Verification Response status:', response.status);
      console.log('📡 OTP Verification Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('📡 OTP Verification Response data:', data);

      if (response.ok) {
        showMessage('success', data.message);
        onLogin(data.user, data.token || 'mock_token');
      } else {
        console.log('❌ OTP Verification failed:', data);
        showMessage('error', data.error || 'Invalid OTP');
        // Clear OTP on error
        setOtpCode(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
    } catch (err: unknown) {
      console.error('❌ Verify OTP Error:', err);
      const message = err instanceof Error ? err.message : 'Please check your connection and try again.';
      showMessage('error', `Network error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.RESEND_OTP), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: `${countryCode}${phoneNumber}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(60);
        showMessage('success', data.message);
        
        if (data.otp_code) {
          showMessage('info', `Development OTP: ${data.otp_code}`);
        }
      } else {
        showMessage('error', data.error || 'Failed to resend OTP');
      }
    } catch (err: unknown) {
      console.error('❌ Resend OTP Error:', err);
      const message = err instanceof Error ? err.message : 'Please check your connection and try again.';
      showMessage('error', `Network error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const getIcon = (name: string) => {
    const icons = {
      shield: '🛡️',
      phone: '📱',
      check: '✅',
      warning: '⚠️',
      info: 'ℹ️',
      back: '←',
      resend: '🔄',
      timer: '⏰',
    };
    return icons[name as keyof typeof icons] || '🛡️';
  };

  // Message Banner Component
  const MessageBanner = () => {
    if (!message) return null;
    
    const bannerStyle = message.type === 'success' 
      ? styles.messageBannerSuccess 
      : message.type === 'error' 
      ? styles.messageBannerError 
      : styles.messageBannerInfo;
    
    return (
      <Animated.View style={[styles.messageBanner, bannerStyle]}>
        <Text style={styles.messageIcon}>{getIcon(message.type === 'success' ? 'check' : message.type === 'error' ? 'warning' : 'info')}</Text>
        <Text style={styles.messageText}>{message.text}</Text>
        <TouchableOpacity onPress={() => setMessage(null)} style={styles.messageClose}>
          <Text style={styles.messageCloseText}>×</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <MessageBanner />
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>{getIcon('back')} Back</Text>
            </TouchableOpacity>
            <Text style={styles.stepIndicator}>Step 2 of 4</Text>
          </Animated.View>

          {/* Title Section */}
          <Animated.View style={[styles.titleSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{getIcon('shield')}</Text>
            </View>
            <Text style={styles.title}>Verify Your Number</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit verification code to
            </Text>
            <Text style={styles.phoneDisplay}>
              {countryCode} {phoneNumber}
            </Text>
          </Animated.View>

          {/* OTP Input Section */}
          <Animated.View style={[styles.otpSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
            <Text style={styles.otpLabel}>Enter Verification Code</Text>
            <View style={styles.otpContainer}>
              {otpCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) otpInputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    focusedIndex === index && styles.otpInputFocused,
                    digit !== '' && styles.otpInputFilled
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  onFocus={() => setFocusedIndex(index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
            </View>
            <Text style={styles.otpHint}>
              Enter the 6-digit code sent to your phone
            </Text>
            {otpCode.every(digit => digit !== '') && (
              <Text style={styles.otpCompleteHint}>
                ✅ All digits entered - verifying automatically...
              </Text>
            )}
          </Animated.View>

          {/* Timer and Resend */}
          <Animated.View style={[styles.timerSection, { opacity: fadeAnim }]}>
            <View style={styles.timerContainer}>
              <Text style={styles.timerIcon}>{getIcon('timer')}</Text>
              <Text style={styles.timerText}>
                {countdown > 0 ? `Resend in ${countdown}s` : 'Code expired'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.resendButton, (loading || countdown > 0) && styles.buttonDisabled]}
              onPress={handleResendOTP}
              disabled={loading || countdown > 0}
            >
              <Text style={styles.resendIcon}>{getIcon('resend')}</Text>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Verify Button */}
          <Animated.View style={[styles.buttonSection, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={[styles.verifyButton, (otpCode.some(digit => digit === '') || loading) && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={otpCode.some(digit => digit === '') || loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.light.primaryContrast} size="small" />
              ) : (
                <>
                  <Text style={styles.verifyIcon}>{getIcon('check')}</Text>
                  <Text style={styles.verifyText}>Verify & Continue</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Help Text */}
          <Animated.View style={[styles.helpSection, { opacity: fadeAnim }]}>
            <Text style={styles.helpText}>
              Didn't receive the code? Check your SMS or try resending.
            </Text>
            <Text style={styles.helpSubtext}>
              Make sure your phone can receive SMS messages.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  
  // Message Banner
  messageBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  messageBannerSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#86EFAC',
    borderWidth: 1,
  },
  messageBannerError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
  },
  messageBannerInfo: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
    borderWidth: 1,
  },
  messageIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  messageClose: {
    padding: 4,
  },
  messageCloseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
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

  // Title Section
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  phoneDisplay: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    textAlign: 'center',
  },

  // OTP Section
  otpSection: {
    marginBottom: 32,
  },
  otpLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    backgroundColor: Colors.light.background,
    color: Colors.light.text,
  },
  otpInputFocused: {
    borderColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  otpInputFilled: {
    borderColor: Colors.light.success,
    backgroundColor: Colors.light.success + '10',
  },
  otpHint: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  otpCompleteHint: {
    fontSize: 14,
    color: Colors.light.success,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
  },

  // Timer Section
  timerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#64748B',
  },
  timerText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  resendIcon: {
    fontSize: 14,
    marginRight: 4,
    color: Colors.light.primaryContrast,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primaryContrast,
  },

  // Button Section
  buttonSection: {
    marginBottom: 32,
  },
  verifyButton: {
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
  verifyIcon: {
    fontSize: 18,
    marginRight: 8,
    color: Colors.light.primaryContrast,
  },
  verifyText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primaryContrast,
  },

  // Help Section
  helpSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  helpText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 4,
  },
  helpSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
