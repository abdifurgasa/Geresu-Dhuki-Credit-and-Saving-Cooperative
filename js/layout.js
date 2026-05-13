import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("logoutBtn");

  if (btn) {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();

      const confirmLogout = confirm("Are you sure you want to logout?");
      if (!confirmLogout) return;

      await signOut(auth);
      localStorage.clear();
      window.location.href = "/index.html";
    });
  }
});

window.toggleSidebar = function () {
  document.getElementById("sidebar").classList.toggle("collapsed");
};
