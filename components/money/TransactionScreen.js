import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../firebase/config2'; // Adjust the path to your Firebase config
import RNHTMLtoPDF from 'react-native-html-to-pdf'; // Import the library
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

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

  // Function to generate PDF report
  const generatePDF = async () => {
    let htmlContent = `
      <h1>Transaction Report</h1>
      <h2>Branch: ${selectedBranch}</h2>
      <h3>Total Balance: ₱${totalBalance.toFixed(2)}</h3>
      <h3>Total Income: ₱${totalIncome.toFixed(2)}</h3>
      <h3>Total Expense: ₱${totalExpense.toFixed(2)}</h3>
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    // Populate the HTML table with transactions
    for (const date in groupedTransactions) {
      for (const transaction of groupedTransactions[date]) {
        htmlContent += `
          <tr>
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.category || 'N/A'}</td>
            <td>${transaction.type === 'in' ? '+' : '-'} ₱${parseFloat(transaction.amount).toFixed(2)}</td>
            <td>${transaction.remarks || 'No remarks provided.'}</td>
          </tr>
        `;
      }
    }
  
    htmlContent += `
        </tbody>
      </table>
    `;
  
    try {
      // Create the PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });
  
      // Share the PDF file
      await Sharing.shareAsync(uri);
      
      Alert.alert('Success', 'PDF generated and ready to share!');
  
    } catch (error) {
      console.error('Error creating or sharing PDF:', error);
      Alert.alert('Error', 'Could not create PDF file.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Transaction Screen</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Current Branch: {selectedBranch}</Text>
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
                  <Text style={styles.remarksText}>
                    Remarks: {transaction.remarks || 'No remarks provided.'}
                  </Text>
                </View>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.noTransactionsText}>No transactions available.</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
        <Text style={styles.pdfButtonText}>Generate PDF Report</Text>
      </TouchableOpacity>

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
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  totalBalanceText: {
    fontSize: 16,
    color: 'green',
  },
  totalIncomeText: {
    fontSize: 16,
    color: 'blue',
  },
  totalExpenseText: {
    fontSize: 16,
    color: 'red',
  },
  transactionContainer: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  transactionItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  transactionLabel: {
    fontSize: 16,
  },
  categoryText: {
    fontWeight: 'bold',
  },
  amountText: {
    fontSize: 16,
  },
  income: {
    color: 'green',
  },
  expense: {
    color: 'red',
  },
  remarksText: {
    fontSize: 14,
    color: 'gray',
  },
  noTransactionsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  pdfButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 10,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#6c757d',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransactionScreen;
