import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const WelcomeScreen = ({ onStart }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Our App</Text>
      <Button title="Start" onPress={onStart} color="#3498db" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
