import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

export default function WelcomeScreen({ onStart }) {
  return (
    <LinearGradient
      colors={['#FDE9EA', '#869F77', '#588061']} // Gradient colors
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.greeting}>Hello!</Text>
        <Text style={styles.title}>Welcome to!</Text>
        <Text style={styles.appName}>PigEx</Text>
        <Text style={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>Start Now</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  greeting: {
    fontSize: 20,
    marginBottom: 10,
    color: '#000',
  },
  title: {
    fontSize: 28,
    marginBottom: 65,
    fontWeight: 'bold',
    color: '#000',
  },
  appName: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#060606',
    marginBottom: 20,
  },
  description: {
    textAlign: 'center',
    color: '#060606',
    fontWeight: 'bold',
    marginBottom: 40,
    paddingHorizontal: 20,
    marginTop: 100,
  },
  startButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 100,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
