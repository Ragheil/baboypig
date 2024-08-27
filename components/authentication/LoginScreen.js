import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ email, setEmail, password, setPassword, handleAuthentication, navigateToRegister }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
    } else {
      handleAuthentication();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>PigEx</Text>
      </View>

      <Text style={styles.header}>Login</Text>
      <View style={styles.emailContainer}>
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

      <Text style={styles.orText}>or login with</Text>

      <TouchableOpacity style={styles.googleButton}>
        <Text style={styles.googleButtonText}>Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
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
    padding: 40,
    backgroundColor: '#869F77',
    width: '100%',
  },
  headerBox: {
    backgroundColor: '#3E5C44',
    paddingVertical: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '100%', // Ensure full width for all input fields
    backgroundColor: 'white',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  toggleIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    
    transform: [{ translateY: -12 }], // Adjust position vertically
  },
  orText: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#666',
  },
  googleButton: {
    backgroundColor: '#eee',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleText: {
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
