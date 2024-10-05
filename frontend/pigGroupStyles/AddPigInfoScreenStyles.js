// ContactScreenStyles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 60,
    
      },
      groupName: {
        fontSize: 18,
        marginBottom: 20,
        fontWeight: 'bold',
      },
      searchContainer: {
        marginBottom: 20,
      },
      searchInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
      },
      addButton: {
        marginBottom: 10,
      },
      list: {
        flex: 1,
      },
      listContent: {
        paddingBottom: 20,
      },
      pigContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
      },
      pigInfo: {
        flex: 1,
      },
      pigText: {
        fontSize: 16,
        marginBottom: 5,
      },
      actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      icon: {
        width: 24,
        height: 24,
        marginHorizontal: 5,
      },
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      },
      modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
      },
      input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
      },
      picker: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginBottom: 15,
      },
      label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
      },
      pregnancyButton: {
        backgroundColor: '#FFA500', // Orange color for pregnancy records button
        padding: 10,
        borderRadius: 5,
        marginVertical: 10,
        alignItems: 'center',
      },
      
      buttonText: {
        color: '#fff',
        fontWeight: 'bold',
      },      

});
