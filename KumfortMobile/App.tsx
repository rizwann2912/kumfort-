import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import OnboardingNavigator from './src/navigation/OnboardingNavigator';
import EnhancedDashboardScreen from './src/screens/EnhancedDashboardScreen';

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

type RootStackParamList = {
  Onboarding: undefined;
  Dashboard: {
    user: User;
    token: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
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
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (userData: User, profileData: any, schoolData: any) => {
    try {
      // Generate a mock token for now
      const authToken = `token_${Date.now()}`;
      
      setUser(userData);
      setToken(authToken);
      await AsyncStorage.setItem('auth_token', authToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      await AsyncStorage.setItem('profile_data', JSON.stringify(profileData));
      await AsyncStorage.setItem('school_data', JSON.stringify(schoolData));
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('profile_data');
      await AsyncStorage.removeItem('school_data');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {user && token ? (
          <Stack.Screen name="Dashboard">
            {(props) => (
              <EnhancedDashboardScreen
                {...props}
                user={user}
                onLogout={handleLogout}
                onUpdateProfile={() => {
                  // Navigate back to onboarding for profile update
                  setUser(null);
                  setToken(null);
                }}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingNavigator
                {...props}
                onOnboardingComplete={handleOnboardingComplete}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
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

