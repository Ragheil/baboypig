import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import { addDoc, collection, query, onSnapshot } from 'firebase/firestore';
import { firestore } from '../firebase/config2';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

export default function PigGroupsScreen() {
  const [pigGroupName, setPigGroupName] = useState('');
  const [pigGroups, setPigGroups] = useState([]);
  const navigation = useNavigation(); // Initialize navigation

  // Function to add a new pig group to Firestore
  const handleAddPigGroup = async () => {
    if (pigGroupName.trim() === '') {
      Alert.alert('Validation Error', 'Pig group name cannot be empty.');
      return;
    }

    try {
      await addDoc(collection(firestore, 'pigGroups'), {
        name: pigGroupName,
        createdAt: new Date(),
      });
      Alert.alert('Success', 'Pig group added successfully!');
      setPigGroupName(''); // Reset input after adding
    } catch (error) {
      console.error('Error adding pig group:', error);
      Alert.alert('Error', 'There was a problem adding the pig group.');
    }
  };

  // Fetch pig groups from Firestore
  useEffect(() => {
    const q = query(collection(firestore, 'pigGroups'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groups = [];
      snapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() });
      });
      setPigGroups(groups);
    });

    return () => unsubscribe();
  }, []);

  // Function to render each pig group item
  const renderPigGroup = ({ item }) => (
    <TouchableOpacity
      style={styles.pigGroupBox}
      onPress={() => navigation.navigate('AddPigInfo', { pigGroupId: item.id })} // Navigate to AddPigInfoScreen with pigGroupId
    >
      <Text style={styles.pigGroupText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Pig Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Pig Group Name"
        value={pigGroupName}
        onChangeText={setPigGroupName}
      />
      <Button title="Add Pig Group" onPress={handleAddPigGroup} />

      <FlatList
        data={pigGroups}
        renderItem={renderPigGroup}
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
  pigGroupBox: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
  },
  pigGroupText: {
    fontSize: 18,
  },
});
