import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   LOGOUT BUTTON
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("logoutBtn");

  if (btn) {

    btn.addEventListener("click", async (e) => {

      e.preventDefault();

      const ok = confirm("Are you sure you want to logout?");
      if (!ok) return;

      try {
        await signOut(auth);
        localStorage.clear();

        // GitHub Pages redirect
        window.location.href = "/Geresu-Dhuki-Credit-and-Saving-Cooperative/index.html";

      } catch (err) {
        console.error(err);
        alert("Logout failed");
      }

    });

  }

});


/* =========================
   SESSION TIMEOUT (5 MIN)
========================= */

let timeout;
const TIME_LIMIT = 5 * 60 * 1000;

function resetTimer() {
  clearTimeout(timeout);

  timeout = setTimeout(async () => {

    alert("Session expired. You will be logged out.");

    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }

    localStorage.clear();

    window.location.href = "/Geresu-Dhuki-Credit-and-Saving-Cooperative/index.html";

  }, TIME_LIMIT);
}

// user activity events
window.addEventListener("mousemove", resetTimer);
window.addEventListener("keydown", resetTimer);
window.addEventListener("click", resetTimer);
window.addEventListener("scroll", resetTimer);

// start timer
resetTimer();
