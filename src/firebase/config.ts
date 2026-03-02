import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB04zxwjh5s1von26IEvGQctU9sBzJ-UUU",
  authDomain: "actransportes-ba4d5.firebaseapp.com",
  projectId: "actransportes-ba4d5",
  storageBucket: "actransportes-ba4d5.firebasestorage.app",
  messagingSenderId: "253715468917",
  appId: "1:253715468917:web:d5ac83a1d21e537839de3c",
  measurementId: "G-H29N0S8K8H"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); 
export default app; 