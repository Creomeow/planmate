import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/auth';
import { useTheme } from '../../context/theme';
import { authService } from '../../services/authService';

export default function AccountScreen() {
  const { user, logout, isLoading } = useAuth();
  const { theme, themeMode, setThemeMode, toggleTheme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);

  const colors = Colors[theme];

  // isMounted ref to prevent state updates after unmount
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      if (isMounted.current) Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      if (isMounted.current) Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      if (isMounted.current) Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    setChanging(true);
    try {
      const storedUser = await authService.loginUser(user?.email || '', currentPassword);
      if (!storedUser) {
        if (isMounted.current) Alert.alert('Error', 'Current password is incorrect');
        if (isMounted.current) setChanging(false);
        return;
      }
      await authService.updateUser(user!.id, { password: newPassword });
      if (isMounted.current) Alert.alert('Success', 'Password changed successfully');
      if (isMounted.current) setCurrentPassword('');
      if (isMounted.current) setNewPassword('');
      if (isMounted.current) setConfirmPassword('');
    } catch (error: any) {
      if (isMounted.current) Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      if (isMounted.current) setChanging(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              if (isMounted.current) Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleThemeModeChange = async (mode: 'light' | 'dark' | 'system') => {
    await setThemeMode(mode);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.header, { color: colors.text }]}>Account</Text>
      
      {/* Theme Settings */}
      <View style={[styles.section, { backgroundColor: theme === 'dark' ? '#2c2c2e' : 'white' }]}>
        <Text style={[styles.sectionTitle, { color: colors.tint }]}>Appearance</Text>
        <View style={styles.themeOptions}>
          <TouchableOpacity
            style={[
              styles.themeOption,
              themeMode === 'light' && styles.themeOptionSelected,
              { borderColor: themeMode === 'light' ? colors.tint : '#e9ecef' }
            ]}
            onPress={() => handleThemeModeChange('light')}
          >
            <Ionicons 
              name="sunny" 
              size={20} 
              color={themeMode === 'light' ? colors.tint : colors.icon} 
            />
            <Text style={[styles.themeOptionText, { color: colors.text }]}>Light</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.themeOption,
              themeMode === 'dark' && styles.themeOptionSelected,
              { borderColor: themeMode === 'dark' ? colors.tint : '#e9ecef' }
            ]}
            onPress={() => handleThemeModeChange('dark')}
          >
            <Ionicons 
              name="moon" 
              size={20} 
              color={themeMode === 'dark' ? colors.tint : colors.icon} 
            />
            <Text style={[styles.themeOptionText, { color: colors.text }]}>Dark</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Change Password */}
      <View style={[styles.section, { backgroundColor: theme === 'dark' ? '#2c2c2e' : 'white' }]}>
        <Text style={[styles.sectionTitle, { color: colors.tint }]}>Change Password</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme === 'dark' ? '#3a3a3c' : '#f8f9fa',
              color: colors.text,
              borderColor: theme === 'dark' ? '#48484a' : '#e9ecef'
            }]}
            placeholder="Current Password"
            placeholderTextColor={colors.icon}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme === 'dark' ? '#3a3a3c' : '#f8f9fa',
              color: colors.text,
              borderColor: theme === 'dark' ? '#48484a' : '#e9ecef'
            }]}
            placeholder="New Password"
            placeholderTextColor={colors.icon}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme === 'dark' ? '#3a3a3c' : '#f8f9fa',
              color: colors.text,
              borderColor: theme === 'dark' ? '#48484a' : '#e9ecef'
            }]}
            placeholder="Confirm New Password"
            placeholderTextColor={colors.icon}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#007AFF' }, changing && styles.buttonDisabled]}
          onPress={handleChangePassword}
          disabled={changing}
        >
          <Ionicons name="key-outline" size={20} color="white" />
          <Text style={styles.buttonText}>{changing ? 'Changing...' : 'Change Password'}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Logout */}
      <View style={[styles.section, { backgroundColor: theme === 'dark' ? '#2c2c2e' : 'white' }]}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled, { backgroundColor: '#ff3b30' }]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.buttonText}>{isLoading ? 'Logging out...' : 'Logout'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  themeOptionSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 