import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
import { initializeApp } from '@firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';

import WelcomeScreen from './components/WelcomeScreen';
import AuthScreen from './components/AuthScreen';
import FarmNameScreen from './components/FarmNameScreen';
import DashboardScreen from './components/DashboardScreen';
import firebaseConfig from './firebase/config';

const app = initializeApp(firebaseConfig);

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [farmName, setFarmName] = useState('');

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const storedFarmName = await AsyncStorage.getItem('farmName');
          console.log('Retrieved farm name:', storedFarmName); // Debugging log
          if (storedFarmName) {
            setFarmName(storedFarmName);
          }
        } catch (error) {
          console.error('Failed to retrieve the farm name:', error);
        }
      } else {
        setUser(null);
        setFarmName('');
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleAuthentication = async () => {
    try {
      if (user) {
        console.log('User logged out successfully!');
        await signOut(auth);
        await AsyncStorage.removeItem('farmName'); // Remove farm name on logout
        setFarmName('');
      } else {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
          console.log('User signed in successfully!');
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
          console.log('User created successfully!');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
    }
  };

  const handleFarmNameSubmit = async (name) => {
    setFarmName(name);
    try {
      await AsyncStorage.setItem('farmName', name); // Store the farm name
      console.log('Farm name saved:', name); // Debugging log
    } catch (error) {
      console.error('Failed to save the farm name:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    await AsyncStorage.removeItem('farmName'); // Clear farm name on logout
    setUser(null);
    setFarmName('');
    setIsLogin(true);
    setShowWelcome(true); // Navigate back to welcome screen after logout
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showWelcome ? (
        <WelcomeScreen onStart={() => setShowWelcome(false)} />
      ) : user && !farmName ? (
        <FarmNameScreen onSubmit={handleFarmNameSubmit} />
      ) : user && farmName ? (
        <DashboardScreen farmName={farmName} onLogout={handleLogout} />
      ) : (
        <AuthScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          handleAuthentication={handleAuthentication}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
});
