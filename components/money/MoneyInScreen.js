// MoneyInScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

export default function MoneyInScreen({ navigation, route }) {
    const { user, selectedBranch, currentFarm } = route.params || {};
    
    useEffect(() => {
        console.log('User:', user);
        console.log('Selected Branch:', selectedBranch);
        console.log('Current Farm:', currentFarm); // Log current farm
    }, [user, selectedBranch, currentFarm]);

    const [amount, setAmount] = useState('');
    const [incomeCategory, setIncomeCategory] = useState('');
    const [transactionName, setTransactionName] = useState('');
    const [date, setDate] = useState('');
    const [remarks, setRemarks] = useState('');

    const firestore = getFirestore();

    const addTransaction = async (transactionData) => {
        try {
            if (!user || !user.uid) {
                console.log('User or user.uid is undefined');
                return;
            }

            // Define the transactions collection path based on the selected branch
            const transactionsCollection = collection(
                firestore, 
                `users/${user.uid}/farmBranches/${selectedBranch}/transactions`
            );

            await addDoc(transactionsCollection, transactionData);
            console.log('Transaction added successfully');
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    };

    const handleSubmit = async () => {
        if (!amount || !transactionName || !incomeCategory) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            const transactionData = {
                amount: parseFloat(amount), // Ensure amount is a number
                incomeCategory,
                transactionName,
                date,
                remarks,
                type: 'moneyIn',
                farm: currentFarm, // Add the current farm to the transaction data
            };

            await addTransaction(transactionData);

            console.log('Transaction Submitted');
            alert('Transaction added successfully!');

            // Clear input fields after submission
            setAmount('');
            setIncomeCategory('');
            setTransactionName('');
            setDate('');
            setRemarks('');
        } catch (error) {
            console.error('Error processing transaction: ', error);
            alert('There was an error adding the transaction. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Money In</Text>
            <Text style={styles.label}>Amount (PHP):</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
            />
            <Text style={styles.label}>Income Category:</Text>
            <Picker
                selectedValue={incomeCategory}
                onValueChange={(itemValue) => setIncomeCategory(itemValue)}
                style={styles.input}
            >
                <Picker.Item label="Salary" value="salary" />
                <Picker.Item label="Business" value="business" />
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
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
}


const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    label: { fontSize: 16, marginTop: 10 },
    input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
});
