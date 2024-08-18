import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase/config2';  // Ensure you're using the initialized auth

const DashboardScreen = ({ onLogout }) => {
  const [farmName, setFarmName] = useState('');

  useEffect(() => {
    const loadFarmName = async () => {
      try {
        const userId = auth.currentUser ? auth.currentUser.uid : null;
        if (userId) {
          const storedFarmName = await AsyncStorage.getItem(`farmName_${userId}`);
          if (storedFarmName) {
            setFarmName(storedFarmName);
          } else {
            setFarmName('No Farm Name'); // Fallback text if no farm name is found
          }
        }
      } catch (error) {
        console.log('Error loading farm name', error);
      }
    };

    loadFarmName();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to {farmName}!</Text>
      <View style={styles.settingsContainer}>
        <Button title="Logout" onPress={onLogout} color="#e74c3c" />
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
