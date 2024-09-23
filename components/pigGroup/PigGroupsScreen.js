import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, where, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase/config2';
import Modal from 'react-native-modal';
import { useRoute } from '@react-navigation/native';
import editIcon from '../../assets/images/buttons/editIcon.png';
import deleteIcon from '../../assets/images/buttons/deleteIcon.png';
import styles from '../../frontend/pigGroupStyles/PigGroupsScreenStyles';

const PigGroupsScreen = ({ navigation, route }) => {
  const { selectedBranch } = route.params;
  const user = auth.currentUser;
  const [pigGroups, setPigGroups] = useState([]);
  const [filteredPigGroups, setFilteredPigGroups] = useState([]);
  const [name, setName] = useState('');
  const [editPigGroupId, setEditPigGroupId] = useState(null);
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPigGroupName, setCurrentPigGroupName] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    if (user) {
      fetchPigGroups();
      const interval = setInterval(fetchPigGroups, 1000);
      return () => clearInterval(interval);
    }
  }, [user, selectedBranch]);

  useEffect(() => {
    const results = pigGroups.filter(group =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPigGroups(results);
  }, [searchQuery, pigGroups]);

  // Function to check if the selected branch exists before allowing pig group operations
  const branchExists = async () => {
    try {
      const branchRef = selectedBranch === 'main' 
        ? doc(firestore, `users/${user.uid}/farmBranches/Main Farm`) 
        : doc(firestore, `users/${user.uid}/farmBranches/${selectedBranch}`);
      
      const branchSnapshot = await getDoc(branchRef);
      return branchSnapshot.exists();  // Returns true if the branch exists
    } catch (error) {
      console.error('Error checking branch existence:', error);
      return false;
    }
  };
  
  const fetchPigGroups = async () => {
    try {
      if (!user) return;
  
      if (selectedBranch !== 'Main Farm' && !(await branchExists())) {
        console.log(`Branch ${selectedBranch} does not exist.`);
        return;
      }
  
      // Corrected pigGroupsCollection logic
      const pigGroupsCollection = selectedBranch === 'Main Farm'
        ? collection(firestore, `users/${user.uid}/farmBranches/Main Farm/pigGroups`) // Access pig groups under "Main Farm" document
        : collection(firestore, `users/${user.uid}/farmBranches/${selectedBranch}/pigGroups`);
  
      const q = query(pigGroupsCollection, orderBy('name'));
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
  

  const isPigGroupNameDuplicate = async (name) => {
    if (!user) return false;

    try {
      const pigGroupsCollection = collection(firestore, `users/${user.uid}/farmBranches/${selectedBranch}/pigGroups`);
      const q = query(pigGroupsCollection, where('name', '==', name));
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

    if (selectedBranch !== 'Main Farm' && !(await branchExists())) {
      Alert.alert('Validation Error', `Branch ${selectedBranch} does not exist. Please select a valid branch.`);
      return;
    }

    const isDuplicate = await isPigGroupNameDuplicate(name);
    if (isDuplicate) {
      Alert.alert('Validation Error', 'A pig group with this name already exists.');
      return;
    }

    try {
      if (!user) return;

      const pigGroupsCollection = selectedBranch === 'Main Farm'
        ? collection(firestore, `users/${user.uid}/farmBranches/Main Farm/pigGroups`)
        : collection(firestore, `users/${user.uid}/farmBranches/${selectedBranch}/pigGroups`);

      if (editPigGroupId) {
        // Update existing pig group
        await updateDoc(doc(pigGroupsCollection, editPigGroupId), { name });
        console.log('Pig group updated:', name);
      } else {
        // Add new pig group
        await addDoc(pigGroupsCollection, { name });
        console.log('Pig group added:', name);
      }

      setName('');
      setEditPigGroupId(null);
      setIsAddEditModalVisible(false);
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

      await deleteDoc(doc(firestore, `users/${user.uid}/farmBranches/${selectedBranch}/pigGroups`, editPigGroupId));
      console.log('Pig group deleted:', currentPigGroupName);
      setIsDeleteModalVisible(false);
      setDeleteConfirmation('');
    } catch (error) {
      console.error('Error deleting pig group:', error);
    }
  };

  const startEditPigGroup = (pigGroup) => {
    setName(pigGroup.name);
    setEditPigGroupId(pigGroup.id);
    setIsAddEditModalVisible(true);
  };

  const openAddPigGroupModal = () => {
    setName('');
    setEditPigGroupId(null);
    setIsAddEditModalVisible(true);
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
            <Text style={styles.pigGroupText}>{pigGroup.name}</Text>
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
      <Text style={styles.title}>Pig Groups for {selectedBranch} branch</Text>

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
      <ScrollView>{renderPigGroups()}</ScrollView>

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
          <Text>
            <Text style={styles.boldText}>Warning:</Text> Deleting this group will remove all pig information within it. Are you sure you want to delete this group? Type "<Text style={styles.boldText}>{currentPigGroupName}</Text>" to confirm:
          </Text>
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

export default PigGroupsScreen;
