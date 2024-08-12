import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const RegisterScreen = ({ email, setEmail, password, setPassword, farmName, setFarmName, handleAuthentication, navigateToLogin }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PigEx</Text>

      <Text style={styles.header}>Create your account</Text>

      <TextInput
        style={styles.input}
        value={farmName}
        onChangeText={setFarmName}
        placeholder="Farm Name"
      />

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email Address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />

      <Text style={styles.orText}>or continue with</Text>

      <TouchableOpacity style={styles.googleButton}>
        <Text style={styles.googleButtonText}>Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registerButton} onPress={handleAuthentication}>
        <Text style={styles.registerButtonText}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={navigateToLogin}>
        <Text style={styles.toggleText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    width: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#3E5C44',
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
    marginBottom: 10,
    alignItems: 'center',
    
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleText: {
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
