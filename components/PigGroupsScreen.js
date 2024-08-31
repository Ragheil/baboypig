import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config2'; // Adjust the path as needed
import Modal from 'react-native-modal'; // Ensure this import is present for the modal library

const PigGroupsScreen = ({ navigation }) => {
  const [pigGroups, setPigGroups] = useState([]);
  const [filteredPigGroups, setFilteredPigGroups] = useState([]);
  const [name, setName] = useState('');
  const [editPigGroupId, setEditPigGroupId] = useState(null);
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPigGroupName, setCurrentPigGroupName] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchPigGroups();
    }
  }, [user]);

  useEffect(() => {
    const results = pigGroups.filter(group =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPigGroups(results);
  }, [searchQuery, pigGroups]);

  const fetchPigGroups = async () => {
    try {
      if (!user) return;
      const userPigGroupsCollection = collection(firestore, `users/${user.uid}/pigGroups`);
      const q = query(userPigGroupsCollection, orderBy('name'));
      const querySnapshot = await getDocs(q);
      const pigGroupsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPigGroups(pigGroupsList);
    } catch (error) {
      console.error('Error fetching pig groups:', error);
    }
  };

  const addOrUpdatePigGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required!');
      return;
    }

    try {
      if (!user) return;

      if (editPigGroupId) {
        await updateDoc(doc(firestore, `users/${user.uid}/pigGroups`, editPigGroupId), {
          name,
        });
        setEditPigGroupId(null); // Reset edit mode
      } else {
        await addDoc(collection(firestore, `users/${user.uid}/pigGroups`), {
          name,
        });
      }

      setName('');
      setIsAddEditModalVisible(false); // Close the modal after saving
      fetchPigGroups(); // Refresh the pig group list
    } catch (error) {
      console.error('Error adding/updating pig group:', error);
    }
  };

  const confirmDeletePigGroup = (pigGroup) => {
    setCurrentPigGroupName(pigGroup.name);
    setEditPigGroupId(pigGroup.id);
    setIsDeleteModalVisible(true);
  };

  const deletePigGroup = async () => {
    if (deleteConfirmation !== currentPigGroupName) {
      Alert.alert('Validation Error', 'Pig group name does not match.');
      return;
    }

    try {
      if (!user) return;
      await deleteDoc(doc(firestore, `users/${user.uid}/pigGroups`, editPigGroupId));
      setIsDeleteModalVisible(false); // Close the modal after deletion
      setDeleteConfirmation('');
      fetchPigGroups(); // Refresh the pig group list
    } catch (error) {
      console.error('Error deleting pig group:', error);
    }
  };

  const startEditPigGroup = (pigGroup) => {
    setName(pigGroup.name);
    setEditPigGroupId(pigGroup.id);
    setIsAddEditModalVisible(true); // Open the modal for editing
  };

  const openAddPigGroupModal = () => {
    setName('');
    setEditPigGroupId(null);
    setIsAddEditModalVisible(true); // Open the modal for adding
  };

  const closeModal = () => {
    setIsAddEditModalVisible(false);
    setIsDeleteModalVisible(false);
  };

  const handlePigGroupClick = (pigGroup) => {
    navigation.navigate('AddPigInfoScreen', { pigGroupId: pigGroup.id });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pig Information</Text>

      <View style={styles.searchAndAddContainer}>
        <Button title="Add Pig Group" onPress={openAddPigGroupModal} color="#4CAF50" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.tableHeader}>Pig Groups</Text>
      <FlatList
        data={filteredPigGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePigGroupClick(item)}>
            <View style={styles.pigGroupItem}>
              <Text style={styles.pigGroupText}>Name: {item.name}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => startEditPigGroup(item)}>
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDeletePigGroup(item)}>
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal for adding or editing pig group */}
      <Modal isVisible={isAddEditModalVisible} onBackdropPress={closeModal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editPigGroupId ? 'Edit Pig Group' : 'Add Pig Group'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Pig Group Name"
            value={name}
            onChangeText={setName}
          />
          <Button title="Save" onPress={addOrUpdatePigGroup} color="#4CAF50" />
          <Button title="Cancel" onPress={closeModal} color="#F44336" />
        </View>
      </Modal>

      {/* Modal for delete confirmation */}
      <Modal isVisible={isDeleteModalVisible} onBackdropPress={closeModal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Deletion</Text>
          <Text style={styles.warningText}>
            <Text style={styles.boldText}>Warning:</Text> Deleting this group will remove all pig information within it. Are you sure you want to delete the group "{currentPigGroupName}"?
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Type the pig group name to confirm"
            value={deleteConfirmation}
            onChangeText={setDeleteConfirmation}
          />
          <Button title="Delete" onPress={deletePigGroup} color="#F44336" />
          <Button title="Cancel" onPress={closeModal} color="#4CAF50" />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  searchAndAddContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginLeft: 10,
  },
  tableHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pigGroupItem: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
  },
  pigGroupText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionText: {
    color: '#4CAF50',
    fontWeight: 'bold',
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
    fontWeight: 'bold'
  },
  warningText: {
    fontSize: 16,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 60,
  },
});

export default PigGroupsScreen;
