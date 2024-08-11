
/*import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signOut, signInWithPopup, signInWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA9GnClWA2oUINAWvUE8qMEP0gOkgfvxzM",
    authDomain: "interview-bot-d1442.firebaseapp.com",
    projectId: "interview-bot-d1442",
    storageBucket: "interview-bot-d1442.appspot.com",
    messagingSenderId: "293353353891",
    appId: "1:293353353891:web:e7508a95a7bce947814516",
    measurementId: "G-746NZMPNSP"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, GoogleAuthProvider, signOut, signInWithPopup, signInWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier };
*/
// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider,onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, GoogleAuthProvider,onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, RecaptchaVerifier, signInWithPhoneNumber };
