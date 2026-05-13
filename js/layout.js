import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   SIDEBAR TOGGLE
========================= */
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed");
}

/* =========================
   LOGOUT (ONLY ONE SYSTEM)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("logoutBtn");

  if (btn) {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        await signOut(auth);

        // clear all local data
        localStorage.clear();

        // redirect to index page
        window.location.href = "/index.html";

      } catch (error) {
        console.error("Logout failed:", error);
      }
    });
  }
});
