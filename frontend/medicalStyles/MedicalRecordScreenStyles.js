import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7', // Light background color for contrast
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // Darker text for better readability
    textAlign: 'center', // Center align title
  },
  recordItem: {
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10, // Rounded corners
    backgroundColor: '#fff', // White background for each record
    shadowColor: '#000', // Adding shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2, // For Android shadow
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff', // White background for modal
    borderRadius: 10, // Rounded corners for modal
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    marginBottom: 20,
    color: '#4CAF50', // Green color for title
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#4CAF50', // Green border for inputs
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f1f1f1', // Light gray background for inputs
  },
  button: {
    backgroundColor: '#4CAF50', // Green button background
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff', // White text for buttons
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'red', // Red background for delete button
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginVertical: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default styles;
