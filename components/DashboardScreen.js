import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const DashboardScreen = ({ farmName, onLogout }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to {farmName}!</Text>
      <View style={styles.settingsContainer}>
        <Button title="Settings" onPress={onLogout} color="#e74c3c" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  settingsContainer: {
    marginTop: 20,
    width: '80%',
  },
});

export default DashboardScreen;
