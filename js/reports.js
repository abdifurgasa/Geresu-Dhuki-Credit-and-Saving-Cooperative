
import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   ELEMENTS
========================= */
const totalMembers =
  document.getElementById("totalMembers");

const totalSavings =
  document.getElementById("totalSavings");

const totalLoans =
  document.getElementById("totalLoans");

const totalRepayments =
  document.getElementById("totalRepayments");

const outstandingLoans =
  document.getElementById("outstandingLoans");

const netBalance =
  document.getElementById("netBalance");

/* =========================
   LOAD REPORT DATA
========================= */
async function loadReports() {

  /* MEMBERS */
  const membersSnap =
    await getDocs(collection(db, "members"));

  const membersCount =
    membersSnap.size;

  /* SAVINGS */
  const savingsSnap =
    await getDocs(collection(db, "savings"));

  let savingsTotal = 0;

  savingsSnap.forEach(d => {

    savingsTotal += d.data().amount || 0;
  });

  /* LOANS */
  const loansSnap =
    await getDocs(collection(db, "loans"));

  let loanTotal = 0;
  let outstanding = 0;

  loansSnap.forEach(d => {

    const l = d.data();

    loanTotal += l.total || 0;
    outstanding += l.remaining || 0;
  });

  /* REPAYMENTS */
  const repaySnap =
    await getDocs(collection(db, "repayments"));

  let repayTotal = 0;

  repaySnap.forEach(d => {

    repayTotal += d.data().amount || 0;
  });

  /* NET BALANCE */
  const net =
    savingsTotal - outstanding;

  /* DISPLAY RESULTS */
  totalMembers.innerText =
    membersCount;

  totalSavings.innerText =
    savingsTotal + " ETB";

  totalLoans.innerText =
    loanTotal + " ETB";

  totalRepayments.innerText =
    repayTotal + " ETB";

  outstandingLoans.innerText =
    outstanding + " ETB";

  netBalance.innerText =
    net + " ETB";
}

/* =========================
   AUTO REFRESH
========================= */
loadReports();

setInterval(loadReports, 5000);
