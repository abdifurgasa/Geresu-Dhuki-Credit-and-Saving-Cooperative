iimport { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("logoutBtn");

  if (!btn) return;

  btn.addEventListener("click", async (e) => {

    e.preventDefault();

    const ok = confirm("Are you sure you want to logout?");
    if (!ok) return;

    try {
      await signOut(auth);
      localStorage.clear();

      // ✅ GITHUB PAGES FIX
      window.location.href = "/Geresu-Dhuki-Credit-and-Saving-Cooperative/index.html";

    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }

  });

});
