import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, Modal } from 'react-native';
import { addDoc, collection, query, onSnapshot, doc, getDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config2'; // Adjust the path as needed
import { Picker } from '@react-native-picker/picker';

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
          console.log('Snapshot received:', snapshot); // Debugging
          if (snapshot.empty) {
            console.log('No pigs found.');
            setPigs([]); // Set state to empty if no pigs found
          } else {
            const pigsList = snapshot.docs.map(doc => {
              const data = doc.data();
              console.log('Pig data:', data); // Debug individual pig data
              return { id: doc.id, ...data };
            });
            console.log('Pigs fetched:', pigsList); // Should log all fetched pigs
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
      Alert.alert('Duplicate Error', 'Pig Name or Tag Number already exists.');
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
      console.log('Pig added with ID:', docRef.id); // Confirm addition
      Alert.alert('Success', 'Pig added successfully!');
      setModalVisible(false); // Close modal
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
      console.log('Pig updated with ID:', currentPigId); // Confirm update
      Alert.alert('Success', 'Pig updated successfully!');
      setIsEditing(false);
      setModalVisible(false); // Close modal
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
              console.log('Pig deleted with ID:', pigId); // Confirm deletion
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
    <View style={styles.pigBox}>
      <Text style={styles.pigText}>{item.pigName}</Text>
      <Text style={styles.pigText}>Tag Number: {item.tagNumber}</Text>
      <Text style={styles.pigText}>Gender: {item.gender}</Text>
      <Text style={styles.pigText}>Race: {item.race}</Text>
      <View style={styles.actionsContainer}>
        <Button title="Edit" onPress={() => {
          setPigName(item.pigName);
          setTagNumber(item.tagNumber);
          setGender(item.gender);
          setRace(item.race);
          setCurrentPigId(item.id);
          setIsEditing(true);
          setModalVisible(true);
        }} />
        <Button title="Delete" color="red" onPress={() => handleDeletePig(item.id)} />
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
          style={styles.addButton}
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
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Pig' : 'Add Pig'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Pig Name"
              value={pigName}
              onChangeText={setPigName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Tag Number"
              value={tagNumber}
              onChangeText={setTagNumber}
              keyboardType="numeric"
            />
            <Picker
              selectedValue={gender}
              style={styles.picker}
              onValueChange={(itemValue) => setGender(itemValue)}
            >
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
            <TextInput
              style={styles.modalInput}
              placeholder="Race"
              value={race}
              onChangeText={setRace}
            />
            <View style={styles.modalButtons}>
              <Button
                title={isEditing ? 'Save Changes' : 'Add Pig'}
                onPress={isEditing ? handleEditPig : handleAddPig}
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setModalVisible(false);
                  setPigName('');
                  setTagNumber('');
                  setGender('male');
                  setRace('');
                  setIsEditing(false);
                  setCurrentPigId(null);
                }}
                color="gray"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 60,
  },
  groupName: {
    fontSize: 18,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  addButton: {
    marginRight: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  pigBox: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pigText: {
    fontSize: 16,
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  picker: {
    height: 40,
    width: '100%',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
