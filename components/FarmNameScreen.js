

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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebase/config2';
import DropDownPicker from 'react-native-dropdown-picker';

export default function DashboardScreen({ firstName, lastName, farmName, onLogout }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [pigGroups, setPigGroups] = useState([]);
  const [farmBranches, setFarmBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [open, setOpen] = useState(false);
  const sidebarTranslateX = useState(new Animated.Value(Dimensions.get('window').width))[0];
  const navigation = useNavigation();
  const user = auth.currentUser;
  const [mainFarm, setMainFarm] = useState('');

  useEffect(() => {
    if (user) {
      // Fetch pig groups
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
    if (user) {
      // Fetch farm branches
      const branchQuery = query(collection(firestore, `users/${user.uid}/farmBranches`));
      const unsubscribe = onSnapshot(branchQuery, (snapshot) => {
        const branches = [];
        snapshot.forEach((doc) => {
          const branchName = doc.data().name; // Use 'name' from document data
          branches.push({ label: branchName, value: doc.id });
        });
        setFarmBranches(branches);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Fetch main farm name
      const fetchMainFarm = async () => {
        const mainFarmDoc = doc(firestore, `users/${user.uid}/farmName`);
        const docSnap = await getDoc(mainFarmDoc);
        if (docSnap.exists()) {
          setMainFarm(docSnap.data().name); // Adjust if field name is different
        }
      };
      fetchMainFarm();
    }
  }, [user]);

  useEffect(() => {
    // Update farm branches list to include main farm
    if (mainFarm) {
      setFarmBranches((prevBranches) => [
        { label: 'Main Farm', value: 'main-farm' },
        ...prevBranches,
      ]);
    }
  }, [mainFarm]);

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

  const navigateToAddFarmBranch = () => {
    closeSidebar();
    navigation.navigate('FarmName');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FDE9EA', '#869F77', '#588061']}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Pig Groups Summary</Text>

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

        <TouchableWithoutFeedback onPress={closeSidebar}>
          <Animated.View style={[styles.sidebarOverlay, { opacity: sidebarVisible ? 0.5 : 0 }]} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarTranslateX }] }]}>
          <Text style={styles.sidebarHeader}>{firstName} {lastName}</Text>
          <Divider style={styles.sidebarDivider} />
          <Text style={styles.sidebarText}>Farm: {farmName}</Text>

          {/* Dropdown for selecting farm branch */}
          <DropDownPicker
            open={open}
            value={selectedBranch}
            items={farmBranches}
            setOpen={setOpen}
            setValue={setSelectedBranch}
            setItems={setFarmBranches}
            placeholder="Select Farm Branch"
            containerStyle={{ width: '100%' }}
            style={{ backgroundColor: '#f0f0f0', borderColor: '#869F77' }}
            dropDownContainerStyle={{ backgroundColor: '#eeeeee', borderColor: '#869F77' }}
            textStyle={{ color: '#333333' }}
            labelStyle={{ color: '#333333' }}
          />

          <TouchableOpacity style={styles.sidebarButton} onPress={navigateToAddFarmBranch}>
            <Text style={styles.sidebarButtonText}>Add Farm Branch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarButton} onPress={confirmLogout}>
            <Text style={styles.sidebarButtonText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  pigGroupText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pigCountText: {
    fontSize: 14,
    marginTop: 5,
  },
  boldText: {
    fontWeight: 'bold',
  },
  flatListContent: {
    paddingHorizontal: 16,
  },
  flatList: {
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
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
    color: '#333',
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: Dimensions.get('window').width * 0.75,
    backgroundColor: '#fff',
    padding: 20,
    zIndex: 1000,
  },
  sidebarHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sidebarDivider: {
    marginVertical: 10,
  },
  sidebarText: {
    fontSize: 16,
    marginBottom: 20,
  },
  sidebarButton: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
    alignItems: 'center',
  },
  sidebarButtonText: {
    fontSize: 16,
    color: '#333',
  },
});
