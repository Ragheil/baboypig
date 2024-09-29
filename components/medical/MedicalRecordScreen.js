import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firestore } from '../../firebase/config2';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import styles from '../../frontend/medicalStyles/MedicalRecordScreenStyles'; // Import the styles

const MedicalRecordScreen = ({ route, navigation }) => {
  const { userId, selectedBranch, pigGroupId, pigName, selectedPigId } = route.params; // Access passed params
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [medicalId, setMedicalId] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [remarks, setRemarks] = useState('');
  const [editRecordId, setEditRecordId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Medical Records
  useEffect(() => {
    const fetchRecords = async () => {
      const recordsPath = `users/${userId}/farmBranches/${selectedBranch}/pigGroups/${pigGroupId}/pigs/${selectedPigId}/medicalRecords`;
      const q = query(collection(firestore, recordsPath));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const recordsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecords(recordsList);
        setFilteredRecords(recordsList); // Initialize filtered records
      });

      return () => unsubscribe();
    };

    fetchRecords();
  }, [userId, selectedBranch, pigGroupId, selectedPigId]);

  // Filter records based on search query
  useEffect(() => {
    const filtered = records.filter(record =>
      record.medicalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRecords(filtered);
  }, [searchQuery, records]);

  // Function to add new medical record
  const handleAddRecord = async () => {
    if (!medicalId.trim() || !name.trim() || !remarks.trim()) {
      Alert.alert('Validation Error', 'All fields must be filled.');
      return;
    }

    const recordsPath = `users/${userId}/farmBranches/${selectedBranch}/pigGroups/${pigGroupId}/pigs/${selectedPigId}/medicalRecords`;

    try {
      await addDoc(collection(firestore, recordsPath), {
        medicalId,
        name,
        date,
        remarks,
        createdAt: new Date(),
      });
      resetFields();
      setModalVisible(false);
      Alert.alert('Success', 'Medical record added successfully!');
    } catch (error) {
      console.error('Error adding record:', error);
      Alert.alert('Error', 'There was a problem adding the record.');
    }
  };

  // Function to edit an existing medical record
  const handleEditRecord = async (recordId) => {
    if (!medicalId.trim() || !name.trim() || !remarks.trim()) {
      Alert.alert('Validation Error', 'All fields must be filled.');
      return;
    }

    const recordsPath = `users/${userId}/farmBranches/${selectedBranch}/pigGroups/${pigGroupId}/pigs/${selectedPigId}/medicalRecords/${recordId}`;

    try {
      await updateDoc(doc(firestore, recordsPath), {
        medicalId,
        name,
        date,
        remarks,
      });
      resetFields();
      setEditRecordId(null);
      setModalVisible(false);
      Alert.alert('Success', 'Medical record updated successfully!');
    } catch (error) {
      console.error('Error updating record:', error);
      Alert.alert('Error', 'There was a problem updating the record.');
    }
  };

  // Function to delete a medical record with confirmation
  const handleDeleteRecord = async (recordId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this medical record?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async () => {
            const recordsPath = `users/${userId}/farmBranches/${selectedBranch}/pigGroups/${pigGroupId}/pigs/${selectedPigId}/medicalRecords/${recordId}`;
            try {
              await deleteDoc(doc(firestore, recordsPath));
              Alert.alert('Success', 'Medical record deleted successfully!');
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('Error', 'There was a problem deleting the record.');
            }
          }
        }
      ]
    );
  };

  const resetFields = () => {
    setMedicalId('');
    setName('');
    setDate(new Date());
    setRemarks('');
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setIsDatePickerVisible(false);
    setDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medical Records for {pigName}</Text>

      {/* Search Bar */}
      <TextInput
        placeholder="Search by Medical ID or Name"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.input}
      />

      <Button title="Add Medical Record" onPress={() => {
        resetFields();
        setModalVisible(true);
        setEditRecordId(null); // Ensure no record is set for editing
      }} color="#4CAF50" />

      <FlatList
        data={filteredRecords}
        renderItem={({ item }) => (
          <View style={styles.recordItem}>
            <Text>Medical ID: {item.medicalId}</Text>
            <Text>Name: {item.name}</Text>
            <Text>Date: {item.date ? item.date.toDate().toLocaleDateString() : "Date not available"}</Text>
            <Text>Remarks: {item.remarks}</Text>
            <Button
              title="Edit"
              onPress={() => {
                setMedicalId(item.medicalId);
                setName(item.name);
                setDate(item.date ? item.date.toDate() : new Date()); // Handle date if available
                setRemarks(item.remarks);
                setEditRecordId(item.id);
                setModalVisible(true);
              }}
            />
            <Button
              title="Delete"
              onPress={() => handleDeleteRecord(item.id)}
              color="red"
            />
          </View>
        )}
        keyExtractor={item => item.id}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editRecordId ? 'Edit Record' : 'Add Record'}</Text>
          <TextInput
            placeholder="Medical ID"
            value={medicalId}
            onChangeText={setMedicalId}
            style={styles.input}
          />
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Remarks"
            value={remarks}
            onChangeText={setRemarks}
            style={styles.input}
          />
          <Button title="Show Date Picker" onPress={() => setIsDatePickerVisible(true)} />
          {isDatePickerVisible && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          <Button title={editRecordId ? 'Update Record' : 'Add Record'} onPress={() => {
            if (editRecordId) {
              handleEditRecord(editRecordId);
            } else {
              handleAddRecord();
            }
          }} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

export default MedicalRecordScreen;
