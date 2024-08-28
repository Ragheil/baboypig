import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Alert, Linking, Modal } from 'react-native';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config2'; // Adjust the path as needed

const ContactScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [editContactId, setEditContactId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    // Filter contacts based on search query
    const results = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.contactNumber.includes(searchQuery)
    );
    setFilteredContacts(results);
  }, [searchQuery, contacts]);

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
      setModalVisible(false); // Close the modal after saving
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
    setModalVisible(true); // Open the modal for editing
  };

  const openAddContactModal = () => {
    setName('');
    setAddress('');
    setContactNumber('');
    setEditContactId(null);
    setModalVisible(true); // Open the modal for adding
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or number"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <Button title="Add Contact" onPress={openAddContactModal} color="#4CAF50" />

      <Text style={styles.tableHeader}>Contacts</Text>
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <Text style={styles.contactText}>Name: {item.name}</Text>
            <Text style={styles.contactText}>Address: {item.address}</Text>
            <Text style={styles.contactText}>Contact Number: {item.contactNumber}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handlePhoneCall(item.contactNumber)}>
                <Text style={styles.actionText}>Contact</Text>
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
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
            <View style={styles.buttonContainer}>
              <Button title="Save" onPress={addOrUpdateContact} color="#4CAF50" />
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
  searchInput: {
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default ContactScreen;
