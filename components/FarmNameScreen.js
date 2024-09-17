import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config2';

const FarmNameScreen = ({ onFarmNameSet }) => {
  const [farmName, setFarmName] = useState('');
  const navigation = useNavigation();

  const handleSaveFarmName = async () => {
    if (farmName.trim() === '') {
      alert('Please enter a farm name');
      return;
    }
  
    try {
      const farmBranchDoc = doc(firestore, `users/${auth.currentUser.uid}/farmBranches/${farmName}`);
      await setDoc(farmBranchDoc, { name: farmName }, { merge: true });
      console.log(`Farm name saved: ${farmName}`);
      onFarmNameSet(farmName); // Notify the parent component that the farm name is set
  
      // Navigate to Dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }], // This ensures a fresh start at the Dashboard screen
      });
    } catch (error) {
      console.error('Error saving farm name:', error.message);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Enter Your Farm Name</Text>
      <TextInput
        style={styles.input}
        value={farmName}
        onChangeText={setFarmName}
        placeholder="Farm Name"
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
