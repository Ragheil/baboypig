import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import { addDoc, collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../firebase/config2';

export default function AddPigInfoScreen({ route, navigation }) {
  const { pigGroupId } = route.params;

  const [pigName, setPigName] = useState('');
  const [tagNumber, setTagNumber] = useState('');
  const [gender, setGender] = useState('');
  const [race, setRace] = useState('');
  const [pigs, setPigs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPigId, setEditingPigId] = useState(null);

  useEffect(() => {
    const q = query(collection(firestore, 'pigGroups', pigGroupId, 'pigs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pigsData = [];
      snapshot.forEach((doc) => {
        pigsData.push({ id: doc.id, ...doc.data() });
      });
      setPigs(pigsData);
    });

    return () => unsubscribe();
  }, [pigGroupId]);

  const handleAddPigInfo = async () => {
    if (!pigName || !tagNumber || !gender || !race) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    try {
      if (isEditing && editingPigId) {
        await updateDoc(doc(firestore, 'pigGroups', pigGroupId, 'pigs', editingPigId), {
          pigName,
          tagNumber,
          gender,
          race,
        });
        Alert.alert('Success', 'Pig information updated successfully!');
        setIsEditing(false);
        setEditingPigId(null);
      } else {
        await addDoc(collection(firestore, 'pigGroups', pigGroupId, 'pigs'), {
          pigName,
          tagNumber,
          gender,
          race,
          createdAt: new Date(),
        });
        Alert.alert('Success', 'Pig information added successfully!');
      }

      setPigName('');
      setTagNumber('');
      setGender('');
      setRace('');
    } catch (error) {
      console.error('Error saving pig information:', error);
      Alert.alert('Error', 'There was a problem saving the pig information.');
    }
  };

  const handleEditPig = (pig) => {
    setPigName(pig.pigName);
    setTagNumber(pig.tagNumber);
    setGender(pig.gender);
    setRace(pig.race);
    setIsEditing(true);
    setEditingPigId(pig.id);
  };

  const handleDeletePig = async (pigId) => {
    try {
      await deleteDoc(doc(firestore, 'pigGroups', pigGroupId, 'pigs', pigId));
      Alert.alert('Success', 'Pig information deleted successfully!');
    } catch (error) {
      console.error('Error deleting pig information:', error);
      Alert.alert('Error', 'There was a problem deleting the pig information.');
    }
  };

  const renderPig = ({ item }) => (
    <View style={styles.pigBox}>
      <Text style={styles.pigText}>Name: {item.pigName}</Text>
      <Text style={styles.pigText}>Tag Number: {item.tagNumber}</Text>
      <Text style={styles.pigText}>Gender: {item.gender}</Text>
      <Text style={styles.pigText}>Race: {item.race}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEditPig(item)} style={styles.actionButton}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeletePig(item.id)} style={styles.actionButton}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isEditing ? 'Edit Pig Information' : 'Add Pig Information'}</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
      />
      <TextInput
        style={styles.input}
        placeholder="Race"
        value={race}
        onChangeText={setRace}
      />
      <Button title={isEditing ? 'Update Pig Info' : 'Add Pig Info'} onPress={handleAddPigInfo} />

      <Text style={styles.subTitle}>Pigs in this Group</Text>
      {pigs.length > 0 ? (
        <FlatList
          data={pigs}
          renderItem={renderPig}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <Text style={styles.noPigsText}>No pigs added yet.</Text>
      )}
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
  subTitle: {
    fontSize: 20,
    marginTop: 30,
    marginBottom: 10,
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
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    marginRight: 15,
  },
  editText: {
    color: 'blue',
    fontWeight: 'bold',
  },
  deleteText: {
    color: 'red',
    fontWeight: 'bold',
  },
  noPigsText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#aaa',
    marginTop: 20,
  },
});
