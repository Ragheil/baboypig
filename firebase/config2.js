import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import Firestore
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDK_2Wwa4m2n69P63K6HFRlKni4J7jOnrk",
  authDomain: "baboy-b3f36.firebaseapp.com",
  projectId: "baboy-b3f36",
  storageBucket: "baboy-b3f36.appspot.com",
  messagingSenderId: "752217071135",
  appId: "1:752217071135:web:846395362ecc7f0f793f2a"
};
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const firestore = getFirestore(app); // Initialize Firestore

export { auth, firestore };


{/*
const firebaseConfig = {
  apiKey: "AIzaSyCe5xJn6s67ed3SQgKn6IFsIQMoJTFNwSI",
  authDomain: "pigex-88a94.firebaseapp.com",
  projectId: "pigex-88a94",
  storageBucket: "pigex-88a94.appspot.com",
  messagingSenderId: "586363935868",
  appId: "1:586363935868:web:88823013b6e87f66a9bdf9",
  measurementId: "G-1K77B3XNZ6"
};
*/}





{/*
const firebaseConfig = {
  apiKey: "AIzaSyBZFdo2BBEtgXpm7OzazdouMM8Xd1gavag",
  authDomain: "fir-auth-c0fb1.firebaseapp.com",
  projectId: "fir-auth-c0fb1",
  storageBucket: "fir-auth-c0fb1.appspot.com",
  messagingSenderId: "119937751214",
  appId: "1:119937751214:web:2721634e4c23d8dae3b53f"
};


  */}