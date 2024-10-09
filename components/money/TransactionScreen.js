import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../firebase/config2'; // Adjust the path to your Firebase config

const TransactionScreen = ({ route }) => {
  const { selectedBranch, userId } = route.params;
  const navigation = useNavigation();

  const [transactions, setTransactions] = useState([]); // State for all transactions
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
        const recordData = { id: doc.id, ...doc.data(), type: 'in' }; // Add type for incoming
        incoming.push(recordData);
        incomeTotal += parseFloat(recordData.amount) || 0; // Calculate total income
      });

      // Fetch outgoing records
      const moneyOutPath = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyOutRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyOutRecords`;

      const moneyOutRecordsRef = collection(firestore, moneyOutPath);
      const outRecordsSnapshot = await getDocs(moneyOutRecordsRef);

      let outgoing = [];
      let expenseTotal = 0;
      outRecordsSnapshot.forEach((doc) => {
        const recordData = { id: doc.id, ...doc.data(), type: 'out' }; // Add type for outgoing
        outgoing.push(recordData);
        expenseTotal += parseFloat(recordData.amount) || 0; // Calculate total expense
      });

      // Combine incoming and outgoing records
      const combinedTransactions = [...incoming, ...outgoing];

      // Sort combined transactions by date (latest first)
      combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(combinedTransactions); // Update transactions state
      setTotalIncome(incomeTotal); // Update total income state
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

  // Function to calculate total balance
  const totalBalance = totalIncome - totalExpense;

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const dateKey = formatDate(transaction.date); // Use formatted date as key
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction); // Push transaction into the respective date array
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Transaction Screen</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Current Branch: {selectedBranch}</Text>
      {/*   <Text style={styles.infoText}>User ID: {userId}</Text>*/}
        <Text style={styles.subHeaderText}>Transactions</Text>

    <Text style={styles.totalBalanceText}>Total Balance: ₱{totalBalance.toFixed(2)}</Text>
    <Text style={styles.totalIncomeText}>Total Income: ₱{totalIncome.toFixed(2)}</Text>
    <Text style={styles.totalExpenseText}>Total Expense: ₱{totalExpense.toFixed(2)}</Text>
      </View>

      {/* ScrollView with RefreshControl for pull-to-refresh */}
      <ScrollView
        style={styles.transactionContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
       

        {Object.keys(groupedTransactions).length > 0 ? (
          Object.keys(groupedTransactions).map((date) => (
            <View key={date}>
              <Text style={styles.dateText}>{date}</Text>
              {groupedTransactions[date].map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <Text style={styles.transactionLabel}>
                    <Text style={styles.categoryText}>
                      {transaction.category || 'N/A'}: 
                    </Text>
                    <Text style={[styles.amountText, transaction.type === 'in' ? styles.income : styles.expense]}>
                      {` ${transaction.type === 'in' ? '+' : '-'} ₱${parseFloat(transaction.amount).toFixed(2)}`}
                    </Text>
                  </Text>
                  <Text style={styles.remarksText}>{transaction.remarks || 'No remarks provided.'}</Text>
                </View>
              ))}
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
    marginBottom: 15,
    marginTop: 60
  },
  infoContainer: {
    marginBottom: 6,
  },
  infoText: {
    fontSize: 25,
    marginVertical: 5,
    fontWeight: 'bold',
  },
  subHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  totalBalanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#007AFF', // Change color for visibility
  },
  totalIncomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#058119FF',
     // Change color for visibility
  },
  totalExpenseText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#FF3C00FF', // Change color for visibility
  },
  transactionContainer: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    marginTop: 20,
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
  transactionLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  amountText: {
    fontSize: 16,
  },
  income: {
    color: 'green', // Color for income
  },
  expense: {
    color: 'red', // Color for expense
  },
  remarksText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  backButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default TransactionScreen;
