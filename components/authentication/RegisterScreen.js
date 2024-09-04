import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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
      <View style={styles.headerBox}>
        <Text style={styles.title}>PigEx</Text>
      </View>

      <Text style={styles.header}>Create your account</Text>
      
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
        style={styles.submitButton}
        onPress={handleRegister}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={navigateToLogin}
        style={styles.loginButton}
      >
        <Text style={styles.loginButtonText}>Login</Text>
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
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    width: width, // Use screen width
    height: 170,
    zIndex: 1, // Ensure the header is above other content
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#000',
    marginTop: 100,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    elevation: 2,
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
    bottom: 20,
  },
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    alignItems: 'center',
    marginTop: 30,
    elevation: 4, // Add elevation for Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    alignItems: 'center',
    marginTop: 10,
    elevation: 4, // Add elevation for Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
