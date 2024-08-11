import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
import { initializeApp } from '@firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';

import WelcomeScreen from './components/WelcomeScreen';
import AuthScreen from './components/AuthScreen';
import DashboardScreen from './components/DashboardScreen';
import firebaseConfig from './firebase/config';

const app = initializeApp(firebaseConfig);

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        console.log(`User logged in: ${user.email}`);
        // Retrieve the farm name using user UID
        const storedFarmName = await AsyncStorage.getItem(`farmName_${user.uid}`);
        if (storedFarmName) {
          setFarmName(storedFarmName);
          console.log(`Farm name retrieved: ${storedFarmName}`);
        } else {
          console.log('No farm name found for this user.');
        }
      } else {
        console.log('User logged out.');
        setUser(null);
        setFarmName('');
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleAuthentication = async () => {
    try {
      if (user) {
        // If user is already authenticated, log out
        await signOut(auth);
        console.log('User logged out successfully.');
        setFarmName(''); // Clear farm name state on logout
      } else {
        // Sign in or sign up
        if (isLogin) {
          // Sign in
          await signInWithEmailAndPassword(auth, email, password);
          console.log(`User signed in successfully: ${email}`);
          // Optionally retrieve and log the farm name after sign-in
          const storedFarmName = await AsyncStorage.getItem(`farmName_${auth.currentUser.uid}`);
          console.log(`Farm name for signed-in user: ${storedFarmName}`);
        } else {
          // Sign up
          await createUserWithEmailAndPassword(auth, email, password);
          console.log(`User created successfully: ${email}`);
          // Store the farm name after sign-up with user UID
          await AsyncStorage.setItem(`farmName_${auth.currentUser.uid}`, farmName);
          console.log(`Farm name saved for user ${auth.currentUser.uid}: ${farmName}`);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    console.log('User logged out successfully.');
    setUser(null);
    setFarmName(''); // Clear farm name state
    setIsLogin(true);
    setShowWelcome(true); // Navigate back to welcome screen after logout
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showWelcome ? (
        <WelcomeScreen onStart={() => setShowWelcome(false)} />
      ) : user ? (
        <DashboardScreen farmName={farmName} onLogout={handleLogout} />
      ) : (
        <AuthScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          farmName={farmName}
          setFarmName={setFarmName}
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
