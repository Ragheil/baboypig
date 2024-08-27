import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook

export default function DashboardScreen({ firstName, lastName, farmName, onLogout }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarTranslateX = useState(new Animated.Value(Dimensions.get('window').width))[0];
  const navigation = useNavigation(); // Use navigation

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

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#FDE9EA', '#869F77', '#588061']}
        style={styles.gradient}
      >
        <View style={styles.container}>
          {/* Your content */}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerItem}>
            <Image source={require('./images/navigation/home.png')} style={styles.footerImage} />
            <Text style={styles.footerText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerItem}>
            <Image source={require('./images/navigation/transaction.png')} style={styles.footerImage} />
            <Text style={styles.footerText}>Transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerItem}>
            <Image source={require('./images/navigation/plus.png')} style={styles.footerImage} />
            <Text style={styles.footerText}>Plus</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('ContactScreen', { firstName, lastName, farmName })}>
            <Image source={require('./images/navigation/contact.png')} style={styles.footerImage} />
            <Text style={styles.footerText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerItem} onPress={toggleSidebar}>
            <Image source={require('./images/navigation/menu.png')} style={styles.footerImage} />
            <Text style={styles.footerText}>Menu</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {sidebarVisible && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarTranslateX }] }]}>
        <TouchableOpacity style={styles.closeButton} onPress={toggleSidebar}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
        <View style={styles.sidebarHeader}>
          <Divider />
          <Text style={styles.sidebarText}>{firstName} {lastName}</Text>
          <Text style={styles.sidebarText}>Farm Name: {farmName}</Text>
          <Divider style={styles.divider} />
        </View>
        <Button title="Logout" onPress={confirmLogout} color="#FF6347" />
        {/* Add other sidebar items here */}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  gradient: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  footerItem: {
    alignItems: 'center',
  },
  footerImage: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  footerText: {
    fontSize: 12,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: Dimensions.get('window').width * 0.75,
    height: '100%',
    backgroundColor: '#588061',
    padding: 20,
    paddingTop: 40, 
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    left: 20,
  },
  closeButtonText: {
    fontSize: 30,
    color: '#050505',
  },
  sidebarHeader: {
    marginTop: 40, 
    marginBottom: 20,
  },
  sidebarText: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width * 0.25,
    height: '100%',
    backgroundColor: 'transparent', 
  },
  divider: {
    
  },
});
