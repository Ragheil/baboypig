import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase/config2'; // Adjust path as needed
import { Picker } from '@react-native-picker/picker'; // Ensure this package is installed
import DateTimePicker from '@react-native-community/datetimepicker'; // For picking the date

const MoneyInScreen = ({ route }) => {
  const { farmName, selectedBranch, userId } = route.params; // Get farmName, selectedBranch, and userId from route params
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [totalBalance, setTotalBalance] = useState(0); // State for total balance
  const [category, setCategory] = useState('salary'); // Default income category
  const [showOtherCategoryInput, setShowOtherCategoryInput] = useState(false); // State to show/hide text input for other category
  const [otherCategory, setOtherCategory] = useState(''); // Store other category
  const [date, setDate] = useState(new Date()); // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false); // Show date picker state

  useEffect(() => {
    fetchTotalBalance(); // Fetch total balance when the component mounts
  }, [selectedBranch, userId]); // Run when selectedBranch or userId changes

  const fetchTotalBalance = async () => {
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

      setTotalBalance(totalIn - totalOut); // Update total balance state
    } catch (error) {
      console.error('Error fetching total balance:', error);
    }
  };

  const handleAddMoney = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount.');
      return;
    }

    const selectedCategory = category === 'other' ? otherCategory : category;

    try {
      const moneyRecord = {
        amount: parseFloat(amount),
        remarks,
        date: date.toISOString(),
        category: selectedCategory,
      };

      const path = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyInRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyInRecords`;

      const moneyInRecordsRef = collection(firestore, path);
      await addDoc(moneyInRecordsRef, moneyRecord);

      Alert.alert('Success', 'Money added successfully!');
      fetchTotalBalance(); // Update balance after adding money
      setAmount('');
      setRemarks('');
      setCategory('salary');
      setOtherCategory('');
    } catch (error) {
      console.error('Error adding money record:', error);
      Alert.alert('Error', 'Failed to add money. Please try again.');
    }
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setShowOtherCategoryInput(value === 'other'); // Show input if "Other" is selected
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Money In</Text>
      <Text style={styles.farmName}>Current Branch: {selectedBranch || 'No branch selected'}</Text>
      <Text style={styles.balance}>Total Balance: PHP {totalBalance.toFixed(2)}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Picker
        selectedValue={category}
        onValueChange={handleCategoryChange}
        style={styles.input}
      >
        <Picker.Item label="Salary" value="salary" />
        <Picker.Item label="Income" value="income" />
        <Picker.Item label="Bonus" value="bonus" />
        <Picker.Item label="Other" value="other" />
      </Picker>

      {showOtherCategoryInput && (
        <TextInput
          style={styles.input}
          placeholder="Enter category"
          value={otherCategory}
          onChangeText={setOtherCategory}
        />
      )}

      <Button
        title="Pick Transaction Date"
        onPress={() => setShowDatePicker(true)}
      />
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}
      <Text style={styles.selectedDate}>Selected Date: {date.toDateString()}</Text>

      <TextInput
        style={styles.input}
        placeholder="Remarks (optional)"
        value={remarks}
        onChangeText={setRemarks}
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
});

export default MoneyInScreen;
