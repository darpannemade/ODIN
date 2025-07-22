// client/src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBf_jhiSGPwzp-wptRw91gpPIKyJApog3c",
  authDomain: "odin-auth-e9f0e.firebaseapp.com",
  projectId: "odin-auth-e9f0e",
  storageBucket: "odin-auth-e9f0e.appspot.com",
  messagingSenderId: "598155331993",
  appId: "1:598155331993:web:5c61cbcb24baaa2af52b08",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
