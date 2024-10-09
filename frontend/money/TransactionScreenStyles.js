import { StyleSheet } from 'react-native';

const TransactionScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 60,
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

export default TransactionScreenStyles;
