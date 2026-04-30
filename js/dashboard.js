import { db } from "./firebase.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   STATS LOADER
========================= */
function loadStats(){

  onSnapshot(collection(db, "members"), snap => {
    document.getElementById("membersCount").innerText = snap.size;
  });

  onSnapshot(collection(db, "savings"), snap => {
    let total = 0;
    snap.forEach(d => total += Number(d.data().amount || 0));
    document.getElementById("savingsTotal").innerText = "$" + total.toLocaleString();
  });

  onSnapshot(collection(db, "loans"), snap => {
    let total = 0;
    snap.forEach(d => total += Number(d.data().amount || 0));
    document.getElementById("loansTotal").innerText = "$" + total.toLocaleString();
  });

  // PROFIT = savings - loans
  onSnapshot(collection(db, "savings"), s1 => {
    onSnapshot(collection(db, "loans"), s2 => {

      let savings = 0;
      let loans = 0;

      s1.forEach(d => savings += Number(d.data().amount || 0));
      s2.forEach(d => loans += Number(d.data().amount || 0));

      let profit = savings - loans;

      document.getElementById("profitTotal").innerText =
        "$" + profit.toLocaleString();

    });
  });

}

/* INIT */
document.addEventListener("DOMContentLoaded", loadStats);
