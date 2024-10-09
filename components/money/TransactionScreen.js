import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { firestore } from '../../firebase/config2'; // Adjust the path to your Firebase config

const TransactionScreen = ({ route }) => {
  const { selectedBranch, userId } = route.params;
  const navigation = useNavigation();

  const [transactions, setTransactions] = useState([]);
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    farmName: '',
  });
  const [refreshing, setRefreshing] = useState(false); // State for refresh control

  useEffect(() => {
    // Fetch user details
    const userRef = doc(firestore, `users/${userId}`);
    const unsubscribeUser = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        console.log("Fetched user data:", data); // Log the fetched user data
        setUserDetails({
          firstName: data.firstName || 'N/A', // Default to 'N/A' if field is missing
          lastName: data.lastName || 'N/A',
          farmName: data.farmName || 'N/A',
        });
      } else {
        console.log("No such user document!"); // Log if the document does not exist
      }
    });

    // Reference to the 'transactions' collection for this user
    const transactionRef = collection(firestore, `users/${userId}/transactions`);
    const unsubscribeTransactions = onSnapshot(transactionRef, (querySnapshot) => {
      const transactionsArray = [];
      querySnapshot.forEach((doc) => {
        transactionsArray.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(transactionsArray);
    });

    // Cleanup the listeners when the component unmounts
    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
    };
  }, [userId]);

  // Function to handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    // Refetch transactions
    const transactionRef = collection(firestore, `users/${userId}/transactions`);
    onSnapshot(transactionRef, (querySnapshot) => {
      const transactionsArray = [];
      querySnapshot.forEach((doc) => {
        transactionsArray.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(transactionsArray);
      setRefreshing(false); // Stop refreshing
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Transaction Screen</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>First Name: {userDetails.firstName}</Text>
        <Text style={styles.infoText}>Last Name: {userDetails.lastName}</Text>
    {/*    <Text style={styles.infoText}>Farm Name: {userDetails.farmName}</Text>*/}
        <Text style={styles.infoText}>Selected Branch: {selectedBranch}</Text>
        <Text style={styles.infoText}>User ID: {userId}</Text>
      </View>

      {/* ScrollView with RefreshControl for pull-to-refresh */}
      <ScrollView
        style={styles.transactionContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <Text style={styles.infoText}>
                {`Transaction ${index + 1}: ${JSON.stringify(transaction)}`}
              </Text>
            </View>
          ))
        ) : (
          <Text>No transactions available.</Text>
        )}
      </ScrollView>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 30,
  },
  infoText: {
    fontSize: 18,
    marginVertical: 5,
  },
  transactionContainer: {
    marginBottom: 20,
  },
  transactionItem: {
    padding: 10,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TransactionScreen;
