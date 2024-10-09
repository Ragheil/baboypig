import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Modal, Pressable, FlatList } from 'react-native';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/config2'; // Adjust path as needed
import { Picker } from '@react-native-picker/picker'; // Ensure this package is installed
import DateTimePicker from '@react-native-community/datetimepicker'; // For picking the date

const MoneyOutScreen = ({ route }) => {
  const { farmName, selectedBranch, userId } = route.params; // Get farmName, selectedBranch, and userId from route params
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [totalBalance, setTotalBalance] = useState(0); // State for total balance
  const [category, setCategory] = useState('expense'); // Default expense category
  const [showOtherCategoryInput, setShowOtherCategoryInput] = useState(false); // State to show/hide text input for other category
  const [otherCategory, setOtherCategory] = useState(''); // Store other category
  const [date, setDate] = useState(new Date()); // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false); // Show date picker state
  const [isModalVisible, setModalVisible] = useState(false); // State to manage modal visibility
  const [moneyRecords, setMoneyRecords] = useState([]); // State to hold money records
  const [currentRecordId, setCurrentRecordId] = useState(null); // ID of the record being edited
  const [isEditing, setIsEditing] = useState(false); // State to track if we're in edit mode

  useEffect(() => {
    fetchTotalBalance(); // Fetch total balance when the component mounts
    fetchMoneyRecords(); // Fetch money records when the component mounts
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

  const fetchMoneyRecords = async () => {
    try {
      const moneyOutPath = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyOutRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyOutRecords`;

      const moneyOutRecordsRef = collection(firestore, moneyOutPath);
      const outRecordsSnapshot = await getDocs(moneyOutRecordsRef);

      const records = [];
      outRecordsSnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({ id: doc.id, ...data }); // Store record with its ID
      });

      setMoneyRecords(records); // Update state with fetched records
    } catch (error) {
      console.error('Error fetching money records:', error);
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
        ? `users/${userId}/farmBranches/Main Farm/moneyOutRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyOutRecords`;

      const moneyOutRecordsRef = collection(firestore, path);
      await addDoc(moneyOutRecordsRef, moneyRecord);

      Alert.alert('Success', 'Money out added successfully!');
      fetchTotalBalance(); // Update balance after adding money
      fetchMoneyRecords(); // Fetch updated records after adding money
      setAmount('');
      setRemarks('');
      setCategory('expense');
      setOtherCategory('');
      setModalVisible(false); // Close modal after success
    } catch (error) {
      console.error('Error adding money out record:', error);
      Alert.alert('Error', 'Failed to add money. Please try again.');
    }
  };

  const handleEditMoney = async () => {
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
        ? `users/${userId}/farmBranches/Main Farm/moneyOutRecords/${currentRecordId}`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyOutRecords/${currentRecordId}`;

      const moneyRecordRef = doc(firestore, path);
      await updateDoc(moneyRecordRef, moneyRecord);

      Alert.alert('Success', 'Money out record updated successfully!');
      fetchTotalBalance(); // Update balance after editing money
      fetchMoneyRecords(); // Fetch updated records after editing money
      setAmount('');
      setRemarks('');
      setCategory('expense');
      setOtherCategory('');
      setModalVisible(false); // Close modal after success
      setIsEditing(false); // Reset edit state
      setCurrentRecordId(null); // Clear current record ID
    } catch (error) {
      console.error('Error updating money out record:', error);
      Alert.alert('Error', 'Failed to update money record. Please try again.');
    }
  };

  const handleDeleteMoney = async (id) => {
    try {
      const confirmation = await new Promise((resolve) => {
        Alert.alert(
          'Confirm Deletion',
          'Are you sure you want to delete this record?',
          [
            { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Delete', onPress: () => resolve(true) },
          ]
        );
      });

      if (confirmation) {
        const path = selectedBranch === 'Main Farm'
          ? `users/${userId}/farmBranches/Main Farm/moneyOutRecords/${id}`
          : `users/${userId}/farmBranches/${selectedBranch}/moneyOutRecords/${id}`;

        const moneyRecordRef = doc(firestore, path);
        await deleteDoc(moneyRecordRef);

        Alert.alert('Success', 'Money out record deleted successfully!');
        fetchTotalBalance(); // Update balance after deleting money
        fetchMoneyRecords(); // Fetch updated records after deleting money
      }
    } catch (error) {
      console.error('Error deleting money out record:', error);
      Alert.alert('Error', 'Failed to delete money record. Please try again.');
    }
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setShowOtherCategoryInput(value === 'other'); // Show input if "Other" is selected
  };
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date; // If the user cancels, keep the current date
    setShowDatePicker(false); // Hide the date picker
    setDate(currentDate); // Update the date state
  };
  const renderMoneyRecord = ({ item }) => (
    <View style={styles.record}>
      <Text style={styles.recordText}>Amount PHP: {item.amount.toFixed(2)}</Text>
      <Text style={styles.recordText}>Category: {item.category}</Text>
      <Text style={styles.recordText}>Remarks: {item.remarks}</Text>
      <View style={styles.recordButtons}>
        <Pressable style={styles.editButton} onPress={() => {
          setAmount(item.amount.toString());
          setRemarks(item.remarks);
          setCategory(item.category);
          setCurrentRecordId(item.id);
          setModalVisible(true);
          setIsEditing(true);
        }}>
          <Text style={styles.buttonText}>Edit</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={() => handleDeleteMoney(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.balanceText}>Current Total Balance: PHP {totalBalance.toFixed(2)}</Text>
      <FlatList
        data={moneyRecords}
        renderItem={renderMoneyRecord}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No money out records available.</Text>}
      />

      <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add Money Out</Text>
      </Pressable>

      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Money Out' : 'Add Money Out'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter remarks"
            value={remarks}
            onChangeText={setRemarks}
          />
          <Picker
            selectedValue={category}
            onValueChange={handleCategoryChange}
            style={styles.picker}
          >
            <Picker.Item label="Expense" value="expense" />
            <Picker.Item label="Salary" value="salary" />
            <Picker.Item label="Equipment" value="equipment" />
            <Picker.Item label="Other" value="other" />
          </Picker>
          {showOtherCategoryInput && (
            <TextInput
              style={styles.input}
              placeholder="Enter other category"
              value={otherCategory}
              onChangeText={setOtherCategory}
            />
            
          )}
               {/* Button to show date picker */}
     <Pressable style={styles.addButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.buttonText}>Select Date</Text>
        </Pressable>

        {/* Date picker */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
          <Pressable style={styles.addButton} onPress={isEditing ? handleEditMoney : handleAddMoney}>
            <Text style={styles.buttonText}>{isEditing ? 'Update' : 'Add'}</Text>
          </Pressable>

        
          <Button title="Cancel" onPress={() => {
            setModalVisible(false);
            setIsEditing(false);
          }} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  record: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  recordText: {
    fontSize: 18,
  },
  recordButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#cccccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default MoneyOutScreen;
