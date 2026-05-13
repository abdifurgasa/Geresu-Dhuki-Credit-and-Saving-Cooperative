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

  if (!user) {
    window.location.href = "/index.html";
  }

});

/* =========================
   PAGE LOADED
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {

    logoutBtn.addEventListener("click", async (e) => {

      e.preventDefault();

      try {

        await signOut(auth);

        localStorage.clear();
        sessionStorage.clear();

        window.location.href = "/index.html";

      } catch (error) {

        console.error("Logout failed:", error);
        alert("Logout failed");

      }

    });

  }

  startSessionTimeout();

});

/* =========================
   SESSION TIMEOUT
========================= */

const SESSION_LIMIT = 5 * 60 * 1000;

let timeout;

function resetTimer() {

  clearTimeout(timeout);

  timeout = setTimeout(async () => {

    alert("Session expired");

    try {

      await signOut(auth);

      localStorage.clear();
      sessionStorage.clear();

      window.location.href = "/index.html";

    } catch (error) {

      console.error(error);

    }

  }, SESSION_LIMIT);

}

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
