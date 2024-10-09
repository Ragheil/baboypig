import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase/config2'; // Adjust path as needed
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker for the date picker

const MoneyOutScreen = ({ route }) => {
  const { farmName, selectedBranch, userId } = route.params; // Get farmName, selectedBranch, and userId from route params
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [totalBalance, setTotalBalance] = useState(0); // State for total balance
  const [totalMoneyIn, setTotalMoneyIn] = useState(0); // State for total money in

  // States for the expense category
  const [category, setCategory] = useState('Bayad Kurente');
  const [customCategory, setCustomCategory] = useState('');

  // States for date picker
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Show text input when 'Other' is selected
  const isCustomCategory = category === 'Other';

  useEffect(() => {
    fetchBalances(); // Fetch balances on mount
  }, [selectedBranch, userId]); // Run when selectedBranch or userId changes

  // Function to fetch total money in and money out
  const fetchBalances = async () => {
    try {
      const moneyInPath = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyInRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyInRecords`;

      const moneyInRecordsRef = collection(firestore, moneyInPath);
      const inRecordsSnapshot = await getDocs(moneyInRecordsRef);

      let totalIn = 0;
      inRecordsSnapshot.forEach((doc) => {
        const data = doc.data();
        const recordAmount = parseFloat(data.amount) || 0;
        totalIn += recordAmount;
      });

      setTotalMoneyIn(totalIn);

      const moneyOutPath = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyOutRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyOutRecords`;

      const moneyOutRecordsRef = collection(firestore, moneyOutPath);
      const outRecordsSnapshot = await getDocs(moneyOutRecordsRef);

      let totalOut = 0;
      outRecordsSnapshot.forEach((doc) => {
        const data = doc.data();
        const recordAmount = parseFloat(data.amount) || 0;
        totalOut += recordAmount;
      });

      setTotalBalance(totalIn - totalOut);
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
        amount: parseFloat(amount),
        remarks,
        date: date.toISOString(), // Store selected date
        category: isCustomCategory ? customCategory : category, // Use custom category if 'Other' is selected
      };

      const path = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyOutRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyOutRecords`;

      const moneyOutRecordsRef = collection(firestore, path);
      await addDoc(moneyOutRecordsRef, moneyRecord);

      Alert.alert('Success', 'Money deducted successfully!');
      fetchBalances();

      setAmount('');
      setRemarks('');
      setCustomCategory('');
    } catch (error) {
      console.error('Error deducting money record:', error);
      Alert.alert('Error', 'Failed to deduct money. Please try again.');
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Money Out</Text>
      <Text style={styles.farmName}>Current Branch: {selectedBranch || 'No branch selected'}</Text>
      <Text style={styles.balance}>Total Balance: PHP {totalBalance.toFixed(2)}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      {/* Category Picker */}
      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="Bayad Kurente" value="Bayad Kurente" />
        <Picker.Item label="Tax" value="Tax" />
        <Picker.Item label="Water Bill" value="Water Bill" />
        <Picker.Item label="Other" value="Other" />
      </Picker>

      {/* Show custom category input if 'Other' is selected */}
      {isCustomCategory && (
        <TextInput
          style={styles.input}
          placeholder="Enter custom category"
          value={customCategory}
          onChangeText={setCustomCategory}
        />
      )}

      {/* Date Picker */}
      <Button title="Select Date" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <Text style={styles.selectedDate}>Selected Date: {date.toDateString()}</Text>

      <TextInput
        style={styles.input}
        placeholder="Remarks (optional)"
        value={remarks}
        onChangeText={setRemarks}
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
    color: '#4CAF50',
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
  selectedDate: {
    fontSize: 16,
    marginVertical: 10,
  },
});

export default MoneyOutScreen;
