// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCS-3e_WqGHNycDgvlXVkInaynTnvnplYE",
  authDomain: "geresu-dhuki-sacco.firebaseapp.com",
  projectId: "geresu-dhuki-sacco",
  storageBucket: "geresu-dhuki-sacco.firebasestorage.app",
  messagingSenderId: "944934938425",
  appId: "1:944934938425:web:caef23f2f3bb34c843eae8",
  measurementId: "G-QRHNWMZMXC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
