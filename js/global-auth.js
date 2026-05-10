import { auth } from "./firebase.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   PROTECT DASHBOARD PAGES
========================= */
onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href =
      "index.html";
  }
});

/* =========================
   LOGOUT SYSTEM
========================= */
window.logoutUser = async function () {

  try {

    await signOut(auth);

    localStorage.clear();

    sessionStorage.clear();

    window.location.href =
      "index.html";

  }

  catch (err) {

    console.error(err);

    alert("Logout failed");
  }
};
