import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   SIDEBAR TOGGLE
========================= */
window.toggleSidebar = function () {
  document.getElementById("sidebar").classList.toggle("collapsed");
};

/* =========================
   LOGOUT WITH CONFIRMATION
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("logoutBtn");

  if (btn) {

    btn.addEventListener("click", async (e) => {

      e.preventDefault();

      // confirmation popup
      const confirmLogout = confirm("Are you sure you want to logout?");

      if (!confirmLogout) return;

      try {

        // Firebase logout
        await signOut(auth);

        // clear local data
        localStorage.clear();

        // redirect to index page
        window.location.href = "/index.html";

      } catch (error) {

        console.error("Logout failed:", error);
        alert("Logout failed!");

      }

    });

  }

});
