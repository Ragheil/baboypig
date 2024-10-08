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
      const userDocRef = doc(firestore, `users/${user.uid}/farmBranches/Main Farm`);
      const unsubscribeUserDoc = onSnapshot(userDocRef, (doc) => {
        const userData = doc.data();
        const farmName = userData?.farmName || ''; // Get the farm name
        setCurrentFarmName(`${farmName}`); // Set the main farm name here
        setSelectedBranch(`Main Farm: ${farmName}`); // Set the selected branch to main farm
  
        const q = query(collection(firestore, `users/${user.uid}/farmBranches`));
        const unsubscribeFarmBranches = onSnapshot(q, (snapshot) => {
          const branchList = [];
          snapshot.forEach((doc) => {
            branchList.push({ id: doc.id, ...doc.data() });
          });
  
          // Modify to include Main Farm with proper labeling
  
          // Update the names of other branches to include "Farm Branch:"
          const updatedBranchList = branchList.map(branch => ({
            id: branch.id,
            name: branch.id === 'Main Farm' ? `Main Farm: ${farmName}` : `Farm Branch: ${branch.name}`
          }));
  
          setBranches(updatedBranchList);
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
      const mainBranchDoc = doc(firestore, `users/${user.uid}/farmBranches/Main Farm`);

      try {
        await updateDoc(doc(firestore, `users/${user.uid}`), {
          firstName: updatedFirstName,
          lastName: updatedLastName,
        });

        if (currentFarmName !== updatedFarmName) {
          await updateDoc(mainBranchDoc, { farmName: updatedFarmName });
          setCurrentFarmName(updatedFarmName);
        }

        setModalVisible(false);
      } catch (error) {
        console.error('Error updating account:', error);
      }
    }
  };

 const handleBranchSwitch = (branchName) => {
  const selectedBranchObj = branches.find(branch => branch.id === branchName);

  if (branchName !== selectedBranch) {
    Alert.alert(
      "Switch Branch",
      `Do you want to switch to the ${selectedBranchObj?.name || branchName} branch?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            setSelectedBranch(branchName);
            setCurrentFarmName(selectedBranchObj?.name || branchName); // Update farm name dynamically
            console.log(`Switched to ${selectedBranchObj?.name || branchName} branch.`);
          },
        },
      ],
      { cancelable: true }
    );
  }
};


  const handleAddBranch = async () => {
    if (!newBranchName.trim()) {
      Alert.alert('Validation Error', 'Branch name is required!');
      return;
    }

    try {
      if (user) {
        const branchRef = doc(firestore, `users/${user.uid}/farmBranches/${newBranchName}`);
        const branchSnapshot = await getDoc(branchRef);
        
        if (branchSnapshot.exists()) {
          Alert.alert('Branch Error', 'A branch with this name already exists!');
          return;
        }

        await setDoc(branchRef, { name: newBranchName });
        setNewBranchName('');
        setBranchModalVisible(false);
        console.log('New branch added:', newBranchName);
      }
    } catch (error) {
      console.error('Error adding branch:', error);
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
              selectedBranch: selectedBranch === `Main Farm: ${farmName}` ? 'Main Farm' : selectedBranch,
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
  farmName={currentFarmName}  // Pass the selected farm name (currentFarmName) here
  onMoneyPress={() => console.log(`Current branch: ${currentFarmName}`)} // Function to log the current branch
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
  {branches
    .filter((branch) => branch.name) // Ensure branch has a valid name
    .map((branch) => (
      <Picker.Item
        key={branch.id}
        label={branch.id === 'Main Farm' ? ` ${branch.name}` : ` ${branch.name}`}
        value={branch.id}
      />
    ))}
</Picker>



          <TouchableOpacity style={styles.addBranchButton} onPress={() => setBranchModalVisible(true)}>
            <Text style={styles.addBranchText}>Add Branch</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Account Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Account</Text>
              <TextInput
                value={updatedFirstName}
                onChangeText={setUpdatedFirstName}
                placeholder="First Name"
                style={styles.input}
              />
              <TextInput
                value={updatedLastName}
                onChangeText={setUpdatedLastName}
                placeholder="Last Name"
                style={styles.input}
              />
              <TextInput
                value={updatedFarmName}
                onChangeText={setUpdatedFarmName}
                placeholder="Farm Name"
                style={styles.input}
              />
              <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add Branch Modal */}
        <Modal visible={branchModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Branch</Text>
              <TextInput
                value={newBranchName}
                onChangeText={setNewBranchName}
                placeholder="Branch Name"
                style={styles.input}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddBranch}>
                <Text style={styles.addButtonText}>Add Branch</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setBranchModalVisible(false)}>
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}
