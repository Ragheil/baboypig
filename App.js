import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { StyleSheet } from 'react-native';

// Import screens
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/authentication/LoginScreen';
import RegisterScreen from './components/authentication/RegisterScreen';
import DashboardScreen from './components/DashboardScreen';
import FarmNameScreen from './components/FarmNameScreen';
import ContactScreen from './components/ContactScreen';
import PigGroupsScreen from './components/PigGroupsScreen';
import AddPigInfoScreen from './components/AddPigInfoScreen'; // Import AddPigInfoScreen

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
  const [isNewUser, setIsNewUser] = useState(false);

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
        setIsFarmNameSet(false);
        setIsNewUser(false);
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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send email verification
        await sendEmailVerification(user);

        console.log(`User created successfully: ${email}`);
        const userDoc = doc(firestore, 'users', user.uid);
        await setDoc(userDoc, { firstName, lastName });

        console.log(`User data saved for ${user.uid}: First Name: ${firstName}, Last Name: ${lastName}`);
        setIsFarmNameSet(false);
        setIsNewUser(true); // Mark as a new user
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
    setIsNewUser(false); // Reset new user state
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
          isFarmNameSet ? (
            <>
              <Stack.Screen
                name="Dashboard"
                options={{ headerShown: false }}
              >
                {(props) => <DashboardScreen {...props} firstName={firstName} lastName={lastName} farmName={farmName} onLogout={handleLogout} />}
              </Stack.Screen>
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
              {/* No need to show FarmNameScreen again if farm name is set */}
            </>
          ) : isNewUser ? (
            <Stack.Screen
              name="FarmName"
              options={{ headerShown: false }}
            >
              {(props) => <FarmNameScreen {...props} onFarmNameSet={(name) => { setFarmName(name); setIsFarmNameSet(true); setIsNewUser(false); }} />}
            </Stack.Screen>
          ) : (
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
          )
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
