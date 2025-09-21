import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Colors } from '../../constants/theme';

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onMenuItemPress: (item: string) => void;
  userType: 'parent' | 'driver';
}

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

const menuItems = {
  parent: [
    { id: 'children', title: 'My Children', icon: '👶', description: 'View child details' },
    { id: 'van_details', title: 'Van Details', icon: '🚐', description: 'Driver & route info' },
    { id: 'route_info', title: 'Route Information', icon: '🗺️', description: 'Pickup points & schedule' },
    { id: 'notifications', title: 'Notifications', icon: '🔔', description: 'Alerts & updates' },
    { id: 'emergency', title: 'Emergency Contact', icon: '🚨', description: 'Call driver or school' },
    { id: 'history', title: 'Location History', icon: '📊', description: 'Past van locations' },
    { id: 'settings', title: 'Settings', icon: '⚙️', description: 'App preferences' },
    { id: 'help', title: 'Help & Support', icon: '❓', description: 'Get assistance' },
  ],
  driver: [
    { id: 'students', title: 'Students on Board', icon: '👥', description: 'Manage student list' },
    { id: 'route_map', title: 'Route Map', icon: '🗺️', description: 'Navigation & directions' },
    { id: 'gps_settings', title: 'GPS Settings', icon: '📍', description: 'Location sharing options' },
    { id: 'notifications', title: 'Notifications', icon: '🔔', description: 'Alerts & updates' },
    { id: 'emergency', title: 'Emergency', icon: '🚨', description: 'Emergency protocols' },
    { id: 'reports', title: 'Daily Reports', icon: '📋', description: 'Trip reports & logs' },
    { id: 'settings', title: 'Settings', icon: '⚙️', description: 'App preferences' },
    { id: 'help', title: 'Help & Support', icon: '❓', description: 'Get assistance' },
  ],
};

export default function SideMenu({ visible, onClose, onMenuItemPress, userType }: SideMenuProps) {
  const slideAnim = React.useRef(new Animated.Value(-MENU_WIDTH)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleMenuItemPress = (itemId: string) => {
    onMenuItemPress(itemId);
    onClose();
  };

  const items = menuItems[userType] || [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item.id)}
              >
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemDescription}>{item.description}</Text>
                  </View>
                </View>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: Colors.light.background,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '600',
  },
  menuContent: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  menuItemArrow: {
    fontSize: 20,
    color: Colors.light.icon,
    marginLeft: 8,
  },
});
