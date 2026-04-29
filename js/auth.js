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

    // 1. LOGIN ONLY FIRST
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("Login success:", user.email);

    // 2. SAVE UID TEMP (important for dashboard)
    localStorage.setItem("uid", user.uid);

    // 3. REDIRECT IMMEDIATELY (NO BLOCKING)
    window.location.href = "dashboard.html";

  } catch (error) {
    alert("Login Failed: " + error.message);
    console.error(error);
  }
};
