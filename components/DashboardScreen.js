
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  Animated,
  Alert,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { collection, query, onSnapshot, updateDoc, doc, addDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebase/config2';
import FooterScreen from './footer/FooterScreen';
import { Picker } from '@react-native-picker/picker'; 

export default function DashboardScreen({ firstName, lastName, farmName, onLogout }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [pigGroups, setPigGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [branchModalVisible, setBranchModalVisible] = useState(false); 
  const [updatedFirstName, setUpdatedFirstName] = useState(firstName);
  const [updatedLastName, setUpdatedLastName] = useState(lastName);
  const [updatedFarmName, setUpdatedFarmName] = useState(farmName);
  const [currentFirstName, setCurrentFirstName] = useState(firstName);
  const [currentLastName, setCurrentLastName] = useState(lastName);
  const [currentFarmName, setCurrentFarmName] = useState(farmName);
  const [newBranchName, setNewBranchName] = useState(''); 
  const [branches, setBranches] = useState([]); 
  const [selectedBranch, setSelectedBranch] = useState(farmName); 
  const sidebarTranslateX = useState(new Animated.Value(Dimensions.get('window').width))[0];
  const navigation = useNavigation();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const userDocRef = doc(firestore, `users/${user.uid}`);
      const unsubscribeUserDoc = onSnapshot(userDocRef, (doc) => {
       const userData = doc.data();
        const farmName = userData?.farmName || '';
        
        setCurrentFarmName(farmName);
        setSelectedBranch(farmName); // Set the initial selected branch to farm name
  
        const q = query(collection(firestore, `users/${user.uid}/farmBranches`));
        const unsubscribeFarmBranches = onSnapshot(q, (snapshot) => {
          const branchList = [];
          snapshot.forEach((doc) => {
            branchList.push({ id: doc.id, ...doc.data() });
          });
          // Add the farm name as the first item in the branch list
          setBranches([ 
            { id: 'farmName', name: `Main Farm: ${farmName}` }, // Label with "Main Farm"
            ...branchList 
          ]);
        });
  
        return () => {
          unsubscribeFarmBranches();
          unsubscribeUserDoc();
        };
      });
    }
  }, [user]); 
  


  useEffect(() => {
    setCurrentFirstName(updatedFirstName);
    setCurrentLastName(updatedLastName);
    setCurrentFarmName(updatedFarmName);
  }, [updatedFirstName, updatedLastName, updatedFarmName]);

  // Fetch farm branches
  useEffect(() => {
    if (user) {
      const q = query(collection(firestore, `users/${user.uid}/farmBranches`));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const branchList = [];
        snapshot.forEach((doc) => {
          branchList.push({ id: doc.id, ...doc.data() });
        });
        setBranches(branchList);
      });

      return () => unsubscribe();
    }
  }, [user]);

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

  const handleAddBranch = async () => {
    if (user && newBranchName.trim()) {
      await addDoc(collection(firestore, `users/${user.uid}/farmBranches`), {
        name: newBranchName.trim(),
      });
      setNewBranchName('');
      setBranchModalVisible(false);
    }
  };

  // Handle branch switch
  const handleBranchSwitch = (branchName) => {
    if (branchName !== selectedBranch) {
      Alert.alert(
        "Switch Branch",
        `Do you want to switch to the ${branchName} branch?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => {
              setSelectedBranch(branchName);
              setCurrentFarmName(branchName);
              console.log(`Switched to ${branchName} branch.`);
              navigation.navigate('Dashboard', {
                firstName: updatedFirstName,
                lastName: updatedLastName,
                farmName: branchName,
              });
            },
          },
        ],
        { cancelable: true }
      );
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

          <TouchableOpacity
            style={[styles.seeAllButton, { zIndex: 10, elevation: 5 }]}
            onPress={() => navigation.navigate('PigGroups')}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>

          <FlatList
            data={pigGroups}
            renderItem={({ item }) => (
              <View style={styles.pigGroupSummary}>
                <Text style={styles.pigGroupText}>{item.name}</Text>
                <Text style={styles.pigCountText}>
                  <Text style={styles.boldText}>{/* {item.pigCount || 0} Pigs */}</Text>
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

        <FooterScreen
          firstName={firstName}
          lastName={lastName}
          farmName={farmName}
          toggleSidebar={toggleSidebar}
        />

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

          {/* Add Branch Button */}
          <TouchableOpacity style={styles.addBranchButton} onPress={() => setBranchModalVisible(true)}>
            <Text style={styles.addBranchButtonText}>Add Branch</Text>
          </TouchableOpacity>

          {/* Branch Picker */}
          <Picker
  selectedValue={selectedBranch}
  onValueChange={handleBranchSwitch}
  style={styles.picker}
>
  <Picker.Item label="Select a Branch" value="" />
  {branches.map((branch) => (
    <Picker.Item key={branch.id} label={branch.name} value={branch.name} />
  ))}
</Picker>


          <TouchableOpacity style={styles.sidebarButton} onPress={confirmLogout}>
            <Text style={styles.sidebarButtonText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
      {/* Edit Account Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Farm Information</Text>
            <TextInput
              style={styles.input}
              value={updatedFirstName}
              onChangeText={setUpdatedFirstName}
              placeholder="First Name"
            />
            <TextInput
              style={styles.input}
              value={updatedLastName}
              onChangeText={setUpdatedLastName}
              placeholder="Last Name"
            />
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

      {/* Add Branch Modal */}
      <Modal
        transparent={true}
        visible={branchModalVisible}
        onRequestClose={() => setBranchModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Branch</Text>
            <TextInput
              style={styles.input}
              value={newBranchName}
              onChangeText={setNewBranchName}
              placeholder="Branch Name"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleAddBranch}>
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setBranchModalVisible(false)}>
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
    zIndex: 1, // Lower the zIndex so it doesn't overlap the sidebar
    elevation: 2, // Ensure it's clickable, but not higher than the sidebar
  },
  seeAllText: {
    color: '#fff',
    fontSize: 18,
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
    zIndex: 10, // Ensure the sidebar has the highest zIndex
    elevation: 10, // Higher elevation to ensure it shows above other UI elements
  },
  sidebarHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 1,
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
    marginTop: 60,
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
  },
  addBranchButton: {
    backgroundColor: '#869F77',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    marginBottom: 10,
    
  },
  addBranchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  seeAllButton: {
    backgroundColor: '#588061',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  seeAllText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});