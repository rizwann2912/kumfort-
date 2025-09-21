import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingNavigator from '../../src/navigation/OnboardingNavigator';
import EnhancedDashboardScreen from '../../src/screens/EnhancedDashboardScreen';

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

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('auth_token');
      const savedUser = await AsyncStorage.getItem('user_data');
      
      console.log('🔍 Checking auth status:');
      console.log('📱 Saved token:', savedToken ? 'exists' : 'none');
      console.log('👤 Saved user:', savedUser);
      
      if (savedToken && savedUser) {
        const userData = JSON.parse(savedUser);
        console.log('👤 Parsed user data:', userData);
        setToken(savedToken);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (userData: User, tokenData: string, profileData: any, schoolData: any) => {
    try {
      console.log('🎉 Onboarding complete:');
      console.log('👤 User data:', userData);
      console.log('🔑 Token:', tokenData ? 'exists' : 'none');
      console.log('📋 Profile data:', profileData);
      console.log('🏫 School data:', schoolData);
      
      setUser(userData);
      setToken(tokenData);
      await AsyncStorage.setItem('auth_token', tokenData);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      await AsyncStorage.setItem('profile_data', JSON.stringify(profileData));
      await AsyncStorage.setItem('school_data', JSON.stringify(schoolData));
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('profile_data');
      await AsyncStorage.removeItem('school_data');
      console.log('✅ Auth data cleared');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const clearStorage = async () => {
    try {
      console.log('🧹 Clearing all storage...');
      await AsyncStorage.clear();
      setUser(null);
      setToken(null);
      console.log('✅ Storage cleared');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (user && token) {
    return (
      <EnhancedDashboardScreen
        user={user}
        token={token}
        onLogout={handleLogout}
        onUpdateProfile={() => {
          // Navigate back to onboarding for profile update
          setUser(null);
          setToken(null);
        }}
      />
    );
  }

  return (
    <OnboardingNavigator
      onOnboardingComplete={handleOnboardingComplete}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});