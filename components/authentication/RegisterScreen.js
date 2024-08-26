// RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const RegisterScreen = ({ email, setEmail, password, setPassword, handleAuthentication, navigateToLogin }) => {
  const [retypePassword, setRetypePassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleRegister = () => {
    if (password !== retypePassword) {
      alert("Passwords don't match!");
      return;
    }
    handleAuthentication(firstName, lastName); // Pass the firstName and lastName to the handleAuthentication function
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Register</Text>
      
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First Name"
      />
      
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last Name"
      />
      
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        value={retypePassword}
        onChangeText={setRetypePassword}
        placeholder="Retype Password"
        secureTextEntry
      />
      
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
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
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
