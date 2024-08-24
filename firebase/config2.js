import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import Firestore
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBZFdo2BBEtgXpm7OzazdouMM8Xd1gavag",
  authDomain: "fir-auth-c0fb1.firebaseapp.com",
  projectId: "fir-auth-c0fb1",
  storageBucket: "fir-auth-c0fb1.appspot.com",
  messagingSenderId: "119937751214",
  appId: "1:119937751214:web:2721634e4c23d8dae3b53f"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const firestore = getFirestore(app); // Initialize Firestore

export { auth, firestore };
