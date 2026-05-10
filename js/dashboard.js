import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD DASHBOARD
========================= */
async function loadDashboard() {

  try {

    /* =====================
       MEMBERS
    ===================== */
    const memberSnap =
      await getDocs(collection(db, "members"));

    const totalMembers =
      memberSnap.size;

    document.getElementById("members").innerText =
      totalMembers;

    /* =====================
       SAVINGS
    ===================== */
    const savingsSnap =
      await getDocs(collection(db, "savings"));

    let totalSavings = 0;

    savingsSnap.forEach((doc) => {

      const data = doc.data();

      totalSavings += Number(data.amount || 0);
    });

    document.getElementById("savings").innerText =
      totalSavings.toLocaleString() + " ETB";

    /* =====================
       LOANS
    ===================== */
    const loanSnap =
      await getDocs(collection(db, "loans"));

    let totalLoans = 0;
    let totalProfit = 0;

    loanSnap.forEach((doc) => {

      const data = doc.data();

      totalLoans += Number(data.amount || 0);

      totalProfit += Number(data.interest || 0);
    });

    document.getElementById("loans").innerText =
      totalLoans.toLocaleString() + " ETB";

    /* =====================
       PROFIT
    ===================== */
    document.getElementById("profit").innerText =
      totalProfit.toLocaleString() + " ETB";

  }

  catch (err) {

    console.error("Dashboard Error:", err);
  }
}

/* =========================
   INIT
========================= */
loadDashboard();

/* =========================
   SIDEBAR COLLAPSE
========================= */
const sidebar =
  document.getElementById("sidebar");

if (
  localStorage.getItem("sidebar")
  === "collapsed"
) {

  sidebar.classList.add("collapsed");
}

window.toggleSidebar = function () {

  sidebar.classList.toggle("collapsed");

  localStorage.setItem(
    "sidebar",

    sidebar.classList.contains("collapsed")
      ? "collapsed"
      : "expanded"
  );
};

/* =========================
   ACTIVE MENU
========================= */
document.querySelectorAll(".nav-item")
  .forEach(link => {

    if (
      link.href === window.location.href
    ) {

      link.classList.add("active");
    }
});
