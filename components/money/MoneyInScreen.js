import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Modal, Pressable, FlatList } from 'react-native';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
      const moneyInPath = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyInRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyInRecords`;

      const moneyInRecordsRef = collection(firestore, moneyInPath);
      const inRecordsSnapshot = await getDocs(moneyInRecordsRef);

      const records = [];
      inRecordsSnapshot.forEach((doc) => {
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
        ? `users/${userId}/farmBranches/Main Farm/moneyInRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyInRecords`;

      const moneyInRecordsRef = collection(firestore, path);
      await addDoc(moneyInRecordsRef, moneyRecord);

      Alert.alert('Success', 'Money added successfully!');
      fetchTotalBalance(); // Update balance after adding money
      fetchMoneyRecords(); // Fetch updated records after adding money
      setAmount('');
      setRemarks('');
      setCategory('salary');
      setOtherCategory('');
      setModalVisible(false); // Close modal after success
    } catch (error) {
      console.error('Error adding money record:', error);
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
        ? `users/${userId}/farmBranches/Main Farm/moneyInRecords/${currentRecordId}`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyInRecords/${currentRecordId}`;

      const moneyRecordRef = doc(firestore, path);
      await updateDoc(moneyRecordRef, moneyRecord);

      Alert.alert('Success', 'Money record updated successfully!');
      fetchTotalBalance(); // Update balance after editing money
      fetchMoneyRecords(); // Fetch updated records after editing money
      setAmount('');
      setRemarks('');
      setCategory('salary');
      setOtherCategory('');
      setModalVisible(false); // Close modal after success
      setIsEditing(false); // Reset edit state
      setCurrentRecordId(null); // Clear current record ID
    } catch (error) {
      console.error('Error updating money record:', error);
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
          ? `users/${userId}/farmBranches/Main Farm/moneyInRecords/${id}`
          : `users/${userId}/farmBranches/${selectedBranch}/moneyInRecords/${id}`;

        const moneyRecordRef = doc(firestore, path);
        await deleteDoc(moneyRecordRef);

        Alert.alert('Success', 'Money record deleted successfully!');
        fetchTotalBalance(); // Update balance after deleting money
        fetchMoneyRecords(); // Fetch updated records after deleting money
      }
    } catch (error) {
      console.error('Error deleting money record:', error);
      Alert.alert('Error', 'Failed to delete money record. Please try again.');
    }
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setShowOtherCategoryInput(value === 'other'); // Show input if "Other" is selected
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
      <Text style={styles.title}>Money In</Text>
      <Text style={styles.balance}>Total Balance: ${totalBalance.toFixed(2)}</Text>
      <FlatList
        data={moneyRecords}
        renderItem={renderMoneyRecord}
        keyExtractor={(item) => item.id}
        style={styles.recordList}
      />
      <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add Money In</Text>
      </Pressable>

      {/* Modal for adding/editing records */}
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Money In' : 'Add Money In'}</Text>
          <TextInput
            placeholder="Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
          />
          <TextInput
            placeholder="Remarks"
            value={remarks}
            onChangeText={setRemarks}
            style={styles.input}
          />
          <Picker selectedValue={category} onValueChange={handleCategoryChange} style={styles.picker}>
            <Picker.Item label="Salary" value="salary" />
            <Picker.Item label="Bonus" value="bonus" />
            <Picker.Item label="Other" value="other" />
          </Picker>
          {showOtherCategoryInput && (
            <TextInput
              placeholder="Specify Other Category"
              value={otherCategory}
              onChangeText={setOtherCategory}
              style={styles.input}
            />
          )}
          <Text style={styles.dateLabel}>Date:</Text>
          <Pressable onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || date;
                setShowDatePicker(false);
                setDate(currentDate);
              }}
            />
          )}
          <Pressable style={styles.modalButton} onPress={isEditing ? handleEditMoney : handleAddMoney}>
            <Text style={styles.buttonText}>{isEditing ? 'Update' : 'Add'}</Text>
          </Pressable>
          <Pressable style={styles.modalButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  balance: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#4caf50', // Green for positive balance
  },
  recordList: {
    marginBottom: 20,
  },
  record: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    elevation: 1,
  },
  recordText: {
    fontSize: 16,
    color: '#333333',
  },
  recordButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#2196F3', // Blue for edit button
    padding: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#f44336', // Red for delete button
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4caf50', // Green for add button
    padding: 15,
    borderRadius: 5,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    marginBottom: 10,
  },
  dateLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#2196F3', // Blue for date text
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#2196F3', // Blue for modal buttons
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
});

export default MoneyInScreen;
