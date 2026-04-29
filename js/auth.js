import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

/* 🔁 INIT FIRESTORE AGAIN (simple way) */
const firebaseConfig = {
  apiKey: "AIzaSyCS-3e_WqGHNycDgvlXVkInaynTnvnplYE",
  authDomain: "geresu-dhuki-sacco.firebaseapp.com",
  projectId: "geresu-dhuki-sacco"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.loginFirebase = async function () {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);

    const user = result.user;

    // 🔐 GET ROLE FROM FIRESTORE
    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) {
      alert("No role assigned!");
      return;
    }

    const role = snap.data().role;

    // ✅ SAVE ROLE
    localStorage.setItem("role", role);

    // 👉 go dashboard
    window.location.href = "dashboard.html";

  } catch (error) {
    alert(error.message);
  }
};
