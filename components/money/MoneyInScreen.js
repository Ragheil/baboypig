import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/config2'; // Adjust path as needed

const MoneyInScreen = ({ route }) => {
  const { farmName, selectedBranch, userId } = route.params; // Get farmName, selectedBranch, and userId from route params
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleAddMoney = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount.');
      return;
    }

    try {
      const moneyRecord = {
        amount: parseFloat(amount),
        description,
        date: new Date().toISOString(), // Store the date of the transaction
        category: 'moneyIn', // Add the category as 'moneyIn'
      };

      // Determine Firestore path based on whether it's the Main Farm or not
      const path = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyInRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyInRecords`;

      // Create a new document in the moneyInRecords collection
      const moneyInRecordsRef = collection(firestore, path);
      await addDoc(moneyInRecordsRef, moneyRecord); // This will create a new document with a unique ID

      Alert.alert('Success', 'Money added successfully!');
      // Clear the input fields
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error('Error adding money record:', error);
      Alert.alert('Error', 'Failed to add money. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Money In</Text>
      <Text style={styles.farmName}>Current Branch: {selectedBranch || 'No branch selected'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
      />

      <Button title="Add Money" onPress={handleAddMoney} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  farmName: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});

export default MoneyInScreen;
