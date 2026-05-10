import { auth } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   ROLE FROM STORAGE
========================= */
const role =
  localStorage.getItem("role");

/* =========================
   PAGE PROTECTION
========================= */
onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href =
      "index.html";

    return;
  }

  protectByRole();
});

/* =========================
   ROLE ACCESS CONTROL
========================= */
function protectByRole() {

  const path =
    window.location.pathname;

/* ---------- ADMIN ONLY ---------- */
  const adminPages = [
    "users.html",
    "settings.html"
  ];

/* ---------- TELLER + ADMIN ---------- */
  const tellerPages = [
    "members.html",
    "savings.html",
    "transactions.html"
  ];

/* ---------- AUDITOR ONLY ---------- */
  const auditorPages = [
    "reports.html"
  ];

  const file =
    path.split("/").pop();

/* =========================
   ADMIN FULL ACCESS
========================= */
  if (role === "admin")
    return;

/* =========================
   TELLER RULE
========================= */
  if (role === "teller") {

    if (adminPages.includes(file)) {

      denyAccess();
    }

    return;
  }

/* =========================
   AUDITOR RULE
========================= */
  if (role === "auditor") {

    if (
      file !== "reports.html"
    ) {

      denyAccess();
    }

    return;
  }

/* =========================
   UNKNOWN ROLE
========================= */
  denyAccess();
}

/* =========================
   BLOCK ACCESS
========================= */
function denyAccess() {

  alert("Access denied");

  window.location.href =
    "dashboard.html";
}
