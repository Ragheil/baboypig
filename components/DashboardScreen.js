import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

export default function DashboardScreen({ firstName, lastName, farmName, onLogout }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarTranslateX = useState(new Animated.Value(Dimensions.get('window').width))[0];

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

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#FDE9EA', '#869F77', '#588061']} // Gradient colors
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Text style={styles.welcomeText}>Welcome to your dashboard!</Text>
          <Text style={styles.userNameText}>{firstName} {lastName}</Text>
          <Text style={styles.farmNameText}>Farm Name: {farmName}</Text>
          <Button title="Logout" onPress={onLogout} color="#FF6347" />
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
          <TouchableOpacity style={styles.footerItem}>
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
          <Text style={styles.sidebarText}>{firstName} {lastName}</Text>
          <Text style={styles.sidebarText}>Farm Name: {farmName}</Text>
        </View>
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
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  userNameText: {
    fontSize: 22,
    marginBottom: 8,
  },
  farmNameText: {
    fontSize: 20,
    marginBottom: 32,
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
    paddingTop: 40, // Add padding to the top for the close button
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
    marginTop: 40, // Ensure there's space below the close button
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
    width: Dimensions.get('window').width * 0.25, // Covers the remaining 25% of the screen
    height: '100%',
    backgroundColor: 'transparent', // Transparent background
  },
});
