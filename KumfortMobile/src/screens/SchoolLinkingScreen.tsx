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

interface SchoolLinkingScreenProps {
  onComplete: (schoolData: SchoolData) => void;
  onBack: () => void;
  children: ChildData[];
}

interface ChildData {
  name: string;
  grade: string;
  school: string;
}

interface SchoolData {
  schoolId: string;
  schoolName: string;
  childAdmissionNumbers: { [childName: string]: string };
  vanAssignment: VanAssignment;
}

interface VanAssignment {
  vanId: string;
  vanNumber: string;
  driverName: string;
  driverPhone: string;
  route: string;
}

// Mock school data - in production, this would come from an API
const MOCK_SCHOOLS = [
  { id: '1', name: 'Delhi Public School', address: 'Sector 45, Gurgaon', code: 'DPS001' },
  { id: '2', name: 'Modern School', address: 'Barakhamba Road, New Delhi', code: 'MS002' },
  { id: '3', name: 'Ryan International School', address: 'Sector 31, Gurgaon', code: 'RIS003' },
  { id: '4', name: 'The Heritage School', address: 'Sector 62, Gurgaon', code: 'THS004' },
  { id: '5', name: 'Amity International School', address: 'Sector 43, Gurgaon', code: 'AIS005' },
];

export default function SchoolLinkingScreen({ onComplete, onBack, children }: SchoolLinkingScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [admissionNumbers, setAdmissionNumbers] = useState<{ [childName: string]: string }>({});
  const [isSearching, setIsSearching] = useState(false);
  
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

  const filteredSchools = MOCK_SCHOOLS.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSchoolSelect = (school: any) => {
    setSelectedSchool(school);
    setSearchQuery(school.name);
  };

  const handleAdmissionNumberChange = (childName: string, value: string) => {
    setAdmissionNumbers(prev => ({
      ...prev,
      [childName]: value
    }));
  };

  const handleContinue = () => {
    if (!selectedSchool) {
      Alert.alert('Required Field', 'Please select a school.');
      return;
    }

    const missingAdmissionNumbers = children.filter(child => 
      !admissionNumbers[child.name]?.trim()
    );

    if (missingAdmissionNumbers.length > 0) {
      Alert.alert('Required Field', 'Please enter admission numbers for all children.');
      return;
    }

    // Mock van assignment - in production, this would come from the API
    const mockVanAssignment: VanAssignment = {
      vanId: 'VAN001',
      vanNumber: 'DL-01-AB-1234',
      driverName: 'Rajesh Kumar',
      driverPhone: '+91-9876543210',
      route: 'Sector 45 → Sector 31 → Barakhamba Road'
    };

    onComplete({
      schoolId: selectedSchool.id,
      schoolName: selectedSchool.name,
      childAdmissionNumbers: admissionNumbers,
      vanAssignment: mockVanAssignment,
    });
  };

  const getIcon = (name: string) => {
    const icons = {
      school: '🏫',
      search: '🔍',
      check: '✅',
      van: '🚐',
      driver: '👨‍💼',
      route: '🗺️',
      phone: '📞',
    };
    return icons[name as keyof typeof icons] || '🏫';
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
          <Text style={styles.stepIndicator}>Step 3 of 4</Text>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Link to your school</Text>
            <Text style={styles.subtitle}>
              Find your school and enter your child's admission details to get van assignments.
            </Text>
          </View>

          {/* School Search */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search School</Text>
            
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>{getIcon('search')}</Text>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by school name or code"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* School Results */}
            {searchQuery.length > 0 && (
              <View style={styles.schoolResults}>
                {filteredSchools.map((school) => (
                  <TouchableOpacity
                    key={school.id}
                    style={[
                      styles.schoolItem,
                      selectedSchool?.id === school.id && styles.schoolItemSelected
                    ]}
                    onPress={() => handleSchoolSelect(school)}
                  >
                    <Text style={styles.schoolIcon}>{getIcon('school')}</Text>
                    <View style={styles.schoolInfo}>
                      <Text style={styles.schoolName}>{school.name}</Text>
                      <Text style={styles.schoolAddress}>{school.address}</Text>
                      <Text style={styles.schoolCode}>Code: {school.code}</Text>
                    </View>
                    {selectedSchool?.id === school.id && (
                      <Text style={styles.checkIcon}>{getIcon('check')}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Selected School Info */}
          {selectedSchool && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Selected School</Text>
              <View style={styles.selectedSchoolCard}>
                <Text style={styles.schoolIcon}>{getIcon('school')}</Text>
                <View style={styles.schoolInfo}>
                  <Text style={styles.schoolName}>{selectedSchool.name}</Text>
                  <Text style={styles.schoolAddress}>{selectedSchool.address}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Admission Numbers */}
          {selectedSchool && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Admission Details</Text>
              <Text style={styles.sectionSubtitle}>
                Enter your child's admission number for {selectedSchool.name}
              </Text>
              
              {children.map((child, index) => (
                <View key={index} style={styles.admissionCard}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childGrade}>{child.grade}</Text>
                  <TextInput
                    style={styles.admissionInput}
                    value={admissionNumbers[child.name] || ''}
                    onChangeText={(value) => handleAdmissionNumberChange(child.name, value)}
                    placeholder="Enter admission number"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              ))}
            </View>
          )}

          {/* Van Assignment Preview */}
          {selectedSchool && children.every(child => admissionNumbers[child.name]?.trim()) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Van Assignment</Text>
              <View style={styles.vanCard}>
                <View style={styles.vanHeader}>
                  <Text style={styles.vanIcon}>{getIcon('van')}</Text>
                  <Text style={styles.vanNumber}>DL-01-AB-1234</Text>
                </View>
                
                <View style={styles.vanInfo}>
                  <View style={styles.vanInfoRow}>
                    <Text style={styles.vanInfoIcon}>{getIcon('driver')}</Text>
                    <Text style={styles.vanInfoText}>Driver: Rajesh Kumar</Text>
                  </View>
                  <View style={styles.vanInfoRow}>
                    <Text style={styles.vanInfoIcon}>{getIcon('phone')}</Text>
                    <Text style={styles.vanInfoText}>+91-9876543210</Text>
                  </View>
                  <View style={styles.vanInfoRow}>
                    <Text style={styles.vanInfoIcon}>{getIcon('route')}</Text>
                    <Text style={styles.vanInfoText}>Sector 45 → Sector 31 → Barakhamba Road</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!selectedSchool || children.some(child => !admissionNumbers[child.name]?.trim())) && styles.buttonDisabled
            ]}
            onPress={handleContinue}
            disabled={!selectedSchool || children.some(child => !admissionNumbers[child.name]?.trim())}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#64748B',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  schoolResults: {
    marginTop: 12,
    maxHeight: 200,
  },
  schoolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  schoolItemSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.surface,
  },
  schoolIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  schoolAddress: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  schoolCode: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  checkIcon: {
    fontSize: 20,
    color: Colors.light.primary,
  },
  selectedSchoolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
  },
  admissionCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  childGrade: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  admissionInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.light.surface,
    color: Colors.light.text,
  },
  vanCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vanIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  vanNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  vanInfo: {
    gap: 12,
  },
  vanInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vanInfoIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  vanInfoText: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
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
