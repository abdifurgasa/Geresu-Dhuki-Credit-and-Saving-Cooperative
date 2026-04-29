import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.loginFirebase = async function () {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("UID:", user.uid);

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    // 🔥 AUTO CREATE USER IF NOT EXISTS
    if (!snap.exists()) {

      await setDoc(userRef, {
        email: user.email,
        role: "user" // default role
      });

      console.log("User created in Firestore");
    }

    window.location.href = "dashboard.html";

  } catch (error) {
    alert("Login Failed: " + error.message);
    console.error(error);
  }
};
