import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { StyleSheet } from 'react-native';

import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/authentication/LoginScreen';
import RegisterScreen from './components/authentication/RegisterScreen';
import DashboardScreen from './components/DashboardScreen';
import FarmNameScreen from './components/FarmNameScreen'; 
import ContactScreen from './components/ContactScreen'; 

import { auth, firestore } from './firebase/config2';

const Stack = createStackNavigator();

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isFarmNameSet, setIsFarmNameSet] = useState(false); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        console.log(`User logged in: ${user.email}`);

        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setFarmName(userData.farmName || '');
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          setIsFarmNameSet(!!userData.farmName);
        } else {
          console.log('No such document in Firestore!');
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

  const handleAuthentication = async (firstName = '', lastName = '') => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log(`User signed in successfully: ${email}`);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log(`User created successfully: ${email}`);

        const userDoc = doc(firestore, 'users', auth.currentUser.uid);
        await setDoc(userDoc, { firstName, lastName });

        console.log(`User data saved for ${auth.currentUser.uid}: First Name: ${firstName}, Last Name: ${lastName}`);
        setIsFarmNameSet(false);
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
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        {showWelcome ? (
          <Stack.Screen 
            name="Welcome" 
            options={{ headerShown: false }} // Hide title
          >
            {(props) => <WelcomeScreen {...props} onStart={() => setShowWelcome(false)} />}
          </Stack.Screen>
        ) : user ? (
          isFarmNameSet ? (
            <Stack.Screen 
              name="Dashboard" 
              options={{ headerShown: false }} // Hide title
            >
              {(props) => <DashboardScreen {...props} firstName={firstName} lastName={lastName} farmName={farmName} onLogout={handleLogout} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen 
              name="FarmName" 
              options={{ headerShown: false }} // Hide title
            >
              {(props) => <FarmNameScreen {...props} onFarmNameSet={(name) => { setFarmName(name); setIsFarmNameSet(true); }} />}
            </Stack.Screen>
          )
        ) : isLogin ? (
          <Stack.Screen 
            name="Login" 
            options={{ headerShown: false }} // Hide title
          >
            {(props) => (
              <LoginScreen
                {...props}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                handleAuthentication={handleAuthentication}
                navigateToRegister={() => setIsLogin(false)}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen 
            name="Register" 
            options={{ headerShown: false }} // Hide title
          >
            {(props) => (
              <RegisterScreen
                {...props}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                handleAuthentication={handleAuthentication}
                navigateToLogin={() => setIsLogin(true)}
              />
            )}
          </Stack.Screen>
        )}
        <Stack.Screen 
          name="ContactScreen" 
          component={ContactScreen} 
          options={{ headerShown: false }} // Hide title
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
