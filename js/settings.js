import { auth, db } from "./firebase.js";
import {
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD USER INFO
========================= */

async function loadUser() {

  const user = auth.currentUser;

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {

    const data = snap.data();

    document.getElementById("userName").innerText =
      "Name: " + (data.name || "-");

    document.getElementById("userEmail").innerText =
      "Email: " + user.email;

    document.getElementById("userRole").innerText =
      "Role: " + (data.role || "-");
  }
}

auth.onAuthStateChanged(() => {
  loadUser();
});

/* =========================
   CHANGE PASSWORD
========================= */

window.changePassword = async function () {

  const user = auth.currentUser;

  const newPass = document.getElementById("newPassword").value;

  if (!newPass || newPass.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  try {

    await updatePassword(user, newPass);

    alert("Password updated successfully");

  } catch (err) {
    console.error(err);
    alert("Error updating password");
  }
};

/* =========================
   LOGOUT
========================= */

window.logoutUser = async function () {

  await auth.signOut();

  localStorage.clear();

  window.location.href = "index.html";
};
