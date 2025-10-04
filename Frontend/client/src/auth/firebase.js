// client/src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "Your_apiKey",
  authDomain: "Your_authDomain",
  projectId: "Your_projectId",
  storageBucket: "Your_storageBucket",
  messagingSenderId: "Your_messagingSenderId",
  appId: "Your_appId",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
