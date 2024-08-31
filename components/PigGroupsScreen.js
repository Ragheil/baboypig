import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import { addDoc, collection, query, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase/config2';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';

export default function PigGroupsScreen() {
  const [pigGroupName, setPigGroupName] = useState('');
  const [pigGroups, setPigGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [currentPigGroupId, setCurrentPigGroupId] = useState(null);
  const [currentPigGroupName, setCurrentPigGroupName] = useState('');
  const [newName, setNewName] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const navigation = useNavigation();

  // Function to add a new pig group to Firestore
  const handleAddPigGroup = async () => {
    if (pigGroupName.trim() === '') {
      Alert.alert('Validation Error', 'Pig group name cannot be empty.');
      return;
    }

    try {
      await addDoc(collection(firestore, 'pigGroups'), {
        name: pigGroupName,
        createdAt: new Date(),
      });
      Alert.alert('Success', 'Pig group added successfully!');
      setPigGroupName('');
    } catch (error) {
      console.error('Error adding pig group:', error);
      Alert.alert('Error', 'There was a problem adding the pig group.');
    }
  };

  // Fetch pig groups from Firestore
  useEffect(() => {
    const q = query(collection(firestore, 'pigGroups'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groups = [];
      snapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() });
      });
      setPigGroups(groups);
    });

    return () => unsubscribe();
  }, []);

  // Filtered pig groups based on search query
  const filteredPigGroups = pigGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to handle deleting a pig group
  const handleDeletePigGroup = async () => {
    if (deleteConfirmation === currentPigGroupName) {
      try {
        await deleteDoc(doc(firestore, 'pigGroups', currentPigGroupId));
        Alert.alert('Success', 'Pig group deleted successfully!');
        setIsDeleteModal(false);
        setDeleteConfirmation('');
      } catch (error) {
        console.error('Error deleting pig group:', error);
        Alert.alert('Error', 'There was a problem deleting the pig group.');
      }
    } else {
      Alert.alert('Validation Error', 'Pig group name does not match.');
    }
  };

  // Function to handle updating a pig group
  const handleUpdatePigGroup = async () => {
    if (newName.trim() === '') {
      Alert.alert('Validation Error', 'Pig group name cannot be empty.');
      return;
    }

    try {
      await updateDoc(doc(firestore, 'pigGroups', currentPigGroupId), {
        name: newName,
      });
      Alert.alert('Success', 'Pig group updated successfully!');
      setIsModalVisible(false);
      setNewName('');
    } catch (error) {
      console.error('Error updating pig group:', error);
      Alert.alert('Error', 'There was a problem updating the pig group.');
    }
  };

  // Function to render each pig group item
  const renderPigGroup = ({ item }) => (
    <View style={styles.pigGroupBox}>
      <TouchableOpacity onPress={() => navigation.navigate('AddPigInfoScreen', { pigGroupId: item.id })}>
        <Text style={styles.pigGroupText}>{item.name}</Text>
      </TouchableOpacity>
      <View style={styles.actionsContainer}>
        <Button title="Edit" onPress={() => {
          setCurrentPigGroupId(item.id);
          setNewName(item.name);
          setIsModalVisible(true);
        }} />
        <Button title="Delete" color="red" onPress={() => {
          setCurrentPigGroupId(item.id);
          setCurrentPigGroupName(item.name);
          setIsDeleteModal(true);
        }} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Pig Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Pig Group Name"
        value={pigGroupName}
        onChangeText={setPigGroupName}
      />
      <Button title="Add Pig Group" onPress={handleAddPigGroup} />

      <TextInput
        style={styles.searchInput}
        placeholder="Search Pig Groups"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredPigGroups}
        renderItem={renderPigGroup}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Modal for updating pig group */}
      <Modal isVisible={isModalVisible} onBackdropPress={() => setIsModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Update Pig Group</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new pig group name"
            value={newName}
            onChangeText={setNewName}
          />
          <Button title="Save Changes" onPress={handleUpdatePigGroup} />
          <Button title="Cancel" onPress={() => setIsModalVisible(false)} color="red" />
        </View>
      </Modal>

      {/* Modal for delete confirmation */}
      <Modal isVisible={isDeleteModal} onBackdropPress={() => setIsDeleteModal(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Deletion</Text>
          <Text style={styles.warningText}>
            <Text style={styles.boldText}>Warning:</Text> The pig information inside this group will also be deleted. Are you sure you want to delete the group "{currentPigGroupName}"?
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Type the pig group name to confirm"
            value={deleteConfirmation}
            onChangeText={setDeleteConfirmation}
          />
          <Button title="Delete" onPress={handleDeletePigGroup} />
          <Button title="Cancel" onPress={() => setIsDeleteModal(false)} color="red" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  searchInput: {
    width: '100%',
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  list: {
    marginTop: 20,
  },
  pigGroupBox: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
  },
  pigGroupText: {
    fontSize: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 16,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
});
