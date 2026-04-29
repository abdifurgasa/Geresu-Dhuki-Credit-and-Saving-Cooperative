import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.loginFirebase = async function () {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // GET ROLE FROM FIRESTORE
    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) {
      alert("No role assigned in Firestore!");
      return;
    }

    const role = snap.data().role;

    // SAVE ROLE TEMP
    localStorage.setItem("role", role);

    // REDIRECT
    window.location.href = "dashboard.html";

  } catch (error) {
    alert("Login Failed: " + error.message);
    console.error(error);
  }
};
