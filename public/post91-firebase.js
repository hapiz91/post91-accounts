import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJJcKRT6-XyqFKcWJ1_2qKKjtxj_yM-zI",
  authDomain: "post91-accounts.firebaseapp.com",
  projectId: "post91-accounts",
  storageBucket: "post91-accounts.firebasestorage.app",
  messagingSenderId: "776119906958",
  appId: "1:776119906958:web:a50f24c06ad5413a628fdf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  doc,
  setDoc,
  serverTimestamp
};