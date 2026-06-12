import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "nextgen-d1ff5.firebaseapp.com",
  databaseURL: "https://nextgen-d1ff5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nextgen-d1ff5",
  storageBucket: "nextgen-d1ff5.appspot.com",
  messagingSenderId: "968767377547",
  appId: "1:968767377547:web:811f66cd3b24857756c48e",
  measurementId: "G-S4Q7Q08SE7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { db, auth, googleProvider, storage };