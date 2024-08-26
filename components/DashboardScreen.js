import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function DashboardScreen({ firstName, lastName, farmName, onLogout }) {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to your dashboard!</Text>
      <Text style={styles.userNameText}>{firstName} {lastName}</Text>
      <Text style={styles.farmNameText}>Farm Name: {farmName}</Text>
      <Button title="Logout" onPress={onLogout} color="#FF6347" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#869F77',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  userNameText: {
    fontSize: 22,
    marginBottom: 8,
  },
  farmNameText: {
    fontSize: 20,
    marginBottom: 32,
  },
});
