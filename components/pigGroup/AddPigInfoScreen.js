import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, Modal, TouchableOpacity, Image } from 'react-native';
import { addDoc, collection, query, onSnapshot, doc, getDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { auth, firestore } from '../../firebase/config2';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';
import deleteIcon from '../../assets/images/buttons/deleteIcon.png';
import editIcon from '../../assets/images/buttons/editIcon.png';
import viewIcon from '../../assets/images/buttons/viewIcon.png';
import styles from '../../frontend/pigGroupStyles/AddPigInfoScreenStyles';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { useFocusEffect } from '@react-navigation/native'; // Import the useFocusEffect


export default function AddPigInfoScreen({ route }) {
  const navigation = useNavigation(); // Get the navigation object
  const { pigGroupId, selectedBranch } = route.params; // Add selectedBranch param
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
  const [dateOfBirth, setDateOfBirth] = useState(new Date());  // Date of birth state
  const [openDatePicker, setOpenDatePicker] = useState(false); // Corrected
  const [vitality, setVitality] = useState('alive'); // Vitality state (alive/disabled)
  const [isVitalityEditable, setIsVitalityEditable] = useState(false); // Controls the picker state
  const [date, setDate] = useState(new Date());
  const datePickerRef = useRef(null);

  const user = auth.currentUser;

  const handleOpenDatePicker = () => {
    setOpenDatePicker(true);
  };
  // Fetch Pig Group Name based on selected branch
  const fetchPigGroupName = async () => {
    const pigCollectionPath = selectedBranch === 'Main Farm'
      ? `users/${user.uid}/farmBranches/Main Farm/pigGroups/${pigGroupId}`
      : `users/${user.uid}/farmBranches/${selectedBranch}/pigGroups/${pigGroupId}`;
      
    const docRef = doc(firestore, pigCollectionPath);
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      setPigGroupName(docSnapshot.data().name);
    }
  };

  useEffect(() => {
    fetchPigGroupName();
  }, [pigGroupId, user.uid]);


 
  useFocusEffect(
    React.useCallback(() => {
      // Reset any necessary state or perform actions when the screen regains focus
      // For example, you can reset any modals or form state here
      setModalVisible(false); // Close any open modals
      setDetailModalVisible(false); // Close any open detail modals
      return () => {
        // Cleanup if necessary when losing focus
      };
    }, [])
  );


  // Fetch Pigs from the selected branch
  useEffect(() => {
    const fetchPigs = async () => {
      const pigsCollectionPath = selectedBranch === 'Main Farm'
        ? `users/${user.uid}/farmBranches/Main Farm/pigGroups/${pigGroupId}/pigs`
        : `users/${user.uid}/farmBranches/${selectedBranch}/pigGroups/${pigGroupId}/pigs`;
      
      const q = query(collection(firestore, pigsCollectionPath));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const pigsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPigs(pigsList);
      });

      return () => unsubscribe();
    };

    fetchPigs();
  }, [pigGroupId, user.uid, selectedBranch]);

  // Check for duplicates
  const checkForDuplicates = async () => {
    const pigCollectionPath = `users/${user.uid}/farmBranches/${selectedBranch}/pigGroups/${pigGroupId}/pigs`;
  
    const q = query(collection(firestore, pigCollectionPath));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.some(doc => {
      const data = doc.data();
      return (data.pigName === pigName || data.tagNumber === tagNumber) && (currentPigId === null || doc.id !== currentPigId);
    });
  };

  // Add Pig
  const handleAddPig = async () => {
    if (!pigName.trim() || !tagNumber.trim() || !gender || !race.trim()) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }
  
    const pigCollectionPath = `users/${user.uid}/farmBranches/${selectedBranch}/pigGroups/${pigGroupId}/pigs`;
    
    try {
      await addDoc(collection(firestore, pigCollectionPath), {
        pigName,
        tagNumber,
        gender,
        race,
        dateOfBirth,  // Save date of birth
        vitality,     // Save vitality
        createdAt: new Date(),
      });
  
      Alert.alert('Success', 'Pig added successfully!');
      
      // Clear the input fields
      resetFields(); 
      setModalVisible(false); // Close the modal
    } catch (error) {
      console.error('Error adding pig:', error);
      Alert.alert('Error', 'There was a problem adding the pig.');
    }
  };
  

  const resetFields = () => {
    setPigName('');
    setTagNumber('');
    setGender('male');
    setRace('');
    setDateOfBirth(new Date());
    setVitality('alive');
  };
  // Edit Pig
  const handleEditPig = async () => {
    if (!pigName.trim() || !tagNumber.trim() || !gender || !race.trim()) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }
    try {
      const pigCollectionPath = `users/${user.uid}/farmBranches/${selectedBranch}/pigGroups/${pigGroupId}/pigs/${currentPigId}`;
      await updateDoc(doc(firestore, pigCollectionPath), {
        pigName,
        tagNumber,
        gender,
        race,
        dateOfBirth,  // Update date of birth
        vitality,     // Update vitality
      });
      Alert.alert('Success', 'Pig updated successfully!');
      setIsEditing(false);
      resetFields();
      setModalVisible(false);
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
              const pigCollectionPath = `users/${user.uid}/farmBranches/${selectedBranch}/pigGroups/${pigGroupId}/pigs/${pigId}`;
              await deleteDoc(doc(firestore, pigCollectionPath));
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
          setVitality(item.vitality); // Set vitality when editing
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
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Pig' : 'Add Pig'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Pig Name"
              value={pigName}
              onChangeText={setPigName}
            />
            <TextInput
              style={styles.input}
              placeholder="Tag Number"
              value={tagNumber}
              onChangeText={setTagNumber}
            />
                       {/* Date of Birth Picker */}
            <TouchableOpacity onPress={handleOpenDatePicker}>
              <Text>Select Date of Birth</Text>
            </TouchableOpacity>

            <DateTimePickerModal
                 isVisible={openDatePicker}
                mode="date"
                date={dateOfBirth}
                onConfirm={(date) => {
                  setDateOfBirth(date);
                  setOpenDatePicker(false);
             }}
              onCancel={() => setOpenDatePicker(false)}
              />
        
            <Picker
              selectedValue={gender}
              onValueChange={setGender}
              style={styles.picker}
            >
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Race"
              value={race}
              onChangeText={setRace}
            />

            {/* Vitality Picker */}
            <Text>Vitality</Text>
            <Picker
              selectedValue={vitality}
              onValueChange={setVitality}
              enabled={isEditing || isVitalityEditable}  // Enable when editing
              style={styles.picker}
            >
              <Picker.Item label="Alive" value="alive" />
              <Picker.Item label="Deceased" value="deceased" />
            </Picker>
            <Button
              title={isEditing ? 'Update Pig' : 'Add Pig'}
              onPress={isEditing ? handleEditPig : handleAddPig}
              color="#4CAF50"
            />
            <Button
              title="Cancel"
              onPress={() => setModalVisible(false)}
              color="#f44336"
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
                <Text style={styles.modalTitle}>Pig Details</Text>
                <Text style={styles.detailText}>Name: {selectedPig.pigName}</Text>
                <Text style={styles.detailText}>Tag Number: {selectedPig.tagNumber}</Text>
                <Text style={styles.detailText}>Gender: {selectedPig.gender}</Text>
                <Text style={styles.detailText}>Race: {selectedPig.race}</Text>
                <Text style={styles.detailText}>Date of Birth: {selectedPig.dateOfBirth.toDate().toDateString()}</Text>
                <Text style={styles.detailText}>Vitality: {selectedPig.vitality}</Text>
       
          {/* View Medical Records Button */}
          <Button
  title="View Medical Records"
  onPress={() => {
    if (selectedPig) {
      navigation.navigate('MedicalRecordScreen', {
        userId: user.uid,
        selectedBranch: selectedBranch, // Pass the selected branch
        pigGroupId: pigGroupId,         // Pass the pig group ID
        pigName: selectedPig.pigName,   // Pass the pig name
        selectedPigId: selectedPig.id,   // Pass the selected pig ID
      });
    } else {
      Alert.alert('Error', 'Please select a pig before viewing medical records.');
    }
  }}
  color="#000000FF"
/>

              </>
            )}
            <Button
              title="Close"
              onPress={() => setDetailModalVisible(false)}
              color="#f44336"
            />
          </View>
        </View>
      </Modal>

    </View>
  );
}
