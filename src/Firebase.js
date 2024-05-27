import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMBtAR_imWQv_Bnj1L9AK4QWQIryXIgEU",
  authDomain: "nextgen-d1ff5.firebaseapp.com",
  databaseURL: "https://nextgen-d1ff5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nextgen-d1ff5",
  storageBucket: "nextgen-d1ff5.appspot.com",
  messagingSenderId: "968767377547",
  appId: "1:968767377547:web:9a10a751909e63ed56c48e",
  measurementId: "G-72DD8ZJLKJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };