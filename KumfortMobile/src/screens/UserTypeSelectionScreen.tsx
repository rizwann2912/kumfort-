import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants/theme';

const { width } = Dimensions.get('window');

interface UserTypeSelectionScreenProps {
  onUserTypeSelected: (userType: 'parent' | 'driver') => void;
  onBack: () => void;
  phoneNumber: string;
}

export default function UserTypeSelectionScreen({ onUserTypeSelected, onBack, phoneNumber }: UserTypeSelectionScreenProps) {
  const [selectedType, setSelectedType] = useState<'parent' | 'driver' | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getIcon = (name: string) => {
    const icons: { [key: string]: string } = {
      back: '←',
      parent: '👨‍👩‍👧‍👦',
      driver: '🚐',
      check: '✓',
      arrow: '→',
    };
    return icons[name] || '';
  };

  const handleContinue = () => {
    if (selectedType) {
      onUserTypeSelected(selectedType);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim, 
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ] 
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>{getIcon('back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            How will you be using Kumfort?
          </Text>
        </View>

        {/* Phone Number Display */}
        <View style={styles.phoneDisplay}>
          <Text style={styles.phoneLabel}>Registering for:</Text>
          <Text style={styles.phoneNumber}>{phoneNumber}</Text>
        </View>

        {/* User Type Options */}
        <View style={styles.optionsContainer}>
          {/* Parent Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === 'parent' && styles.optionCardSelected
            ]}
            onPress={() => setSelectedType('parent')}
          >
            <View style={styles.optionIconContainer}>
              <Text style={styles.optionIcon}>{getIcon('parent')}</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Parent</Text>
              <Text style={styles.optionDescription}>
                Track your child's school van and receive real-time updates
              </Text>
              <View style={styles.optionFeatures}>
                <Text style={styles.featureText}>• Live van tracking</Text>
                <Text style={styles.featureText}>• Driver contact info</Text>
                <Text style={styles.featureText}>• Pickup/drop notifications</Text>
                <Text style={styles.featureText}>• Route information</Text>
              </View>
            </View>
            {selectedType === 'parent' && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedIcon}>{getIcon('check')}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Driver Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === 'driver' && styles.optionCardSelected
            ]}
            onPress={() => setSelectedType('driver')}
          >
            <View style={styles.optionIconContainer}>
              <Text style={styles.optionIcon}>{getIcon('driver')}</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Driver</Text>
              <Text style={styles.optionDescription}>
                Manage your van route and share location with parents
              </Text>
              <View style={styles.optionFeatures}>
                <Text style={styles.featureText}>• GPS location sharing</Text>
                <Text style={styles.featureText}>• Route management</Text>
                <Text style={styles.featureText}>• Student pickup/drop</Text>
                <Text style={styles.featureText}>• Emergency contacts</Text>
              </View>
            </View>
            {selectedType === 'driver' && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedIcon}>{getIcon('check')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedType && styles.buttonDisabled
            ]}
            onPress={handleContinue}
            disabled={!selectedType}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Text style={styles.continueIcon}>{getIcon('arrow')}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
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

  // Phone Display
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

  // Options Container
  optionsContainer: {
    flex: 1,
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '05',
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.light.icon,
    lineHeight: 20,
    marginBottom: 12,
  },
  optionFeatures: {
    marginTop: 8,
  },
  featureText: {
    fontSize: 13,
    color: Colors.light.icon,
    lineHeight: 18,
    marginBottom: 2,
  },
  selectedIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  selectedIcon: {
    fontSize: 16,
    color: Colors.light.primaryContrast,
    fontWeight: 'bold',
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
