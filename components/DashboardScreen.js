import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  Animated,
  Alert,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { collection, query, onSnapshot, updateDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebase/config2';
import FooterScreen from './footer/FooterScreen';
import { Picker } from '@react-native-picker/picker';
import styles from '../frontend/componentsStyles/DashboardScreenStyles';

export default function DashboardScreen({ firstName, lastName, farmName, onLogout }) {
  // State variables
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [pigGroups, setPigGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [updatedFirstName, setUpdatedFirstName] = useState(firstName);
  const [updatedLastName, setUpdatedLastName] = useState(lastName);
  const [updatedFarmName, setUpdatedFarmName] = useState(farmName);
  const [currentFirstName, setCurrentFirstName] = useState(firstName);
  const [currentLastName, setCurrentLastName] = useState(lastName);
  const [currentFarmName, setCurrentFarmName] = useState(farmName);
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
        setSelectedBranch(farmName);

        const q = query(collection(firestore, `users/${user.uid}/farmBranches`));
        const unsubscribeFarmBranches = onSnapshot(q, (snapshot) => {
          const branchList = [];
          snapshot.forEach((doc) => {
            branchList.push({ id: doc.id, ...doc.data() });
          });
          setBranches([{ id: 'farmName', name: `Main Farm: ${farmName}` }, ...branchList]);
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
      const branchDoc = doc(firestore, `users/${user.uid}/farmBranches/${currentFarmName}`);
    
      try {
        // Update user document
        await updateDoc(userDoc, {
          firstName: updatedFirstName,
          lastName: updatedLastName,
          farmName: updatedFarmName,
        });
  
        // Only update the branch name if it's changing
        if (currentFarmName !== updatedFarmName) {
          await updateDoc(branchDoc, { name: updatedFarmName });
        }
        
        setModalVisible(false);
      } catch (error) {
        console.error('Error updating account:', error);
      }
    }
  };
  
  
  

  // Handle branch switch
  const handleBranchSwitch = (branchName) => {
    if (branchName !== selectedBranch) {
      Alert.alert(
        "Switch Branch",
        `Do you want to switch to the ${branchName} branch?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes",
            onPress: () => {
              setSelectedBranch(branchName);
              setCurrentFarmName(branchName);
              console.log(`Switched to ${branchName} branch.`);
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  // Handle adding a new branch
  const handleAddBranch = async () => {
    if (!newBranchName.trim()) {
      Alert.alert('Validation Error', 'Branch name is required!');
      return;
    }
  
    try {
      if (user) {
        const branchRef = doc(firestore, `users/${user.uid}/farmBranches/${newBranchName}`);
        
        // Check if the branch already exists
        const branchSnapshot = await getDoc(branchRef);
        if (branchSnapshot.exists()) {
          Alert.alert('Branch Error', 'A branch with this name already exists!');
          return;
        }
  
        // Create a new document with the branch name as the ID
        await setDoc(branchRef, { name: newBranchName });
  
        setNewBranchName(''); // Clear the input
        setBranchModalVisible(false); // Close the modal
        console.log('New branch added:', newBranchName);
      }
    } catch (error) {
      console.error('Error adding branch:', error);
    }
  };
  

  // Handle updating a branch name
  const handleUpdateBranch = async (branchId) => {
    if (user) {
      const branchDocRef = doc(firestore, `users/${user.uid}/farmBranches/${branchId}`);
      try {
        await updateDoc(branchDocRef, { name: updatedFarmName });
        setBranchModalVisible(false);
        console.log('Branch name updated successfully:', updatedFarmName);
      } catch (error) {
        console.error('Error updating branch name:', error);
      }
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
            onPress={() => navigation.navigate('PigGroups', {
              selectedBranch: selectedBranch === `Main Farm: ${farmName}` ? 'main' : selectedBranch,
            })}
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
          <Text style={styles.sidebarText}> Farm: <Text style={{ fontWeight: 'bold' }}>{currentFarmName}</Text> </Text>

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

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setBranchModalVisible(true)}>
            <Text style={styles.sidebarButtonText}>Add Branch</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={confirmLogout}>
            <Text style={styles.sidebarButtonText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Account Modal */}
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Account</Text>
              <TextInput
                style={styles.modalInput}
                value={updatedFirstName}
                onChangeText={setUpdatedFirstName}
                placeholder="First Name"
              />
              <TextInput
                style={styles.modalInput}
                value={updatedLastName}
                onChangeText={setUpdatedLastName}
                placeholder="Last Name"
              />
              <TextInput
                style={styles.modalInput}
                value={updatedFarmName}
                onChangeText={setUpdatedFarmName}
                placeholder="Farm Name"
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleUpdate}
              >
                <Text style={styles.modalButtonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add Branch Modal */}
        <Modal
          transparent={true}
          visible={branchModalVisible}
          animationType="slide"
          onRequestClose={() => setBranchModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Branch</Text>
              <TextInput
                style={styles.modalInput}
                value={newBranchName}
                onChangeText={setNewBranchName}
                placeholder="Branch Name"
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleAddBranch}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setBranchModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}
