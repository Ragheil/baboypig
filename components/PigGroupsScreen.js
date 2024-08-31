import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config2'; // Adjust the path as needed

const PigGroupsScreen = ({ navigation }) => {
  const [pigGroups, setPigGroups] = useState([]);
  const [filteredPigGroups, setFilteredPigGroups] = useState([]);
  const [name, setName] = useState('');
  const [editPigGroupId, setEditPigGroupId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    if (!name) {
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
      setModalVisible(false); // Close the modal after saving
      fetchPigGroups(); // Refresh the pig group list
    } catch (error) {
      console.error('Error adding/updating pig group:', error);
    }
  };

  const confirmDeletePigGroup = (pigGroupId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this pig group?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deletePigGroup(pigGroupId) },
      ],
      { cancelable: false }
    );
  };

  const deletePigGroup = async (pigGroupId) => {
    try {
      if (!user) return;
      await deleteDoc(doc(firestore, `users/${user.uid}/pigGroups`, pigGroupId));
      fetchPigGroups(); // Refresh the pig group list
    } catch (error) {
      console.error('Error deleting pig group:', error);
    }
  };

  const startEditPigGroup = (pigGroup) => {
    setName(pigGroup.name);
    setEditPigGroupId(pigGroup.id);
    setModalVisible(true); // Open the modal for editing
  };

  const openAddPigGroupModal = () => {
    setName('');
    setEditPigGroupId(null);
    setModalVisible(true); // Open the modal for adding
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handlePigGroupClick = (pigGroup) => {
    // Navigate to the PigGroupDetailsScreen or perform any other action
    navigation.navigate('AddPigInfoScreen', { pigGroupId: pigGroup.id });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <Button title="Add Pig Group" onPress={openAddPigGroupModal} color="#4CAF50" />

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
                <TouchableOpacity onPress={() => confirmDeletePigGroup(item.id)}>
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.header}>{editPigGroupId ? 'Edit Pig Group' : 'Add New Pig Group'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <View style={styles.buttonContainer}>
              <Button title="Save" onPress={addOrUpdatePigGroup} color="#4CAF50" />
              <Button title="Cancel" onPress={closeModal} color="#F44336" />
            </View>
          </View>
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
  searchInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default PigGroupsScreen;
