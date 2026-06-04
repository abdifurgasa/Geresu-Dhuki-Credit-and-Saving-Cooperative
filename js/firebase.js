/* =========================
   FIREBASE CONFIG
========================= */

// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    getDoc,
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    orderBy, 
    limit,
    Timestamp,
    writeBatch,
    increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

 const firebaseConfig = {
  apiKey: "AIzaSyCS-3e_WqGHNycDgvlXVkInaynTnvnplYE",
  authDomain: "geresu-dhuki-sacco.firebaseapp.com",
  projectId: "geresu-dhuki-sacco",
  storageBucket: "geresu-dhuki-sacco.appspot.com",
  messagingSenderId: "944934938425",
  appId: "1:944934938425:web:caef23f2f3bb34c843eae8"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Collection references
const collections = {
    users: "users",
    members: "members",
    savings: "savings",
    loans: "loans",
    repayments: "repayments",
    withdrawals: "withdrawals",
    settings: "settings",
    activities: "activities"
};

// Export all Firebase services
export { 
    db, 
    auth, 
    storage,
    collections,
    collection, 
    getDocs,
    getDoc,
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    orderBy, 
    limit,
    Timestamp,
    writeBatch,
    increment,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
};
