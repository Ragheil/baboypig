import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore'; // Assuming Firestore is used for data storage

const PregnancyRecordsScreen = ({ route }) => {
  const { pigId, pigName } = route.params; // Retrieve pigId and pigName from the navigation params
  const [pregnancyRecords, setPregnancyRecords] = useState([]);

  useEffect(() => {
    // Fetch pregnancy records for this specific pig from Firestore
    const fetchPregnancyRecords = async () => {
      try {
        const recordsSnapshot = await firestore()
          .collection('pigs')
          .doc(pigId)
          .collection('pregnancyRecords')
          .get();

        const records = recordsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPregnancyRecords(records);
      } catch (error) {
        console.error('Error fetching pregnancy records: ', error);
      }
    };

    fetchPregnancyRecords();
  }, [pigId]);

  // Render each pregnancy record
  const renderRecordItem = ({ item }) => (
    <View style={styles.recordItem}>
      <Text style={styles.recordText}>Date: {new Date(item.date.seconds * 1000).toDateString()}</Text>
      <Text style={styles.recordText}>Status: {item.status}</Text>
      <Text style={styles.recordText}>Notes: {item.notes}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pregnancy Records for {pigName}</Text>
      {pregnancyRecords.length > 0 ? (
        <FlatList
          data={pregnancyRecords}
          renderItem={renderRecordItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.noRecordsText}>No pregnancy records found for {pigName}.</Text>
      )}
    </View>
  );
};

export default PregnancyRecordsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  recordItem: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  recordText: {
    fontSize: 16,
  },
  noRecordsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
