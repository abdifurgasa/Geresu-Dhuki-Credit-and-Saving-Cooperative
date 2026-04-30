import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOGIN FUNCTION (GLOBAL FIX)
========================= */
window.login = async function () {

  console.log("LOGIN CLICKED"); // DEBUG

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  try {

    const userCred = await signInWithEmailAndPassword(auth, email, password);

    const uid = userCred.user.uid;

    const snap = await getDoc(doc(db, "users", uid));

    let role = "member";

    if (snap.exists()) {
      role = snap.data().role;
    }

    localStorage.setItem("role", role);

    console.log("LOGIN SUCCESS ROLE:", role);

    window.location.href = "dashboard.html";

  } catch (error) {

    console.error("LOGIN ERROR:", error);
    alert(error.message);

  }

};
