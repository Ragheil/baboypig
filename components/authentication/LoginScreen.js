import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config2'; // Import auth here

const { width } = Dimensions.get('window');

const LoginScreen = ({ email, setEmail, password, setPassword, handleAuthentication, navigateToRegister }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      handleAuthentication();
    } catch (error) {
      // If the error is related to invalid credentials
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'This account is not registered yet');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'Password reset email sent!');
      setForgotPassword(false); // Return to the login screen
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (forgotPassword) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent} 
          keyboardShouldPersistTaps='handled'
        >
          <View style={styles.headerBox}>
            <Text style={styles.title}>PigEx</Text>
          </View>
          <View style={styles.mainContent}>
            <Text style={styles.header}>Forgot Password</Text>
            <Text style={styles.instructions}>
              Enter your email address below, and we'll send you an email with instructions to reset your password.
            </Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#666"
            />
            <TouchableOpacity style={styles.resetButton} onPress={handleForgotPassword}>
              <Text style={styles.resetButtonText}>Send Reset Link</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setForgotPassword(false)}>
              <Text style={styles.switchText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent} 
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.headerBox}>
          <Text style={styles.title}>PigEx</Text>
        </View>
        <View style={styles.mainContent}>
          <Text style={styles.header}>Login</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={!passwordVisible}
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.toggleIcon}
            >
              <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setForgotPassword(true)}>
            <Text style={styles.toggleText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerButton} onPress={navigateToRegister}>
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: '#F4F4F4',
  },
  headerBox: {
    backgroundColor: '#A8C39F',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    position: 'absolute',
    top: 0,
    left: 0,
    width: width, // Use screen width
    height: 200,
    zIndex: 1, // Ensure the header is above other content
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#000',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 200, // Make space for the header box
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 10,
    elevation: 4,
  },
  input: {
    padding: 15,
    fontSize: 16,
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 10,
    elevation: 4,
  },
  toggleIcon: {
    position: 'absolute',
    right: 15,
  },
  resetButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
    marginTop: 40,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
    elevation: 4,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleText: {
    textAlign: 'center',
    marginVertical: 5,
    color: '#000',
    fontSize: 14,
    marginTop: 15,
  },
  switchText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#666',
    fontSize: 14,
  },
});

export default LoginScreen;
