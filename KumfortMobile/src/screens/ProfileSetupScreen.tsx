import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/theme';

interface ProfileSetupScreenProps {
  onComplete: (profileData: ProfileData) => void;
  onBack: () => void;
}

interface ProfileData {
  parentName: string;
  parentEmail: string;
  children: ChildData[];
}

interface ChildData {
  name: string;
  grade: string;
  school: string;
}

export default function ProfileSetupScreen({ onComplete, onBack }: ProfileSetupScreenProps) {
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [children, setChildren] = useState<ChildData[]>([
    { name: '', grade: '', school: '' }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  
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

  const addChild = () => {
    if (children.length < 3) {
      setChildren([...children, { name: '', grade: '', school: '' }]);
    } else {
      Alert.alert('Limit Reached', 'You can add up to 3 children for now.');
    }
  };

  const removeChild = (index: number) => {
    if (children.length > 1) {
      const newChildren = children.filter((_, i) => i !== index);
      setChildren(newChildren);
    }
  };

  const updateChild = (index: number, field: keyof ChildData, value: string) => {
    const newChildren = [...children];
    newChildren[index] = { ...newChildren[index], [field]: value };
    setChildren(newChildren);
  };

  const handleContinue = () => {
    if (!parentName.trim()) {
      Alert.alert('Required Field', 'Please enter your name.');
      return;
    }

    const validChildren = children.filter(child => child.name.trim());
    if (validChildren.length === 0) {
      Alert.alert('Required Field', 'Please add at least one child.');
      return;
    }

    onComplete({
      parentName: parentName.trim(),
      parentEmail: parentEmail.trim(),
      children: validChildren,
    });
  };

  const getIcon = (name: string) => {
    const icons = {
      user: '👤',
      email: '📧',
      child: '👶',
      school: '🏫',
      grade: '📚',
      add: '➕',
      remove: '❌',
    };
    return icons[name as keyof typeof icons] || '👤';
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
          <Text style={styles.stepIndicator}>Step 2 of 4</Text>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Tell us about yourself</Text>
            <Text style={styles.subtitle}>
              This helps us personalize your experience and keep your child's information secure.
            </Text>
          </View>

          {/* Parent Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parent Information</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputIcon}>{getIcon('user')}</Text>
                <Text style={styles.label}>Your Name *</Text>
              </View>
              <TextInput
                style={styles.input}
                value={parentName}
                onChangeText={setParentName}
                placeholder="Enter your full name"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputIcon}>{getIcon('email')}</Text>
                <Text style={styles.label}>Email (Optional)</Text>
              </View>
              <TextInput
                style={styles.input}
                value={parentEmail}
                onChangeText={setParentEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.inputHint}>
                We'll use this to send important updates about your child's van.
              </Text>
            </View>
          </View>

          {/* Children Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Children</Text>
              <TouchableOpacity style={styles.addButton} onPress={addChild}>
                <Text style={styles.addButtonIcon}>{getIcon('add')}</Text>
                <Text style={styles.addButtonText}>Add Child</Text>
              </TouchableOpacity>
            </View>

            {children.map((child, index) => (
              <View key={index} style={styles.childCard}>
                <View style={styles.childHeader}>
                  <Text style={styles.childTitle}>Child {index + 1}</Text>
                  {children.length > 1 && (
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeChild(index)}
                    >
                      <Text style={styles.removeButtonIcon}>{getIcon('remove')}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputHeader}>
                    <Text style={styles.inputIcon}>{getIcon('child')}</Text>
                    <Text style={styles.label}>Child's Name *</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={child.name}
                    onChangeText={(value) => updateChild(index, 'name', value)}
                    placeholder="Enter child's name"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <View style={styles.inputHeader}>
                      <Text style={styles.inputIcon}>{getIcon('grade')}</Text>
                      <Text style={styles.label}>Grade</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      value={child.grade}
                      onChangeText={(value) => updateChild(index, 'grade', value)}
                      placeholder="e.g., 5th"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 2, marginLeft: 8 }]}>
                    <View style={styles.inputHeader}>
                      <Text style={styles.inputIcon}>{getIcon('school')}</Text>
                      <Text style={styles.label}>School</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      value={child.school}
                      onChangeText={(value) => updateChild(index, 'school', value)}
                      placeholder="School name"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.continueButton, (!parentName.trim() || children.every(c => !c.name.trim())) && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!parentName.trim() || children.every(c => !c.name.trim())}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
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
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primaryContrast,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: Colors.light.background,
    color: Colors.light.text,
  },
  inputHint: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
  },
  childCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  childTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  removeButton: {
    padding: 4,
  },
  removeButtonIcon: {
    fontSize: 16,
    color: '#EF4444',
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
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
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
