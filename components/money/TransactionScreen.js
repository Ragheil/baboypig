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
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'; // Import date picker

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
  const [totalBalance, setTotalBalance] = useState(0); // Added state for total balance
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [filteredTransactions, setFilteredTransactions] = useState([]);

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
      inRecordsSnapshot.forEach((doc) => {
        const recordData = { id: doc.id, ...doc.data(), type: 'in' };
        incoming.push(recordData);
      });
  
      const moneyOutPath = selectedBranch === 'Main Farm'
        ? `users/${userId}/farmBranches/Main Farm/moneyOutRecords`
        : `users/${userId}/farmBranches/${selectedBranch}/moneyOutRecords`;
  
      const moneyOutRecordsRef = collection(firestore, moneyOutPath);
      const outRecordsSnapshot = await getDocs(moneyOutRecordsRef);
  
      let outgoing = [];
      outRecordsSnapshot.forEach((doc) => {
        const recordData = { id: doc.id, ...doc.data(), type: 'out' };
        outgoing.push(recordData);
      });
  
      const combinedTransactions = [...incoming, ...outgoing];
  
      // Sort transactions by date (newest first)
      combinedTransactions.sort((a, b) => {
        const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      });
  
      setTransactions(combinedTransactions);
      setFilteredTransactions(combinedTransactions); // Set initial filtered transactions
      calculateTotals(combinedTransactions); // Calculate initial totals
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

  const calculateTotals = (transactions) => {
    let incomeTotal = 0;
    let expenseTotal = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === 'in') {
        incomeTotal += parseFloat(transaction.amount) || 0;
      } else {
        expenseTotal += parseFloat(transaction.amount) || 0;
      }
    });

    setTotalIncome(incomeTotal);
    setTotalExpense(expenseTotal);
    setTotalBalance(incomeTotal - expenseTotal); // Update balance based on new totals
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filterTransactionsByDate = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    const filtered = transactions
      .filter((transaction) => {
        // Check if the transaction.date is a Firebase Timestamp, and convert it
        const transactionDate = transaction.date.toDate ? transaction.date.toDate() : new Date(transaction.date);
  
        console.log("Transaction Date:", transaction.date, "Parsed Date:", transactionDate);
  
        return transactionDate >= start && transactionDate <= end;
      })
      .sort((a, b) => {
        const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA; // Newest first
      });
  
    setFilteredTransactions(filtered);
    calculateTotals(filtered);
  };

  const groupByDate = (transactions) => {
    return transactions.reduce((grouped, transaction) => {
      const date = transaction.date.toDateString(); // Convert to readable date
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
      return grouped;
    }, {});
  };

  const openDatePicker = (type) => {
    DateTimePickerAndroid.open({
      value: type === 'start' ? startDate : endDate,
      onChange: (event, selectedDate) => {
        if (selectedDate) {
          if (type === 'start') {
            setStartDate(selectedDate);
          } else {
            setEndDate(selectedDate);
          }
          filterTransactionsByDate();
        }
      },
      mode: 'date',
      is24Hour: true,
    });
  };

  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const dateKey = formatDate(transaction.date);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {});

  const generatePDF = async () => {
    // Helper function to format the date
    const formatDate = (date) => {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return 'Invalid Date'; // Handle invalid dates
      }
      return d.toLocaleDateString(); // Format the date
    };
  
    // Format the date range
    const formatDateRange = (start, end) => {
      if (start === end) {
        return `As of ${formatDate(end)}`;
      }
      return `${formatDate(start)} - ${formatDate(end)}`;
    };
  
    // Define your date range (make sure startDate and endDate are properly defined)
    const startDate = '2024-10-01'; // Replace with your actual start date
    const endDate = '2024-10-11'; // Replace with your actual end date
    const dateRange = formatDateRange(startDate, endDate);
  
    // Start building the HTML content for the PDF
    let htmlContent = `
      <div style="margin: 20px;">
        <h1 style="text-align: center;">PigEx Transaction Report</h1>
        <h3 style="text-align: left;">As of: ${dateRange}</h3>
        <h2 style="text-align: left;">Branch Name: ${selectedBranch}</h2>
        <h3 style="text-align: left;">Total Balance: ₱${totalBalance.toFixed(2)}</h3>
        <h3 style="text-align: left;">Total Income: ₱${totalIncome.toFixed(2)}</h3>
        <h3 style="text-align: left;">Total Expense: ₱${totalExpense.toFixed(2)}</h3>
        <table border="1" width="100%" style="border-collapse: collapse; table-layout: fixed;">
          <thead>
            <tr>
              <th style="width: 15%; text-align: center;">Date</th>
              <th style="width: 30%; text-align: center;">Description</th>
              <th style="width: 10%; text-align: center;">Type</th>
              <th style="width: 25%; text-align: center;">Amount</th>
              <th style="width: 20%; text-align: center;">Remarks</th>
            </tr>
          </thead>
          <tbody>
    `;
  
    // Loop through grouped transactions by date
    for (const date in groupedTransactions) {
      // Use the date from the first transaction in the group for the header
      const firstTransactionDate = groupedTransactions[date][0].date; // Get the date of the first transaction
      const formattedHeaderDate = formatDate(firstTransactionDate); // Format that date for display
  
      // Add the date header for each group of transactions
      htmlContent += `
        <tr>
          <td colspan="5" style="font-weight: bold; text-align: center; padding: 10px; background-color: #D7FBC0FF;">
            ${formattedHeaderDate}
          </td>
        </tr>
      `;
  
      // Loop through transactions for the current date
      for (const transaction of groupedTransactions[date]) {
        // Log the original date for debugging
        console.log(`Processing transaction date: ${transaction.date}`);
  
        // Attempt to create a Date object
        const transactionDate = new Date(transaction.date);
        if (isNaN(transactionDate.getTime())) {
          console.error(`Invalid date found: ${transaction.date}`);
          continue; // Skip this transaction if the date is invalid
        }
  
        const amountColor = transaction.type === 'in' ? 'green' : 'red';
        const amountSign = transaction.type === 'in' ? '+' : '-';
        const formattedAmount = `${amountSign} ₱${parseFloat(transaction.amount).toFixed(2)}`;
  
        htmlContent += `
          <tr>
            <td style="padding: 8px; text-align: center;">${formatDate(transaction.date)}</td>
            <td style="padding: 8px; text-align: center;">${transaction.category || 'N/A'}</td>
            <td style="padding: 8px; text-align: center;">${transaction.type}</td>
            <td style="color: ${amountColor}; text-align: center; padding: 8px;">${formattedAmount}</td>
            <td style="padding: 8px; text-align: center;">${transaction.remarks || 'No remarks provided.'}</td>
          </tr>
        `;
      }
    }
  
    htmlContent += `
          </tbody>
        </table>
        <div style="margin-top: 30px; text-align: center;">
          <p>End of Report</p>
        </div>
      </div>
      `;
  
    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });
  
      const downloadsDir = FileSystem.documentDirectory + 'downloads/';
      const fileName = 'PigEx Transaction Report.pdf';
      const fileUri = downloadsDir + fileName;
  
      await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });
  
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
      <Text style={TransactionScreenStyles.headerText}> Transaction </Text>
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

      <View>
        <TouchableOpacity onPress={() => openDatePicker('start')}>
          <Text>Select Start Date: {startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openDatePicker('end')}>
          <Text>Select End Date: {endDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTransactions.length > 0 ? (
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
