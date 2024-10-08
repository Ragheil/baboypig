import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function FooterScreen({ firstName, lastName, farmName, selectedBranch, toggleSidebar, userId }) { // Added userId as prop
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const closeModal = () => {
    console.log("Closing modal");
    setModalVisible(false);
  };

  const handleMoneyIn = () => {
    console.log(`Navigating to MoneyInScreen with farmName: ${farmName}, selectedBranch: ${selectedBranch}, userId: ${userId}`);
    
    // Ensure farmName and selectedBranch are defined
    if (!farmName || !selectedBranch) {
      console.error('Error: farmName or selectedBranch is undefined.');
      Alert.alert('Error', 'Farm Name or Selected Branch is not set.');
      return;
    }
  
    navigation.navigate('MoneyInScreen', {
      farmName: farmName,
      selectedBranch: selectedBranch,
      userId: userId,
    });
  };
  
  

  const handleMoneyOut = () => {
    console.log(`Current branch: ${farmName}`); // Log current branch when Money Out is pressed
    console.log('Money Out pressed');
    navigation.navigate('MoneyOutScreen', { farmName, selectedBranch, userId }); // Pass selectedBranch and userId
  };
  

  return (
    <View>
      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Home')}>
          <Image source={require('../../assets/images/navigation/home.png')} style={styles.footerImage} />
          <Text style={styles.footerText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Transaction')}>
          <Image source={require('../../assets/images/navigation/transaction.png')} style={styles.footerImage} />
          <Text style={styles.footerText}>Transaction</Text>
        </TouchableOpacity>

        {/* Plus button to open modal */}
        <TouchableOpacity style={styles.footerItem} onPress={toggleModal}>
          <Image source={require('../../assets/images/navigation/plus.png')} style={styles.footerImage} />
          <Text style={styles.footerText}>Plus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => navigation.navigate('ContactScreen', { firstName, lastName, farmName })}
        >
          <Image source={require('../../assets/images/navigation/contact.png')} style={styles.footerImage} />
          <Text style={styles.footerText}>Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerItem} onPress={toggleSidebar}>
          <Image source={require('../../assets/images/navigation/menu.png')} style={styles.footerImage} />
          <Text style={styles.footerText}>Menu</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Money In / Money Out */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.button} onPress={handleMoneyIn}>
                  <Text style={styles.buttonText}>Money In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleMoneyOut}>
                  <Text style={styles.buttonText}>Money Out</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#fff',
    zIndex: 11,
  },
  footerItem: {
    alignItems: 'center',
  },
  footerImage: {
    width: 24,
    height: 24,
  },
  footerText: {
    fontSize: 12,
    marginTop: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)', // dim background
  },
  modalContent: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: '#ddd',
    margin: 5,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
