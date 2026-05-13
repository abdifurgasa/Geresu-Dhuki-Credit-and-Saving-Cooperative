import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

        // ✅ SAME FOLDER FIX
        window.location.href = "index.html";

      } catch (error) {
        console.error(error);
        alert("Logout failed!");
      }

    });

  }

});
