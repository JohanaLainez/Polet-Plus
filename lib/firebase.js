import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAsJONifV2NpDcUw3jCqUBrcTESzLIDuqo",
  authDomain: "polet-plus.firebaseapp.com",
  projectId: "polet-plus",
  storageBucket: "polet-plus.firebasestorage.app",
  messagingSenderId: "118095166863",
  appId: "1:118095166863:web:4bb7a21f98b770c3bd1ffa"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);