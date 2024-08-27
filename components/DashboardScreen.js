import React from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

export default function DashboardScreen({ firstName, lastName, farmName, onLogout }) {
  return (
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
        <TouchableOpacity style={styles.footerItem}>
          <Image source={require('./images/navigation/menu.png')} style={styles.footerImage} />
          <Text style={styles.footerText}>Menu</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
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
    backgroundColor: '#869F77',
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
});
