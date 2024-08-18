import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/authentication/LoginScreen';
import RegisterScreen from './components/authentication/RegisterScreen';
import DashboardScreen from './components/DashboardScreen';

import { auth } from './firebase/config2'; // Firebase initialization

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        console.log(`User logged in: ${user.email}`);
        const storedFarmName = await AsyncStorage.getItem(`farmName_${user.uid}`);
        setFarmName(storedFarmName || 'No Farm Name');
      } else {
        console.log('User logged out.');
        setUser(null);
        setFarmName('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAuthentication = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log(`User signed in successfully: ${email}`);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log(`User created successfully: ${email}`);
        await AsyncStorage.setItem(`farmName_${auth.currentUser.uid}`, farmName);
        console.log(`Farm name saved for user ${auth.currentUser.uid}: ${farmName}`);
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    console.log('User logged out successfully.');
    setUser(null);
    setFarmName('');
    setIsLogin(true);
    setShowWelcome(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showWelcome ? (
        <WelcomeScreen onStart={() => setShowWelcome(false)} />
      ) : user ? (
        <DashboardScreen farmName={farmName} onLogout={handleLogout} />
      ) : isLogin ? (
        <LoginScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleAuthentication={handleAuthentication}
          navigateToRegister={() => setIsLogin(false)}
        />
      ) : (
        <RegisterScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          farmName={farmName}
          setFarmName={setFarmName}
          handleAuthentication={handleAuthentication}
          navigateToLogin={() => setIsLogin(true)}
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
