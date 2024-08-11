import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function DashboardScreen({ farmName, onLogout }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your Dashboard</Text>
      <Text style={styles.farmNameText}>Farm: {farmName}</Text>
      <Button title="Logout" onPress={onLogout} color="#e74c3c" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  farmNameText: {
    fontSize: 18,
    marginBottom: 20,
  },
});
