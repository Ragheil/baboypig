import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config2'; // Import auth here

const LoginScreen = ({ email, setEmail, password, setPassword, handleAuthentication, navigateToRegister }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
    } else {
      handleAuthentication();
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
      <View style={styles.container}>
        <Text style={styles.header}>Forgot Password</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setForgotPassword(false)}>
          <Text style={styles.switchText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>PigEx</Text>
      </View>

      <Text style={styles.header}>Login</Text>
      <View style={styles.emailContainer}>
        <TextInput
          style={[styles.input, styles.emailInput]} // Applying custom style to the email input
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

      <Text style={styles.orText}>or login with</Text>

      <TouchableOpacity style={styles.googleButton}>
        <Text style={styles.googleButtonText}>Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setForgotPassword(true)}>
        <Text style={styles.toggleText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={navigateToRegister}>
        <Text style={styles.toggleText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    elevation: 2,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginVertical: 10,
    elevation: 2,
  },
  toggleIcon: {
    position: 'absolute',
    right: 15,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switch: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    color: '#007bff',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
