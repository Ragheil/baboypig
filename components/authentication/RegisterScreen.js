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
      Alert.alert("Passwords don't match!");
      return;
    }
    handleAuthentication(firstName, lastName);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create your Account</Text>
      
      <View style={styles.nameContainer}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First Name"
        />
        
        <TextInput
          style={[styles.input, styles.halfInput]}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last Name"
        />
      </View>
      
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email Address"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
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
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
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
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={navigateToLogin}
        style={styles.switch}
      >
        <Text style={styles.switchText}>Already have an account? Login</Text>
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
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginVertical: 10,
    elevation: 2,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 5,
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
  },
});

export default RegisterScreen;
