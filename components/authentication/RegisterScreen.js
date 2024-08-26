import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = ({ email, setEmail, password, setPassword, handleAuthentication, navigateToLogin }) => {
  const [retypePassword, setRetypePassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [retypePasswordVisible, setRetypePasswordVisible] = useState(false);

  const handleRegister = () => {
    if (password !== retypePassword) {
      alert("Passwords don't match!");
      return;
    }
    handleAuthentication(firstName, lastName);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Register</Text>
      
      <View style={styles.nameContainer}>
        <TextInput
          style={[styles.input, styles.halfInput]} // Adjusted styles for consistent width
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First Name"
        />
        
        <TextInput
          style={[styles.input, styles.halfInput]} // Adjusted styles for consistent width
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last Name"
        />
      </View>
      
      <TextInput
        style={styles.input} // Full width input
        value={email}
        onChangeText={setEmail}
        placeholder="Email Address"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input} // Full width input
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
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input} // Full width input
          value={retypePassword}
          onChangeText={setRetypePassword}
          placeholder="Retype Password"
          secureTextEntry={!retypePasswordVisible}
        />
        <TouchableOpacity
          onPress={() => setRetypePasswordVisible(!retypePasswordVisible)}
          style={styles.toggleIcon}
        >
          <Ionicons name={retypePasswordVisible ? "eye-off" : "eye"} size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <Text style={styles.orText}>or login with</Text>

<TouchableOpacity style={styles.googleButton}>
  <Text style={styles.googleButtonText}>Google</Text>
</TouchableOpacity>
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={navigateToLogin}>
        <Text style={styles.switchToLoginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 5, // Adjusts spacing between First and Last Name fields
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '100%', // Ensure full width for all input fields
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  toggleIcon: {
    position: 'absolute',
    right: 10,
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
  
  registerButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  switchToLoginText: {
    marginTop: 20,
    color: '#333',
    textAlign: 'center',
  },
});

export default RegisterScreen;
