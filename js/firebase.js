import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCS-3e_WqGHNycDgvlXVkInaynTnvnplYE",
  authDomain: "geresu-dhuki-sacco.firebaseapp.com",
  projectId: "geresu-dhuki-sacco",
  storageBucket: "geresu-dhuki-sacco.firebasestorage.app",
  messagingSenderId: "944934938425",
  appId: "1:944934938425:web:caef23f2f3bb34c843eae8",
  measurementId: "G-QRHNWMZMXC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
