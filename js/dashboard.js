import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD DASHBOARD DATA
========================= */
async function loadDashboard() {

  try {

    /* =====================
       TOTAL MEMBERS
    ===================== */
    const membersSnap =
      await getDocs(
        collection(db, "members")
      );

    const totalMembers =
      membersSnap.size;

    document.getElementById("members").innerText =
      totalMembers;

    /* =====================
       TOTAL SAVINGS
    ===================== */
    const savingsSnap =
      await getDocs(
        collection(db, "savings")
      );

    let totalSavings = 0;

    savingsSnap.forEach((doc) => {

      const data = doc.data();

      totalSavings += Number(
        data.amount || 0
      );
    });

    document.getElementById("savings").innerText =
      totalSavings.toLocaleString() + " ETB";

    /* =====================
       TOTAL LOANS
    ===================== */
    const loansSnap =
      await getDocs(
        collection(db, "loans")
      );

    let totalLoans = 0;
    let totalProfit = 0;

    loansSnap.forEach((doc) => {

      const data = doc.data();

      totalLoans += Number(
        data.amount || 0
      );

      totalProfit += Number(
        data.interest || 0
      );
    });

    document.getElementById("loans").innerText =
      totalLoans.toLocaleString() + " ETB";

    /* =====================
       TOTAL PROFIT
    ===================== */
    document.getElementById("profit").innerText =
      totalProfit.toLocaleString() + " ETB";

  }

  catch (err) {

    console.error(
      "Dashboard Error:",
      err
    );

    alert(
      "Failed to load dashboard data"
    );
  }
}

/* =========================
   LOAD DASHBOARD
========================= */
loadDashboard();

/* =========================
   SIDEBAR COLLAPSE
========================= */
const sidebar =
  document.getElementById("sidebar");

/* LOAD SAVED STATE */
if (
  localStorage.getItem("sidebar")
  === "collapsed"
) {

  sidebar.classList.add(
    "collapsed"
  );
}

/* TOGGLE SIDEBAR */
window.toggleSidebar = function () {

  sidebar.classList.toggle(
    "collapsed"
  );

  localStorage.setItem(

    "sidebar",

    sidebar.classList.contains(
      "collapsed"
    )

    ? "collapsed"

    : "expanded"
  );
};

/* =========================
   ACTIVE NAVIGATION
========================= */
document
  .querySelectorAll(".nav-item")
  .forEach((link) => {

    if (
      link.href ===
      window.location.href
    ) {

      link.classList.add(
        "active"
      );
    }
});

/* =========================
   LOGOUT SYSTEM
========================= */
window.logoutUser = function () {

  localStorage.clear();

  sessionStorage.clear();

  window.location.href =
    "index.html";
};
