import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function MoneyOutScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [transactionName, setTransactionName] = useState('');
  const [date, setDate] = useState('');
  const [remarks, setRemarks] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('MoneyInScreen')} style={styles.navButton}>
          <Text style={styles.navText}>Money In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MoneyOutScreen')} style={styles.navButton}>
          <Text style={styles.navText}>Money Out</Text>
        </TouchableOpacity>
      </View>

      {/* Title in the center */}
      <Text style={styles.title}>Money Out</Text>

      <Text style={styles.label}>Amount (PHP):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Expense Category:</Text>
      <Picker
        selectedValue={expenseCategory}
        onValueChange={(itemValue) => setExpenseCategory(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="Rent" value="rent" />
        <Picker.Item label="Utilities" value="utilities" />
        <Picker.Item label="Other" value="other" />
      </Picker>

      <Text style={styles.label}>Transaction Name:</Text>
      <TextInput
        style={styles.input}
        value={transactionName}
        onChangeText={setTransactionName}
      />

      <Text style={styles.label}>Date:</Text>
      <TextInput
        style={styles.input}
        placeholder="MM/DD/YYYY"
        value={date}
        onChangeText={setDate}
      />

      <Text style={styles.label}>Remarks:</Text>
      <TextInput
        style={styles.input}
        value={remarks}
        onChangeText={setRemarks}
      />

      <Button title="Submit" onPress={() => console.log('Transaction Submitted')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  navContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  navButton: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#007BFF' },
  navText: { color: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 16, marginTop: 10 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
});
