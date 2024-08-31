import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList } from 'react-native';
import { addDoc, collection, query, onSnapshot, doc, updateDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase/config2';
import { Picker } from '@react-native-picker/picker';

export default function AddPigInfoScreen({ route, navigation }) {
  const { pigGroupId } = route.params;
  const [pigName, setPigName] = useState('');
  const [tagNumber, setTagNumber] = useState('');
  const [gender, setGender] = useState('male');
  const [race, setRace] = useState('');
  const [pigs, setPigs] = useState([]);
  const [currentPigId, setCurrentPigId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pigGroupName, setPigGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPigGroupName = async () => {
      const docRef = doc(firestore, 'pigGroups', pigGroupId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPigGroupName(docSnap.data().name);
      } else {
        console.log('No such document!');
      }
    };

    fetchPigGroupName();
  }, [pigGroupId]);

  useEffect(() => {
    const fetchPigs = async () => {
      const q = query(collection(firestore, 'pigGroups', pigGroupId, 'pigs'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const pigsList = [];
        snapshot.forEach((doc) => {
          pigsList.push({ id: doc.id, ...doc.data() });
        });
        setPigs(pigsList);
      });

      return () => unsubscribe();
    };

    fetchPigs();
  }, [pigGroupId]);

  const checkForDuplicates = async () => {
    const q = query(collection(firestore, 'pigGroups', pigGroupId, 'pigs'));

    try {
      const querySnapshot = await getDocs(q);
      let exists = false;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if ((data.pigName === pigName || data.tagNumber === tagNumber) && (currentPigId === null || doc.id !== currentPigId)) {
          exists = true;
        }
      });

      return exists;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  };

  const handleAddPig = async () => {
    if (pigName.trim() === '' || tagNumber.trim() === '' || !gender || race.trim() === '') {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    const hasDuplicates = await checkForDuplicates();

    if (hasDuplicates) {
      Alert.alert('Duplicate Error', 'Pig Name or Tag Number already exists.');
      return;
    }

    try {
      await addDoc(collection(firestore, 'pigGroups', pigGroupId, 'pigs'), {
        pigName,
        tagNumber,
        gender,
        race,
        createdAt: new Date(),
      });
      Alert.alert('Success', 'Pig added successfully!');
      setPigName('');
      setTagNumber('');
      setGender('male');
      setRace('');
    } catch (error) {
      console.error('Error adding pig:', error);
      Alert.alert('Error', 'There was a problem adding the pig.');
    }
  };

  const handleEditPig = async () => {
    if (pigName.trim() === '' || tagNumber.trim() === '' || !gender || race.trim() === '') {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    const hasDuplicates = await checkForDuplicates();

    if (hasDuplicates) {
      Alert.alert('Duplicate Error', 'Pig Name or Tag Number already exists.');
      return;
    }

    try {
      await updateDoc(doc(firestore, 'pigGroups', pigGroupId, 'pigs', currentPigId), {
        pigName,
        tagNumber,
        gender,
        race,
      });
      Alert.alert('Success', 'Pig updated successfully!');
      setIsEditing(false);
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

  const handleDeletePig = (pigId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this pig?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, 'pigGroups', pigGroupId, 'pigs', pigId));
              Alert.alert('Success', 'Pig deleted successfully!');
            } catch (error) {
              console.error('Error deleting pig:', error);
              Alert.alert('Error', 'There was a problem deleting the pig.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const filteredPigs = pigs.filter(pig =>
    pig.pigName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        }} />
        <Button title="Delete" color="red" onPress={() => handleDeletePig(item.id)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pig Informations</Text>
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
      <Picker
        selectedValue={gender}
        style={styles.picker}
        onValueChange={(itemValue) => setGender(itemValue)}
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
      <Button
        title={isEditing ? "Update Pig" : "Add Pig"}
        onPress={isEditing ? handleEditPig : handleAddPig}
      />
      <Text style={styles.title}>Pig Group: {pigGroupName}</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search pigs"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredPigs}
        renderItem={renderPig}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
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
    marginTop: 20,
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
  picker: {
    width: '100%',
    height: 50,
    marginBottom: 20,
  },
  searchInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  list: {
    marginTop: 20,
  },
  pigBox: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
  },
  pigText: {
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
