import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, Modal, TouchableOpacity, Image } from 'react-native';
import { addDoc, collection, query, onSnapshot, doc, getDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { auth, firestore } from '../../firebase/config2'; // Adjust the path as needed
import { Picker } from '@react-native-picker/picker';
import deleteIcon from '../../assets/images/buttons/deleteIcon.png';
import editIcon from '../../assets/images/buttons/editIcon.png';
import viewIcon from '../../assets/images/buttons/viewIcon.png';
import styles from '../../frontend/pigGroupStyles/AddPigInfoScreenStyles'; // Importing the separated styles

export default function AddPigInfoScreen({ route }) {
  const { pigGroupId, userId } = route.params;
  const [pigName, setPigName] = useState('');
  const [tagNumber, setTagNumber] = useState('');
  const [gender, setGender] = useState('male');
  const [race, setRace] = useState('');
  const [pigs, setPigs] = useState([]);
  const [currentPigId, setCurrentPigId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pigGroupName, setPigGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPig, setSelectedPig] = useState(null);
  const user = auth.currentUser;

  // Fetch Pig Group Name
  useEffect(() => {
    const fetchPigGroupName = async () => {
      try {
        const docRef = doc(firestore, `users/${user.uid}/pigGroups/${pigGroupId}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPigGroupName(docSnap.data().name || '');
        } else {
          console.error('No such pig group!');
        }
      } catch (error) {
        console.error('Error fetching pig group name:', error);
      }
    };

    fetchPigGroupName();
  }, [pigGroupId, user.uid]);

  // Fetch Pigs
  useEffect(() => {
    const fetchPigs = async () => {
      try {
        const q = query(collection(firestore, `users/${user.uid}/pigGroups/${pigGroupId}/pigs`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            setPigs([]);
          } else {
            const pigsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPigs(pigsList);
          }
        }, (error) => {
          console.error('Error fetching pigs:', error);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching pigs:', error);
      }
    };

    fetchPigs();
  }, [pigGroupId, user.uid]);

  // Check for Duplicates
  const checkForDuplicates = async () => {
    try {
      const q = query(collection(firestore, `users/${user.uid}/pigGroups/${pigGroupId}/pigs`));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.some(doc => {
        const data = doc.data();
        return (data.pigName === pigName || data.tagNumber === tagNumber) && (currentPigId === null || doc.id !== currentPigId);
      });
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  };

  // Add Pig
  const handleAddPig = async () => {
    if (!pigName.trim() || !tagNumber.trim() || !gender || !race.trim()) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    if (await checkForDuplicates()) {
      Alert.alert('Duplicate Pig Name', 'A Pig Name already exists. Please try another name.');
      return;
    }

    try {
      const docRef = await addDoc(collection(firestore, `users/${user.uid}/pigGroups/${pigGroupId}/pigs`), {
        pigName,
        tagNumber,
        gender,
        race,
        createdAt: new Date(),
      });
      Alert.alert('Success', 'Pig added successfully!');
      setModalVisible(false);
      // Reset form
      setPigName('');
      setTagNumber('');
      setGender('male');
      setRace('');
    } catch (error) {
      console.error('Error adding pig:', error);
      Alert.alert('Error', 'There was a problem adding the pig.');
    }
  };

  // Edit Pig
  const handleEditPig = async () => {
    if (!pigName.trim() || !tagNumber.trim() || !gender || !race.trim()) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    if (await checkForDuplicates()) {
      Alert.alert('Duplicate Error', 'Pig Name or Tag Number already exists.');
      return;
    }

    try {
      await updateDoc(doc(firestore, `users/${user.uid}/pigGroups/${pigGroupId}/pigs/${currentPigId}`), {
        pigName,
        tagNumber,
        gender,
        race,
      });
      Alert.alert('Success', 'Pig updated successfully!');
      setIsEditing(false);
      setModalVisible(false);
      setPigName('');
      setTagNumber('');
      setGender('male');
      setRace('');
      setCurrentPigId(null);
    } catch (error) {
      console.error('Error updating pig:', error);
      Alert.alert('Error', 'There was a problem updating the pig.');
    }
  };

  // Delete Pig
  const handleDeletePig = (pigId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this pig?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await deleteDoc(doc(firestore, `users/${user.uid}/pigGroups/${pigGroupId}/pigs/${pigId}`));
              Alert.alert('Success', 'Pig deleted successfully!');
            } catch (error) {
              console.error('Error deleting pig:', error);
              Alert.alert('Error', 'There was a problem deleting the pig.');
            }
          }
        },
      ],
      { cancelable: true }
    );
  };

  // Filter Pigs
  const filteredPigs = pigs.filter(pig => pig.pigName.toLowerCase().includes(searchQuery.toLowerCase()));

  // Render Pig Item
  const renderPig = ({ item }) => (
    <View style={styles.pigContainer}>
      <View style={styles.pigInfo}>
        <Text style={styles.pigText}>Tag Number: {item.tagNumber}</Text>
        <Text style={styles.pigText}>Pig Name: {item.pigName}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={() => {
          setSelectedPig(item);
          setDetailModalVisible(true);
        }}>
          <Image source={viewIcon} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          setPigName(item.pigName);
          setTagNumber(item.tagNumber);
          setGender(item.gender);
          setRace(item.race);
          setCurrentPigId(item.id);
          setIsEditing(true);
          setModalVisible(true);
        }}>
          <Image source={editIcon} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeletePig(item.id)}>
          <Image source={deleteIcon} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pig Information</Text>
      <Text style={styles.groupName}>Current Pig Group: {pigGroupName}</Text>
      <View style={styles.searchContainer}>
        <Button
          title="Add Pig"
          onPress={() => {
            setIsEditing(false);
            setModalVisible(true);
          }}
          style={styles.addButton} color="#4CAF50"
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search pigs"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredPigs}
        renderItem={renderPig}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
      
      {/* Add/Edit Pig Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Pig Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Pig Name"
              value={pigName}
              onChangeText={setPigName}
            />
            <Text style={styles.label}>Tag Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Tag Number"
              value={tagNumber}
              onChangeText={setTagNumber}
              keyboardType="numeric"
            />
            <Text style={styles.label}>Gender</Text>
            <Picker
              selectedValue={gender}
              style={styles.picker}
              onValueChange={(itemValue) => setGender(itemValue)}
            >
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
            <Text style={styles.label}>Race</Text>
            <TextInput
              style={styles.input}
              placeholder="Race"
              value={race}
              onChangeText={setRace}
            />
            <Button
              title={isEditing ? 'Update Pig' : 'Add Pig'}
              onPress={isEditing ? handleEditPig : handleAddPig}
              color="#4CAF50"
            />
            <Button
              title="Cancel"
              onPress={() => {
                setModalVisible(false);
                setPigName('');
                setTagNumber('');
                setGender('male');
                setRace('');
                setCurrentPigId(null);
              }}
              color="#F44336"
            />
          </View>
        </View>
      </Modal>
      
      {/* Pig Detail Modal */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedPig && (
              <>
                <Text style={styles.label}>Pig Name: {selectedPig.pigName}</Text>
                <Text style={styles.label}>Tag Number: {selectedPig.tagNumber}</Text>
                <Text style={styles.label}>Gender: {selectedPig.gender}</Text>
                <Text style={styles.label}>Race: {selectedPig.race}</Text>
              </>
            )}
            <Button
              title="Close"
              onPress={() => setDetailModalVisible(false)}
              color="#F44336"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

