// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { StyleSheet } from 'react-native';

// Import screens
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/authentication/LoginScreen';
import RegisterScreen from './components/authentication/RegisterScreen';
import DashboardScreen from './components/DashboardScreen';
import FarmNameScreen from './components/FarmNameScreen';
import ContactScreen from './components/contact/ContactScreen';
import PigGroupsScreen from './components/pigGroup/PigGroupsScreen';
import AddPigInfoScreen from './components/pigGroup/AddPigInfoScreen';
import LoadingScreen from './components/LoadingScreen'; // Assuming you have a loading screen

import { auth, firestore } from './firebase/config2';

const Stack = createStackNavigator();

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farmName, setFarmName] = useState(''); // State for farm name
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isFarmNameSet, setIsFarmNameSet] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false); // Track if the user just registered
  const [loading, setLoading] = useState(false); // Loading state
  const [isRegistering, setIsRegistering] = useState(false); // State to track registration status

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        console.log(`User logged in: ${user.email}`);

        // Fetch user data
        await fetchUserData(user.uid);
      } else {
        console.log('User logged out.');
        setUser(null);
        setIsFarmNameSet(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user data from Firestore
  const fetchUserData = async (uid) => {
    setLoading(true); // Start loading
    
    // Fetch the user's basic info (first name, last name) from the 'users' collection
    const userDocRef = doc(firestore, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      console.log('User basic data fetched from Firestore:', userData);

      // Fetch the farm name from the 'farmBranches/Main Farm' sub-collection
      const farmBranchDocRef = doc(firestore, 'users', uid, 'farmBranches', 'Main Farm');
      const farmBranchDocSnap = await getDoc(farmBranchDocRef);

      if (farmBranchDocSnap.exists()) {
        const farmData = farmBranchDocSnap.data();
        setFarmName(farmData.farmName || ''); // Set the farm name from 'Main Farm'
        setIsFarmNameSet(!!farmData.farmName);
        console.log('Farm data fetched from Firestore:', farmData);
      } else {
        console.log('No such farm branch document in Firestore!');
      }
    } else {
      console.log('No such user document in Firestore!');
    }

    setLoading(false); // End loading
  };

  const handleAuthentication = async (firstName = '', lastName = '') => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log(`User signed in successfully: ${email}`);
      } else {
        setIsRegistering(true); // Set to true when registering
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send email verification
        await sendEmailVerification(user);

        console.log(`User created successfully: ${email}`);
        const userDoc = doc(firestore, 'users', user.uid);
        await setDoc(userDoc, { firstName, lastName, farmName: '' }); // Include farmName in the doc

        console.log(`User data saved for ${user.uid}: First Name: ${firstName}, Last Name: ${lastName}`);

        // Automatically fetch user data after registration
        await fetchUserData(user.uid);
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
    }
  };

  const handleLogout = async () => {
    console.log('Logging out user:', user ? user.email : 'No user logged in'); // Debug log
    await signOut(auth);
    console.log('User logged out successfully.');

    setUser(null);
    setIsLogin(true);
    setShowWelcome(true);
    setIsFarmNameSet(false);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {showWelcome ? (
          <Stack.Screen
            name="Welcome"
            options={{ headerShown: false }}
          >
            {(props) => <WelcomeScreen {...props} onStart={() => setShowWelcome(false)} />}
          </Stack.Screen>
        ) : user ? (
          <>
            {!isFarmNameSet && isRegistering ? ( // Only show FarmNameScreen after registration
              <Stack.Screen
                name="FarmName"
                options={{ headerShown: false }}
              >
                {(props) => (
                  <FarmNameScreen
                    {...props}
                    onFarmNameSet={(name) => {
                      setFarmName(name);
                      setIsFarmNameSet(true);
                      setIsRegistering(false); // Reset registration state
                    }}
                  />
                )}
              </Stack.Screen>
            ) : (
              <>
                {loading ? ( // Show loading screen while data is fetched
                  <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
                ) : (
                  <Stack.Screen
                    name="Dashboard"
                    options={{ headerShown: false }}
                  >
                    {(props) => (
                      <DashboardScreen {...props} firstName={firstName} lastName={lastName} farmName={farmName} onLogout={handleLogout} />
                    )}
                  </Stack.Screen>
                )}
              </>
            )}
            <Stack.Screen
              name="PigGroups"
              component={PigGroupsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddPigInfoScreen"
              component={AddPigInfoScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ContactScreen"
              component={ContactScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : isLogin ? (
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
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
            options={{ headerShown: false }}
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
