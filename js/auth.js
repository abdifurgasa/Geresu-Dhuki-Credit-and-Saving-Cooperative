import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOGIN
========================= */
window.login = async function () {

  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  try {

    const userCred = await signInWithEmailAndPassword(auth, email, password);

    const uid = userCred.user.uid;

    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      alert("No role assigned!");
      return;
    }

    const role = snap.data().role;

    localStorage.setItem("role", role);

    window.location.href = "dashboard.html";

  } catch (err) {
    alert("Login failed");
    console.error(err);
  }
};

/* =========================
   LOGOUT (FIXED + GLOBAL SAFE)
========================= */
window.logoutUser = async function () {

  try {

    await signOut(auth);

    localStorage.removeItem("role");
    sessionStorage.clear();

    window.location.href = "index.html";

  } catch (err) {

    console.error(err);

    alert("Logout failed");
  }
};
/* =========================
   AUTH GUARD (PROTECT PAGES)
========================= */
export function protectPage(){

  onAuthStateChanged(auth, (user) => {

    if (!user) {
      window.location.href = "index.html";
    }

  });

}

/* =========================
   ROLE CHECK
========================= */
export function requireRole(roleRequired){

  let role = localStorage.getItem("role");

  if (role !== roleRequired && role !== "admin") {
    alert("Access denied");
    window.location.href = "dashboard.html";
  }

}
