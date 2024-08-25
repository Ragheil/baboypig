import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/authentication/LoginScreen';
import RegisterScreen from './components/authentication/RegisterScreen';
import DashboardScreen from './components/DashboardScreen';

import { auth, firestore } from './firebase/config2';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        console.log(`User logged in: ${user.email}`);

        // Retrieve user data from Firestore
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setFarmName(userData.farmName || 'No Farm Name');
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
        } else {
          console.log('No such document in Firestore!');
          setFarmName('No Farm Name');
          setFirstName('');
          setLastName('');
        }
      } else {
        console.log('User logged out.');
        setUser(null);
        setFarmName('');
        setFirstName('');
        setLastName('');
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

        // Save user data to Firestore
        const userDoc = doc(firestore, 'users', auth.currentUser.uid);
        await setDoc(userDoc, { farmName, firstName, lastName });

        console.log(`User data saved for ${auth.currentUser.uid}: Farm Name: ${farmName}, First Name: ${firstName}, Last Name: ${lastName}`);
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
    setFirstName('');
    setLastName('');
    setIsLogin(true);
    setShowWelcome(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showWelcome ? (
        <WelcomeScreen onStart={() => setShowWelcome(false)} />
      ) : user ? (
        <DashboardScreen firstName={firstName} lastName={lastName} farmName={farmName} onLogout={handleLogout} />
      ) : isLogin ? (
        <LoginScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
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
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
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
  },
});
