import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Colors } from '../../constants/theme';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the welcome animation sequence
    const animationSequence = Animated.sequence([
      // Fade in and scale up the logo
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      
      // Hold for a moment
      Animated.delay(500),
      
      // Rotate the logo slightly for a nice effect
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start();
  }, []);

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '3deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.light.primary} barStyle="light-content" />
      
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />
      
      {/* Main content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ]
          }
        ]}
      >
        {/* Logo container with rotation */}
        <Animated.View 
          style={[
            styles.logoContainer,
            { transform: [{ rotate: logoRotation }] }
          ]}
        >
          <Text style={styles.logoIcon}>🚐</Text>
        </Animated.View>
        
        {/* App name and tagline */}
        <Text style={styles.appName}>Kumfort</Text>
        <Text style={styles.tagline}>Safe rides. Peace of mind.</Text>
        
        </Animated.View>
        
      
      {/* CTA Button */}
      <Animated.View 
        style={[
          styles.buttonContainer,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={onGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </TouchableOpacity>
        
        <Text style={styles.trustText}>
          Trusted by 10,000+ parents across India
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.light.primary,
    opacity: 0.1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logoIcon: {
    fontSize: 60,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.light.background,
    marginBottom: 8,
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 20,
    color: Colors.light.background,
    fontWeight: '600',
    opacity: 0.9,
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.light.background,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    opacity: 0.8,
  },
  featuresList: {
    alignItems: 'flex-start',
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: Colors.light.background,
    fontWeight: '500',
    opacity: 0.9,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primary,
    marginRight: 8,
  },
  buttonArrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  trustText: {
    fontSize: 14,
    color: Colors.light.background,
    opacity: 0.7,
    textAlign: 'center',
  },
});
