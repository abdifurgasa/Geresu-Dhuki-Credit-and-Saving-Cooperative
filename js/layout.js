import { auth } from "./firebase.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   SIDEBAR TOGGLE
========================= */
window.toggleSidebar = function () {
  document
    .getElementById("sidebar")
    .classList.toggle("collapsed");
};

/* =========================
   AUTH CHECK
========================= */
onAuthStateChanged(auth, (user) => {

  // If user not logged in
  if (!user) {

    window.location.href = "/index.html";

  }

});

/* =========================
   LOGOUT BUTTON
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {

    logoutBtn.addEventListener("click", async (e) => {

      e.preventDefault();

      const confirmLogout = confirm(
        "Are you sure you want to logout?"
      );

      if (!confirmLogout) return;

      await logout();

    });

  }

  // Start session timeout
  startSessionTimeout();

});

/* =========================
   LOGOUT FUNCTION
========================= */
async function logout() {

  try {

    // Firebase logout
    await signOut(auth);

    // Clear storage
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to login/index page
    window.location.href = "/index.html";

  } catch (error) {

    console.error("Logout Error:", error);

  }

}

/* =========================
   SESSION TIMEOUT
========================= */

// 5 minutes
const SESSION_LIMIT = 5 * 60 * 1000;

let timeout;

/* =========================
   RESET TIMER
========================= */
function resetTimer() {

  clearTimeout(timeout);

  timeout = setTimeout(async () => {

    alert("Session expired. Please login again.");

    await logout();

  }, SESSION_LIMIT);

}

/* =========================
   START SESSION TIMEOUT
========================= */
function startSessionTimeout() {

  [
    "click",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart"
  ].forEach(event => {

    document.addEventListener(event, resetTimer);

  });

  resetTimer();

}
