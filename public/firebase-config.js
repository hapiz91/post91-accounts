/* =========================================================
   POST91 ACCOUNTS - FIREBASE CONFIG
========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyBJJcKRT6-XyqFKcWJ1_2qKKjtxj_yM-zI",
  authDomain: "post91-accounts.firebaseapp.com",
  projectId: "post91-accounts",
  storageBucket: "post91-accounts.firebasestorage.app",
  messagingSenderId: "776119906958",
  appId: "1:776119906958:web:a50f24c06ad5413a628fdf"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();