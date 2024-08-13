import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyA9WWc5YI8IPr0HEM7Anj90A1uwQaZIdqI",
  authDomain: "streak-todo.firebaseapp.com",
  projectId: "streak-todo",
  storageBucket: "streak-todo.appspot.com",
  messagingSenderId: "280955624609",
  appId: "1:280955624609:web:b20f3587d10e2ab9b2e4e0",
  measurementId: "G-HGJY6DQMN7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;
