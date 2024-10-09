import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../firebase/config2'; // Adjust the path to your Firebase config
import RNHTMLtoPDF from 'react-native-html-to-pdf'; // Import the library
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import TransactionScreenStyles from '../../frontend/money/TransactionScreenStyles'; // Adjust the path as necessary

const TransactionScreen = ({ route }) => {
  const { selectedBranch, userId } = route.params;
  const navigation = useNavigation();

  const [transactions, setTransactions] = useState([]);
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    farmName: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const unsubscribeUser = fetchUserDetails();
    fetchTransactionRecords();

    return () => {
      if (typeof unsubscribeUser === 'function') {
        unsubscribeUser();
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
      const moneyInPath = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyInRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyInRecords`;

      const moneyInRecordsRef = collection(firestore, moneyInPath);
      const inRecordsSnapshot = await getDocs(moneyInRecordsRef);

      let incoming = [];
      let incomeTotal = 0;
      inRecordsSnapshot.forEach((doc) => {
        const recordData = { id: doc.id, ...doc.data(), type: 'in' };
        incoming.push(recordData);
        incomeTotal += parseFloat(recordData.amount) || 0;
      });

      const moneyOutPath = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyOutRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyOutRecords`;

      const moneyOutRecordsRef = collection(firestore, moneyOutPath);
      const outRecordsSnapshot = await getDocs(moneyOutRecordsRef);

      let outgoing = [];
      let expenseTotal = 0;
      outRecordsSnapshot.forEach((doc) => {
        const recordData = { id: doc.id, ...doc.data(), type: 'out' };
        outgoing.push(recordData);
        expenseTotal += parseFloat(recordData.amount) || 0;
      });

      const combinedTransactions = [...incoming, ...outgoing];
      combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(combinedTransactions);
      setTotalIncome(incomeTotal);
      setTotalExpense(expenseTotal);
    } catch (error) {
      console.error('Error fetching transaction records:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactionRecords();
    setRefreshing(false);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const totalBalance = totalIncome - totalExpense;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const dateKey = formatDate(transaction.date);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {});

  const generatePDF = async () => {
    let htmlContent = `
      <h1>Transaction Report</h1>
      <h2> Current Branch: ${selectedBranch}</h2>
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
  
      // Define the destination path in the Downloads folder
      const downloadsDir = FileSystem.documentDirectory + 'downloads/';
      const fileName = 'PigEx Transaction Report.pdf';
      const fileUri = downloadsDir + fileName;
  
      // Ensure the downloads directory exists
      await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
  
      // Move the PDF to the Downloads folder
      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });
  
      // Share the PDF file
      await Sharing.shareAsync(fileUri, {
        dialogTitle: 'Share PigEx Transaction Report',
      });
  
      Alert.alert('Success', 'PDF generated and ready to share!');
  
    } catch (error) {
      console.error('Error creating or sharing PDF:', error);
      Alert.alert('Error', 'Could not create PDF file.');
    }
  };
  return (
    <View style={TransactionScreenStyles.container}>
      <Text style={TransactionScreenStyles.headerText}> Transaction  </Text>
      <View style={TransactionScreenStyles.infoContainer}>
        <Text style={TransactionScreenStyles.infoText}>
          Farm Name: {selectedBranch}
        </Text>
        <Text style={TransactionScreenStyles.subHeaderText}>
          Total Balance: <Text style={TransactionScreenStyles.totalBalanceText}>₱{totalBalance.toFixed(2)}</Text>
        </Text>
        <Text style={TransactionScreenStyles.subHeaderText}>
          Total Income: <Text style={TransactionScreenStyles.totalIncomeText}>₱{totalIncome.toFixed(2)}</Text>
        </Text>
        <Text style={TransactionScreenStyles.subHeaderText}>
          Total Expense: <Text style={TransactionScreenStyles.totalExpenseText}>₱{totalExpense.toFixed(2)}</Text>
        </Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {transactions.length > 0 ? (
          Object.entries(groupedTransactions).map(([date, transactions]) => (
            <View key={date} style={TransactionScreenStyles.transactionContainer}>
              <Text style={TransactionScreenStyles.dateText}>{date}</Text>
              {transactions.map((transaction) => (
                <View key={transaction.id} style={TransactionScreenStyles.transactionItem}>
                  <Text style={TransactionScreenStyles.transactionLabel}>
                    <Text style={TransactionScreenStyles.categoryText}>{transaction.category || 'N/A'}</Text>: 
                    <Text style={transaction.type === 'in' ? TransactionScreenStyles.income : TransactionScreenStyles.expense}>
                      ₱{parseFloat(transaction.amount).toFixed(2)}
                    </Text>
                  </Text>
                  <Text style={TransactionScreenStyles.remarksText}>
                    Remarks: {transaction.remarks || 'No remarks provided.'}
                  </Text>
                </View>
              ))}
            </View>
          ))
        ) : (
          <Text style={TransactionScreenStyles.noTransactionsText}>No transactions found.</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={TransactionScreenStyles.pdfButton} onPress={generatePDF}>
        <Text style={TransactionScreenStyles.pdfButtonText}>Generate PDF</Text>
      </TouchableOpacity>
      <TouchableOpacity style={TransactionScreenStyles.backButton} onPress={handleGoBack}>
        <Text style={TransactionScreenStyles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TransactionScreen;
