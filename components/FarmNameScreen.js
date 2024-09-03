import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config2';
import { useNavigation } from '@react-navigation/native';

const FarmNameScreen = ({ route }) => {
  const [farmName, setFarmName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { isNewUser } = route.params || {}; // Check if the user is new or existing

  const handleSaveFarmName = async () => {
    if (farmName.trim() === '') {
      Alert.alert('Validation', 'Please enter a valid name');
      return;
    }

    try {
      setLoading(true); // Show loading indicator
      const userId = auth.currentUser.uid;

      if (isNewUser) {
        // Save the farm name for a new user
        const userDocRef = doc(firestore, 'users', userId);
        await setDoc(userDocRef, { farmName }, { merge: true }); // Use merge to keep existing data
        console.log(`Farm name set: ${farmName}`);
      } else {
        // For existing users, add a new farm branch
        const newBranchRef = doc(firestore, `users/${userId}/farmBranches/${farmName}`);
        await setDoc(newBranchRef, { name: farmName });
        console.log(`Farm branch saved: ${farmName}`);
      }

      // Navigate to Dashboard after setting the farm name or adding the farm branch
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Error saving farm name or branch:', error.message);
      Alert.alert('Error', 'Failed to save farm name. Please try again.');
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {isNewUser ? 'Set Your Farm Name' : 'Enter New Farm Branch Name'}
      </Text>
      <TextInput
        style={styles.input}
        value={farmName}
        onChangeText={setFarmName}
        placeholder={isNewUser ? 'Farm Name' : 'Farm Branch Name'}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveFarmName} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>
      {!isNewUser && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={loading}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
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
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default FarmNameScreen;
