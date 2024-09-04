import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config2'; // Import auth here

const { width } = Dimensions.get('window');

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
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>PigEx</Text>
      </View>

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
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
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
    marginTop: 80
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
    elevation: 50,
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
