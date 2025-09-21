import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import PhoneOnlyLoginScreen from '../screens/PhoneOnlyLoginScreen';
import UserTypeSelectionScreen from '../screens/UserTypeSelectionScreen';
import EnhancedOTPVerificationScreen from '../screens/EnhancedOTPVerificationScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import DriverRegistrationScreen from '../screens/DriverRegistrationScreen';
import SchoolLinkingScreen from '../screens/SchoolLinkingScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import EnhancedDashboardScreen from '../screens/EnhancedDashboardScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  PhoneOnlyLogin: undefined;
  UserTypeSelection: { phoneNumber: string };
  OTPVerification: { phoneNumber: string; countryCode: string; userType: string };
  ProfileSetup: undefined;
  DriverRegistration: { phoneNumber: string };
  SchoolLinking: { children: any[] };
  Permissions: undefined;
  Dashboard: { user: any };
};

const Stack = createStackNavigator<OnboardingStackParamList>();

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

interface OnboardingNavigatorProps {
  onOnboardingComplete: (user: User, token: string, profileData: any, schoolData: any) => void;
}

export default function OnboardingNavigator({ onOnboardingComplete }: OnboardingNavigatorProps) {
  const [onboardingData, setOnboardingData] = useState<{
    user: User | null;
    token: string | null;
    profileData: any;
    schoolData: any;
  }>({
    user: null,
    token: null,
    profileData: null,
    schoolData: null,
  });

  const handleProfileComplete = (profileData: any) => {
    setOnboardingData(prev => ({ ...prev, profileData }));
  };

  const handleSchoolComplete = (schoolData: any) => {
    setOnboardingData(prev => ({ ...prev, schoolData }));
  };

  const handlePermissionsComplete = () => {
    // Complete onboarding
    if (onboardingData.user && onboardingData.token) {
      onOnboardingComplete(onboardingData.user, onboardingData.token, onboardingData.profileData, onboardingData.schoolData);
    }
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
        <Stack.Screen name="Welcome">
          {({ navigation }) => (
            <WelcomeScreen
              onGetStarted={() => navigation.navigate('PhoneOnlyLogin')}
            />
          )}
        </Stack.Screen>
        
        <Stack.Screen name="PhoneOnlyLogin">
          {({ navigation }) => (
            <PhoneOnlyLoginScreen
              onUserExists={(phoneNumber, userType, userData) => {
                // User exists, go directly to OTP verification
                // Use the full phone number as-is since it already includes country code
                navigation.navigate('OTPVerification', { 
                  phoneNumber, 
                  countryCode: phoneNumber.substring(0, 3), // Extract country code for display
                  userType 
                });
              }}
              onUserNotExists={(phoneNumber) => {
                // User doesn't exist, go to user type selection
                navigation.navigate('UserTypeSelection', { phoneNumber });
              }}
              onBack={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
        
        <Stack.Screen name="UserTypeSelection">
          {({ navigation, route }) => (
            <UserTypeSelectionScreen
              phoneNumber={route.params?.phoneNumber || ''}
              onUserTypeSelected={(userType) => {
                // Navigate to OTP verification with selected user type
                const phoneNumber = route.params?.phoneNumber || '';
                navigation.navigate('OTPVerification', { 
                  phoneNumber, 
                  countryCode: phoneNumber.substring(0, 3), // Extract country code for display
                  userType 
                });
              }}
              onBack={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
        
      
      <Stack.Screen name="OTPVerification">
        {({ navigation, route }) => (
          <EnhancedOTPVerificationScreen
            onLogin={(user, token) => {
              console.log('🎉 OTP Login successful:');
              console.log('👤 User data:', user);
              console.log('🔑 Token:', token);
              console.log('👤 First name:', user.first_name);
              console.log('👤 Last name:', user.last_name);
              console.log('👤 Has first name:', !!user.first_name);
              console.log('👤 Has last name:', !!user.last_name);
              
              setOnboardingData(prev => ({ ...prev, user, token }));
              
              // Check if this is an existing user (has user data) or new user
              if (user.first_name && user.last_name) {
                console.log('✅ Existing user detected - going to dashboard');
                // Existing user - go directly to dashboard
                // Call onOnboardingComplete directly with the user and token
                onOnboardingComplete(user, token, null, null);
              } else {
                console.log('🆕 New user detected - continuing registration');
                // New user - continue with registration flow based on user type
                const userType = route.params?.userType || 'parent';
                if (userType === 'driver') {
                  navigation.navigate('DriverRegistration', { 
                    phoneNumber: route.params?.phoneNumber || '' 
                  });
                } else {
                  navigation.navigate('ProfileSetup');
                }
              }
            }}
            onBack={() => navigation.goBack()}
            phoneNumber={route.params?.phoneNumber || ''}
            countryCode={route.params?.countryCode || '+91'}
            userType={route.params?.userType || 'parent'}
          />
        )}
      </Stack.Screen>
      
      <Stack.Screen name="ProfileSetup">
        {({ navigation }) => (
          <ProfileSetupScreen
            onComplete={(profileData) => {
              handleProfileComplete(profileData);
              navigation.navigate('SchoolLinking', { children: profileData.children });
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      
      <Stack.Screen name="DriverRegistration">
        {({ navigation, route }) => (
          <DriverRegistrationScreen
            phoneNumber={route.params?.phoneNumber || ''}
            onComplete={(driverData) => {
              // For drivers, we can go directly to permissions
              handleProfileComplete(driverData);
              navigation.navigate('Permissions');
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      
      <Stack.Screen name="SchoolLinking">
        {({ navigation, route }) => (
          <SchoolLinkingScreen
            onComplete={(schoolData) => {
              handleSchoolComplete(schoolData);
              navigation.navigate('Permissions');
            }}
            onBack={() => navigation.goBack()}
            children={route.params?.children || []}
          />
        )}
      </Stack.Screen>
      
      <Stack.Screen name="Permissions">
        {({ navigation }) => (
          <PermissionsScreen
            onComplete={handlePermissionsComplete}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

