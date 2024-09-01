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
      const interval = setInterval(fetchPigGroups, 1000); // Fetch every second
      return () => clearInterval(interval); // Cleanup on unmount
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
      
      const pigGroupsList = await Promise.all(querySnapshot.docs.map(async doc => {
        const pigGroupId = doc.id;
        const pigsCollection = collection(firestore, `users/${user.uid}/pigGroups/${pigGroupId}/pigs`);
        const pigsSnapshot = await getDocs(pigsCollection);
        const pigCount = pigsSnapshot.size;

        return {
          id: pigGroupId,
          ...doc.data(),
          pigCount: pigCount, // Add the pig count to the group data
        };
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
        console.log('Pig group updated:', name); // Log update
        setEditPigGroupId(null); // Reset edit mode
      } else {
        await addDoc(collection(firestore, `users/${user.uid}/pigGroups`), {
          name,
        });
        console.log('Pig group added:', name); // Log addition
      }

      setName('');
      setIsAddEditModalVisible(false); // Close the modal after saving
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
      console.log('Pig group deleted:', currentPigGroupName); // Log deletion
      setIsDeleteModalVisible(false); // Close the modal after deletion
      setDeleteConfirmation('');
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
              {/* Display the pig group name and pig count in bold */}
              <Text style={styles.pigGroupText}>
                {item.name} <Text style={styles.boldText}>{item.pigCount} pigs</Text>
              </Text>
              <View style={styles.actions}>
                {/* Wrap "Edit" and "Delete" text within <Text> components */}
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

      {/* Modal for confirming deletion */}
      <Modal isVisible={isDeleteModalVisible} onBackdropPress={closeModal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Deletion</Text>
          <Text>Type the pig group name <Text style={styles.boldText}>{currentPigGroupName}</Text> to confirm:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Pig Group Name"
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
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 60,

  },
  searchAndAddContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    borderColor: '#CCC',
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginLeft: 10,
  },
  tableHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pigGroupItem: {
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,

  },
  pigGroupText: {
    fontSize: 30,
  },
  boldText: {
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
  },
  actionText: {
    marginLeft: 10,
    color: '#007BFF',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderColor: '#CCC',
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
});

export default PigGroupsScreen;
