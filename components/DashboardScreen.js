import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Alert,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { collection, query, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { firestore, auth } from '../firebase/config2'; // Adjust the import to include auth

export default function DashboardScreen({ firstName, lastName, farmName, onLogout }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [pigGroups, setPigGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatedFirstName, setUpdatedFirstName] = useState(firstName);
  const [updatedLastName, setUpdatedLastName] = useState(lastName);
  const [updatedFarmName, setUpdatedFarmName] = useState(farmName);
  const [currentFirstName, setCurrentFirstName] = useState(firstName);
  const [currentLastName, setCurrentLastName] = useState(lastName);
  const [currentFarmName, setCurrentFarmName] = useState(farmName);
  const sidebarTranslateX = useState(new Animated.Value(Dimensions.get('window').width))[0];
  const navigation = useNavigation();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const q = query(collection(firestore, `users/${user.uid}/pigGroups`));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const groups = [];
        snapshot.forEach((doc) => {
          groups.push({ id: doc.id, ...doc.data() });
        });
        setPigGroups(groups);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    setCurrentFirstName(updatedFirstName);
    setCurrentLastName(updatedLastName);
    setCurrentFarmName(updatedFarmName);
  }, [updatedFirstName, updatedLastName, updatedFarmName]);

  const toggleSidebar = () => {
    Animated.timing(sidebarTranslateX, {
      toValue: sidebarVisible ? Dimensions.get('window').width : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setSidebarVisible(!sidebarVisible);
  };

  const closeSidebar = () => {
    if (sidebarVisible) {
      Animated.timing(sidebarTranslateX, {
        toValue: Dimensions.get('window').width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setSidebarVisible(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout Confirmation',
      'Do you want to logout?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: onLogout },
      ],
      { cancelable: true }
    );
  };

  const handleUpdate = async () => {
    if (user) {
      const userDoc = doc(firestore, `users/${user.uid}`);
      await updateDoc(userDoc, {
        firstName: updatedFirstName,
        lastName: updatedLastName,
        farmName: updatedFarmName,
      });
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FDE9EA', '#869F77', '#588061']}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Pig Groups Summary</Text>

          {/* Conditionally Render the See All Button */}
          {!sidebarVisible && (
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => {
                navigation.navigate('PigGroups');
              }}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={pigGroups}
            renderItem={({ item }) => (
              <View style={styles.pigGroupSummary}>
                <Text style={styles.pigGroupText}>{item.name}</Text>
                <Text style={styles.pigCountText}>
                  <Text style={styles.boldText}>{item.pigCount || 0} Pigs</Text>
                </Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            snapToAlignment="center"
            snapToInterval={160}
            decelerationRate="fast"
            ListEmptyComponent={<Text>No pig groups available.</Text>}
            style={styles.flatList}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerItem}>
            <Image source={require('../assets/images/navigation/home.png')} style={styles.footerImage} />
            <Text style={styles.footerText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerItem}>
            <Image source={require('../assets/images/navigation/transaction.png')} style={styles.footerImage} />
            <Text style={styles.footerText}>Transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerItem}>
            <Image source={require('../assets/images/navigation/plus.png')} style={styles.footerImage} />
            <Text style={styles.footerText}>Plus</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => navigation.navigate('ContactScreen', { firstName, lastName, farmName })}
          >
            <Image source={require('../assets/images/navigation/contact.png')} style={styles.footerImage} />
            <Text style={styles.footerText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerItem} onPress={toggleSidebar}>
            <Image source={require('../assets/images/navigation/menu.png')} style={styles.footerImage} />
            <Text style={styles.footerText}>Menu</Text>
          </TouchableOpacity>
        </View>

        {/* Sidebar */}
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <Animated.View style={[styles.sidebarOverlay, { opacity: sidebarVisible ? 0.5 : 0 }]} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarTranslateX }] }]}>
          <View style={styles.sidebarHeaderContainer}>
            <Text style={styles.sidebarHeader}>{currentFirstName} {currentLastName}</Text>
            <TouchableOpacity style={styles.accountButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.accountButtonText}>Account</Text>
            </TouchableOpacity>
          </View>
          <Divider style={styles.sidebarDivider} />
          <Text style={styles.sidebarText}>Farm: {currentFarmName}</Text>
          <TouchableOpacity style={styles.sidebarButton} onPress={confirmLogout}>
            <Text style={styles.sidebarButtonText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      {/* Edit Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Account Information</Text>
              <Text style={styles.modalLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={updatedFirstName}
                onChangeText={setUpdatedFirstName}
                placeholder="First Name"
              />
              <Text style={styles.modalLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={updatedLastName}
                onChangeText={setUpdatedLastName}
                placeholder="Last Name"
              />
              <Text style={styles.modalLabel}>Farm Name</Text>
              <TextInput
                style={styles.input}
                value={updatedFarmName}
                onChangeText={setUpdatedFarmName}
                placeholder="Farm Name"
              />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleUpdate}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 60,
    textAlign: 'center',
  },
  pigGroupSummary: {
    padding: 15,
    marginVertical: 10,
    marginRight: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: 150,
  },
  pigGroupText: {
    fontSize: 18,
    color: '#333',
  },
  pigCountText: {
    fontSize: 16,
    color: '#666',
  },
  boldText: {
    fontWeight: 'bold',
  },
  flatListContent: {
    paddingHorizontal: 10,
  },
  flatList: {
    flexGrow: 0, // Ensure FlatList does not expand vertically
  },
  seeAllButton: {
    marginBottom: 20, // Adjust spacing between the button and FlatList
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#869F77',
    borderRadius: 5,
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
  },
  seeAllText: {
    color: '#fff',
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#fff',
    zIndex: 3,
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
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    zIndex: 1,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    zIndex: 2,
    elevation: 3,
  },
  sidebarHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 60,
  },
  sidebarDivider: {
    backgroundColor: '#869F77',
    height: 1,
    marginBottom: 20,
  },
  sidebarText: {
    fontSize: 18,
    marginBottom: 20,
  },
  sidebarButton: {
    backgroundColor: '#869F77',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  sidebarButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  sidebarHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  accountButton: {
    backgroundColor: '#869F77',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 30
  },
  accountButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#869F77',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 5,
  }
  
});