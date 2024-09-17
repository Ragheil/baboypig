import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { auth, firestore } from '../../firebase/config2'; // Adjust the path as needed
import Modal from 'react-native-modal'; // Ensure this import is present for the modal library
import { useRoute } from '@react-navigation/native';

// Import your icons
import editIcon from '../../assets/images/buttons/editIcon.png'; // Adjust the path as needed
import deleteIcon from '../../assets/images/buttons/deleteIcon.png'; // Adjust the path as needed
import styles from '../../frontend/pigGroupStyles/PigGroupsScreenStyles'; // Importing the separated styles

const PigGroupsScreen = ({ navigation }) => {
  const route = useRoute();
  const { selectedBranch } = route.params || {};
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
  }, [user, selectedBranch]); // Add selectedBranch to dependencies
  

  useEffect(() => {
    const results = pigGroups.filter(group =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPigGroups(results);
  }, [searchQuery, pigGroups]);

  const fetchPigGroups = async () => {
    try {
      if (!user) return;
  
      const userPigGroupsCollection = collection(firestore, selectedBranch && selectedBranch !== 'main'
        ? `users/${user.uid}/farmBranches/${selectedBranch}/pigGroups`
        : `users/${user.uid}/pigGroups`);
  
      let q = query(userPigGroupsCollection, orderBy('name'));
  
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
  
  

  const isPigGroupNameDuplicate = async (name) => {
    if (!user) return false;
    
    try {
      const userPigGroupsCollection = collection(firestore, `users/${user.uid}/pigGroups`);
      const q = query(userPigGroupsCollection, where('name', '==', name));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking pig group name:', error);
      return false;
    }
  };

  const addOrUpdatePigGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required!');
      return;
    }
  
    // Check for duplicate name
    const isDuplicate = await isPigGroupNameDuplicate(name);
    if (isDuplicate && (!editPigGroupId || pigGroups.find(group => group.name === name)?.id !== editPigGroupId)) {
      Alert.alert('Duplicate Pig Group', 'A pig group with this name already exists. Please try another name.');
      return;
    }
  
    try {
      if (!user) return;
  
      // Determine the collection path based on the selected branch
      const collectionPath = selectedBranch && selectedBranch !== 'main'
        ? `users/${user.uid}/farmBranches/${selectedBranch}/pigGroups`
        : `users/${user.uid}/pigGroups`;
  
      const pigGroupsCollection = collection(firestore, collectionPath);
  
      if (editPigGroupId) {
        await updateDoc(doc(firestore, collectionPath, editPigGroupId), {
          name,
        });
        console.log('Pig group updated:', name); // Log update
        setEditPigGroupId(null); // Reset edit mode
      } else {
        await addDoc(pigGroupsCollection, {
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

  const renderPigGroups = () => {
    return (
      <View style={styles.grid}>
        {filteredPigGroups.map(pigGroup => (
          <TouchableOpacity
            key={pigGroup.id}
            onPress={() => handlePigGroupClick(pigGroup)}
            style={styles.pigGroupItem}
          >
            <Text style={styles.pigGroupText}>
              {pigGroup.name}
            </Text>
            <Text style={styles.pigCountText}>
              <Text style={styles.boldText}>{pigGroup.pigCount} Pigs</Text>
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => startEditPigGroup(pigGroup)}>
                <Image source={editIcon} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDeletePigGroup(pigGroup)}>
                <Image source={deleteIcon} style={styles.icon} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pig Groups</Text>

      <View style={styles.searchAndAddContainer}>
        <Button title="Add Pig Group" onPress={openAddPigGroupModal} color="#4CAF50" style={styles.addButton} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.tableHeader}>Pig Groups</Text>
      <ScrollView>
        {renderPigGroups()}
      </ScrollView>

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
          <Button title="Save" onPress={addOrUpdatePigGroup} color="#4CAF50" style={styles.saveButton} />
          <Button title="Cancel" onPress={closeModal} color="#F44336" style={styles.cancelButton} />
        </View>
      </Modal>

      {/* Modal for confirming deletion */}
      <Modal isVisible={isDeleteModalVisible} onBackdropPress={closeModal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Deletion</Text>
          <Text>
            <Text style={styles.boldText}>Warning:</Text> Deleting this group will remove all the 
            <Text style={styles.boldText}> Pig Information</Text> within it. Are you sure you want to 
            delete this group? Type "<Text style={styles.boldText}>{currentPigGroupName}</Text>" 
            to confirm:
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Pig Group Name"
            value={deleteConfirmation}
            onChangeText={setDeleteConfirmation}
          />
          <Button title="Delete" onPress={deletePigGroup} color="#F44336" style={styles.saveButton} />
          <Button title="Cancel" onPress={closeModal} color="#4CAF50" style={styles.cancelButton} />
        </View>
      </Modal>
    </View>
  );
};



export default PigGroupsScreen;