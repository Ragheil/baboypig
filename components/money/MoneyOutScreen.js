import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase/config2'; // Adjust path as needed

const MoneyOutScreen = ({ route }) => {
  const { farmName, selectedBranch, userId } = route.params; // Get farmName, selectedBranch, and userId from route params
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [totalBalance, setTotalBalance] = useState(0); // State for total balance
  const [totalMoneyIn, setTotalMoneyIn] = useState(0); // State for total money in

  useEffect(() => {
    fetchBalances(); // Fetch balances on mount
  }, [selectedBranch, userId]); // Run when selectedBranch or userId changes

  // Function to fetch total money in and money out
  const fetchBalances = async () => {
    try {
      // Fetch total Money In
      const moneyInPath = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyInRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyInRecords`;

      const moneyInRecordsRef = collection(firestore, moneyInPath);
      const inRecordsSnapshot = await getDocs(moneyInRecordsRef);

      // Calculate total money in
      let totalIn = 0;
      inRecordsSnapshot.forEach((doc) => {
        const data = doc.data();
        const recordAmount = parseFloat(data.amount) || 0; // Ensure the amount is parsed as a number
        totalIn += recordAmount; // Sum up the amounts
      });

      setTotalMoneyIn(totalIn); // Update total money in state

      // Fetch total Money Out
      const moneyOutPath = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyOutRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyOutRecords`;

      const moneyOutRecordsRef = collection(firestore, moneyOutPath);
      const outRecordsSnapshot = await getDocs(moneyOutRecordsRef);

      // Calculate total money out
      let totalOut = 0;
      outRecordsSnapshot.forEach((doc) => {
        const data = doc.data();
        const recordAmount = parseFloat(data.amount) || 0; // Ensure the amount is parsed as a number
        totalOut += recordAmount; // Sum up the amounts
      });

      // Calculate the total balance
      setTotalBalance(totalIn - totalOut); // Update total balance state
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const handleDeductMoney = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount.');
      return;
    }

    try {
      const moneyRecord = {
        amount: parseFloat(amount), // Parse amount to ensure it's a number
        description,
        date: new Date().toISOString(), // Store the date of the transaction
        category: 'moneyOut', // Add the category as 'moneyOut'
      };

      // Determine Firestore path based on whether it's the Main Farm or not
      const path = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyOutRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyOutRecords`;

      // Create a new document in the moneyOutRecords collection
      const moneyOutRecordsRef = collection(firestore, path);
      await addDoc(moneyOutRecordsRef, moneyRecord); // This will create a new document with a unique ID

      Alert.alert('Success', 'Money deducted successfully!');

      // Fetch the updated total balance after deducting money
      fetchBalances(); // Call the function to fetch updated balance

      // Clear the input fields
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error('Error deducting money record:', error);
      Alert.alert('Error', 'Failed to deduct money. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Money Out</Text>
      <Text style={styles.farmName}>Current Branch: {selectedBranch || 'No branch selected'}</Text>
      <Text style={styles.balance}>Total Balance: PHP {totalBalance.toFixed(2)}</Text>
    {/*  <Text style={styles.totalMoneyIn}>Total Money In: PHP {totalMoneyIn.toFixed(2)}</Text>*/}

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

      <Button title="Deduct Money" onPress={handleDeductMoney} />
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
  balance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50', // Green color for balance
    marginBottom: 20,
  },
  totalMoneyIn: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3', // Blue color for total money in
    marginBottom: 20,
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

export default MoneyOutScreen;
