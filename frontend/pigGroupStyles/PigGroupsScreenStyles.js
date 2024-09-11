// ContactScreenStyles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({

    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F5F5F5',
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        marginTop: 60
      },
      searchAndAddContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
      },
      searchInput: {
        flex: 1,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        marginLeft: 8,
      },
      grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
      },
      pigGroupItem: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        margin: 8,
        width: '45%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      pigGroupText: {
        fontSize: 18,
        fontWeight: 'bold',
      },
      pigCountText: {
        marginTop: 8,
        fontSize: 16,
      },
      boldText: {
        fontWeight: 'bold',
      },
      actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
      },
      icon: {
        width: 24,
        height: 24,
      },
      tableHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
      },
      modalContent: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
      },
      modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
      },
      input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        width: '100%',
        marginBottom: 16,
      },
      addButton: {
        width: '100%',
        marginBottom: 8,
      },
      saveButton: {
        width: '100%',
        marginBottom: 8,
        marginTop: 50
      },
      cancelButton: {
        width: '100%',
      },


});
