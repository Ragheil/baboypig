// FooterScreen.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function FooterScreen({ firstName, lastName, farmName, toggleSidebar }) {
  const navigation = useNavigation();

  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.footerItem}>
        <Image source={require('../../assets/images/navigation/home.png')} style={styles.footerImage} />
        <Text style={styles.footerText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerItem}>
        <Image source={require('../../assets/images/navigation/transaction.png')} style={styles.footerImage} />
        <Text style={styles.footerText}>Transaction</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerItem}>
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
});
