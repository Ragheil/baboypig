import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../firebase/config2'; // Adjust the path to your Firebase config

const TransactionScreen = ({ route }) => {
  const { selectedBranch, userId } = route.params;
  const navigation = useNavigation();

  const [moneyInRecords, setMoneyInRecords] = useState([]); // State for incoming transactions
  const [moneyOutRecords, setMoneyOutRecords] = useState([]); // State for outgoing transactions
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    farmName: '',
  });
  const [refreshing, setRefreshing] = useState(false); // State for refresh control
  const [totalIncome, setTotalIncome] = useState(0); // State for total income
  const [totalExpense, setTotalExpense] = useState(0); // State for total expense

  useEffect(() => {
    const unsubscribeUser = fetchUserDetails(); // Call fetchUserDetails and store the unsubscribe function
    fetchTransactionRecords(); // Fetch records on mount

    // Cleanup the listeners when the component unmounts
    return () => {
      if (typeof unsubscribeUser === 'function') {
        unsubscribeUser(); // Only call if it's a function
      }
    };
  }, [userId, selectedBranch]);

  const fetchUserDetails = async () => {
    const userRef = doc(firestore, `users/${userId}`);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserDetails({
          firstName: data.firstName || 'N/A',
          lastName: data.lastName || 'N/A',
          farmName: data.farmName || 'N/A',
        });
      }
    });
  };

  const fetchTransactionRecords = async () => {
    try {
      // Fetch incoming records
      const moneyInPath = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyInRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyInRecords`;

      const moneyInRecordsRef = collection(firestore, moneyInPath);
      const inRecordsSnapshot = await getDocs(moneyInRecordsRef);

      let incoming = [];
      let incomeTotal = 0;
      inRecordsSnapshot.forEach((doc) => {
        const recordData = { id: doc.id, ...doc.data() };
        incoming.push(recordData);
        incomeTotal += parseFloat(recordData.amount) || 0; // Calculate total income
      });
      setMoneyInRecords(incoming);
      setTotalIncome(incomeTotal); // Update total income state

      // Fetch outgoing records
      const moneyOutPath = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyOutRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyOutRecords`;

      const moneyOutRecordsRef = collection(firestore, moneyOutPath);
      const outRecordsSnapshot = await getDocs(moneyOutRecordsRef);

      let outgoing = [];
      let expenseTotal = 0;
      outRecordsSnapshot.forEach((doc) => {
        const recordData = { id: doc.id, ...doc.data() };
        outgoing.push(recordData);
        expenseTotal += parseFloat(recordData.amount) || 0; // Calculate total expense
      });
      setMoneyOutRecords(outgoing);
      setTotalExpense(expenseTotal); // Update total expense state
    } catch (error) {
      console.error('Error fetching transaction records:', error);
    }
  };

  // Function to handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactionRecords(); // Fetch records again
    setRefreshing(false); // Stop refreshing
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Calculate total balance
  const totalBalance = totalIncome - totalExpense;

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Transaction Screen</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Selected Branch: {selectedBranch}</Text>
        <Text style={styles.infoText}>User ID: {userId}</Text>
        <Text style={styles.totalText}>Total Balance: ${totalBalance.toFixed(2)}</Text>

      </View>

      {/* ScrollView with RefreshControl for pull-to-refresh */}
      <ScrollView
        style={styles.transactionContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.subHeaderText}>Money In Records</Text>
        <Text style={styles.totalText}>Total Income: ${totalIncome.toFixed(2)}</Text>
        
        {/*  <Text style={styles.totalText}>Total Balance: ${totalBalance.toFixed(2)}</Text> */}
       

        {moneyInRecords.length > 0 ? (
          moneyInRecords.map((transaction, index) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <Text style={styles.infoText}>
                {`Transaction ${index + 1}: Income - $${parseFloat(transaction.amount).toFixed(2)}`}
              </Text>
            </View>
          ))
        ) : (
          <Text>No incoming transactions available.</Text>
        )}

        <Text style={styles.subHeaderText}>Money Out Records</Text>
        <Text style={styles.totalText}>Total Expense: ${totalExpense.toFixed(2)}</Text>
        
        {/*  <Text style={styles.totalText}>Total Balance: ${totalBalance.toFixed(2)}</Text>*/}
       

        {moneyOutRecords.length > 0 ? (
          moneyOutRecords.map((transaction, index) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <Text style={styles.infoText}>
                {`Transaction ${index + 1}: Expense - $${parseFloat(transaction.amount).toFixed(2)}`}
              </Text>
            </View>
          ))
        ) : (
          <Text>No outgoing transactions available.</Text>
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
  subHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#007AFF', // Change color for visibility
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
