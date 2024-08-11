import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DashboardScreen = ({ farmName }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to {farmName}!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DashboardScreen;
