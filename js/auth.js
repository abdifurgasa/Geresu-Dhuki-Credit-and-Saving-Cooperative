import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyCS-3e_WqGHNycDgvlXVkInaynTnvnplYE",
  authDomain: "geresu-dhuki-sacco.firebaseapp.com",
  projectId: "geresu-dhuki-sacco",
  storageBucket: "geresu-dhuki-sacco.firebasestorage.app",
  messagingSenderId: "944934938425",
  appId: "1:944934938425:web:caef23f2f3bb34c843eae8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* LOGIN BUTTON */
document.getElementById("loginBtn").onclick = async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);

    const user = result.user;

    // 🔐 GET ROLE FROM FIRESTORE
    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) {
      alert("No role assigned. Contact admin.");
      return;
    }

    const role = snap.data().role;

    // 🚀 ROLE-BASED REDIRECT
    if (role === "admin") {
      location.href = "dashboard.html";
    } else if (role === "user") {
      location.href = "dashboard.html";
    } else {
      alert("Invalid role");
    }

  } catch (error) {
    alert(error.message);
  }
};

/* AUTO LOGIN CHECK */
onAuthStateChanged(auth, (user) => {
  if (user) {
    location.href = "dashboard.html";
  }
});
