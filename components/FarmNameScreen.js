// FarmNameScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config2';

const FarmNameScreen = ({ onFarmNameSet }) => {
  const [farmName, setFarmName] = useState('');

  const handleSaveFarmName = async () => {
    if (farmName.trim() === '') {
      alert('Please enter a farm name');
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const newBranchRef = doc(firestore, `users/${userId}/farmBranches/${farmName}`);
      await setDoc(newBranchRef, { name: farmName });
      console.log(`Farm branch saved: ${farmName}`);
      onFarmNameSet(farmName); // Notify parent component
    } catch (error) {
      console.error('Error saving farm branch:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Enter Your Farm Branch Name</Text>
      <TextInput
        style={styles.input}
        value={farmName}
        onChangeText={setFarmName}
        placeholder="Farm Branch Name"
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveFarmName}>
        <Text style={styles.saveButtonText}>Save</Text>
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
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FarmNameScreen;
