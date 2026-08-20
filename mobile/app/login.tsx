import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    console.log('[LoginScreen] Component Mounted');
    return () => console.log('[LoginScreen] Component Unmounted');
  }, []);

  const handleLogin = async () => {
    console.log('[LoginScreen] handleLogin invoked for username:', username);
    if (!username || !password) {
      console.log('[LoginScreen] Error: Missing credentials');
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    
    setIsSubmitting(true);
    console.log('[LoginScreen] Attempting to login via useAuth...');
    try {
      await login({ username, password });
      console.log('[LoginScreen] Login successful');
    } catch (error: any) {
      console.log('[LoginScreen] Login failed with error:', error.message);
      Alert.alert('Login Failed', error.message || 'An error occurred during login');
    } finally {
      setIsSubmitting(false);
      console.log('[LoginScreen] Finished login attempt process');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.formContainer}>
          <View style={styles.logoContainer}>
            <Image 
              source={
                username.toLowerCase().includes('@lumossolution.com') 
                  ? require('../assets/images/lumos-logo.png') 
                  : require('../assets/images/logo.png')
              } 
              style={
                username.toLowerCase().includes('@lumossolution.com')
                  ? styles.lumosLogo
                  : styles.logo
              } 
            />
          </View>
          <Text style={styles.title}>CRM</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
          
            <TextInput
              style={styles.input}
              placeholder="Username or Email"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                console.log('[LoginScreen] username changed to length:', text.length);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!isSubmitting}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              editable={!isSubmitting}
            />
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
  lumosLogo: {
    width: 240,
    height: 120,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
