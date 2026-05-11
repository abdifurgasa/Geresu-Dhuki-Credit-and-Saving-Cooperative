import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GLOBAL USER SESSION
========================= */

export let currentUser = null;
export let currentRole = null;

/* =========================
   AUTH GUARD
========================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    alert("User profile missing");
    window.location.href = "index.html";
    return;
  }

  currentRole = snap.data().role;

  applyRoleUI(currentRole);
  protectPage(currentRole);
});

/* =========================
   ROLE PROTECTION
========================= */

function protectPage(role) {

  const path = window.location.pathname;

  // ADMIN ONLY PAGES
  const adminPages = [
    "users.html",
    "reports.html",
    "members.html",
    "settings.html"
  ];

  if (adminPages.some(p => path.includes(p)) && role !== "admin") {
    alert("Access denied");
    window.location.href = "dashboard.html";
  }
}

/* =========================
   UI ROLE CONTROL
========================= */

function applyRoleUI(role) {

  if (role === "member") {

    document.querySelectorAll(".admin-only")
      .forEach(el => el.style.display = "none");
  }

  if (role === "teller") {
    // teller can see limited admin tools
    document.querySelectorAll(".admin-only")
      .forEach(el => el.style.display = "none");
  }

  if (role === "admin") {
    // show everything
    document.querySelectorAll(".admin-only")
      .forEach(el => el.style.display = "flex");
  }
}

/* =========================
   LOGOUT (FIXED)
========================= */

window.logoutUser = async function () {

  await auth.signOut();

  localStorage.clear();

  window.location.href = "index.html";
};
