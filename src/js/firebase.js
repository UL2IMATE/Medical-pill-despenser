// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCfFfJyM9jYd4FlNwHSt6pyqZFR87zAxpQ",
  authDomain: "crud-cb6fb.firebaseapp.com",
  databaseURL:
    "https://crud-cb6fb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crud-cb6fb",
  storageBucket: "crud-cb6fb.firebasestorage.app",
  messagingSenderId: "845920708480",
  appId: "1:845920708480:web:3eafe4605da974ce188365",
  measurementId: "G-7XMMBE9T8P",
};
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  onValue,
  update,
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
export { db };