/// DATABASE CONNECT
export const firebaseConfig = {
   apiKey: "AIzaSyASbriNsGigCrl_WvbqNSl9upAiLge1zZ4",
   authDomain: "danil-86157.firebaseapp.com",
   databaseURL: "https://danil-86157-default-rtdb.europe-west1.firebasedatabase.app",
   projectId: "danil-86157",
   storageBucket: "danil-86157.appspot.com",
   messagingSenderId: "400192790550",
   appId: "1:400192790550:web:a0d1a58eb6533200a6d537"
};

import { getApp, initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getDatabase, ref } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-storage.js";

// Initialize Firebase + firebase Storage
export const app = initializeApp(firebaseConfig);
export const firebaseApp = getApp();
export const db = getDatabase();
export const dbRef = ref(db, `employees/`);
export const storage = getStorage(firebaseApp, "gs://danil-86157.appspot.com");


