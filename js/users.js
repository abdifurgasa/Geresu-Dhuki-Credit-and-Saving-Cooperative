import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   SAVE USER
========================= */
window.saveUser = async function () {

  const fullName =
    document.getElementById("fullName").value;

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  const role =
    document.getElementById("role").value;

  try {

    /* 1. CREATE AUTH USER */
    const userCred =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    /* 2. SAVE TO FIRESTORE (THIS IS YOUR CODE) */
    await setDoc(
      doc(db, "users", userCred.user.uid),
      {
        uid: userCred.user.uid,
        email: userCred.user.email,
        name: fullName,
        role: role
      }
    );

    alert("User created successfully");

  } catch (err) {

    console.error(err);
    alert(err.message);
  }
};
