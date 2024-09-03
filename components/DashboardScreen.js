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
import { collection, query, onSnapshot } from 'firebase/firestore';
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
    if (user) {
      const branchQuery = query(collection(firestore, `users/${user.uid}/farmBranches`));
      const unsubscribe = onSnapshot(branchQuery, (snapshot) => {
        const branches = [];
        snapshot.forEach((doc) => {
          // Ensure to use 'name' from document data
          const branchName = doc.data().name;
          branches.push({ label: branchName, value: doc.id });
        });
        console.log('Branches:', branches); // Debugging output
        setFarmBranches(branches);
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
            containerStyle={{ width: '100%', marginBottom: 20 }}
            style={{ backgroundColor: '#f0f0f0', borderColor: '#869F77' }}
            dropDownContainerStyle={{ backgroundColor: '#eeeeee', borderColor: '#869F77' }}
            textStyle={{ color: '#333333', fontSize: 16 }}
            labelStyle={{ color: '#333333', fontSize: 16 }}
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#869F77',
    borderRadius: 5,
    marginBottom: 10,
  },
  sidebarButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
