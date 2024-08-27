import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Alert, Linking } from 'react-native';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config2'; // Adjust the path as needed

const ContactScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [editContactId, setEditContactId] = useState(null); // Track which contact is being edited
  const user = auth.currentUser; // Get current user

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      if (!user) return;
      const userContactsCollection = collection(firestore, `users/${user.uid}/contacts`);
      const q = query(userContactsCollection, orderBy('name'));
      const querySnapshot = await getDocs(q);
      const contactsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setContacts(contactsList);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const addOrUpdateContact = async () => {
    if (!name || !address || !contactNumber) {
      Alert.alert('Validation Error', 'All fields are required!');
      return;
    }

    if (contactNumber.length !== 11) {
      Alert.alert('Validation Error', 'Contact number must be 11 digits long.');
      return;
    }

    try {
      if (!user) return;

      if (editContactId) {
        // Update existing contact
        await updateDoc(doc(firestore, `users/${user.uid}/contacts`, editContactId), {
          name,
          address,
          contactNumber,
        });
        setEditContactId(null); // Reset edit mode
      } else {
        // Add new contact
        await addDoc(collection(firestore, `users/${user.uid}/contacts`), {
          name,
          address,
          contactNumber,
        });
      }

      setName('');
      setAddress('');
      setContactNumber('');
      fetchContacts(); // Refresh the contact list
    } catch (error) {
      console.error('Error adding/updating contact:', error);
    }
  };

  const confirmDeleteContact = (contactId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteContact(contactId) },
      ],
      { cancelable: false }
    );
  };

  const deleteContact = async (contactId) => {
    try {
      if (!user) return;
      await deleteDoc(doc(firestore, `users/${user.uid}/contacts`, contactId));
      fetchContacts(); // Refresh the contact list
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handlePhoneCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const startEditContact = (contact) => {
    setName(contact.name);
    setAddress(contact.address);
    setContactNumber(contact.contactNumber);
    setEditContactId(contact.id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{editContactId ? 'Edit Contact' : 'Add New Contact'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        value={contactNumber}
        onChangeText={setContactNumber}
        keyboardType="phone-pad"
        maxLength={11} // Limit input length to 11 digits
      />
      <Button title={editContactId ? "Update Contact" : "Add Contact"} onPress={addOrUpdateContact} color="#4CAF50" />

      <Text style={styles.tableHeader}>Contacts</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <Text style={styles.contactText}>Name: {item.name}</Text>
            <Text style={styles.contactText}>Address: {item.address}</Text>
            <Text style={styles.contactText}>Contact Number: {item.contactNumber}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handlePhoneCall(item.contactNumber)}>
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => startEditContact(item)}>
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDeleteContact(item.id)}>
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  tableHeader: {
    fontSize: 20,
    marginVertical: 16,
  },
  contactItem: {
    padding: 16,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  contactText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionText: {
    color: '#007BFF',
  },
});

export default ContactScreen;
