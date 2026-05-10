import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   DISTRIBUTE PROFIT
========================= */
window.distributeProfit = async function () {

  const totalProfit =
    Number(prompt("Total yearly profit"));

  const savingsSnap =
    await getDocs(collection(db, "savings"));

  let totalSavings = 0;

  savingsSnap.forEach(doc => {
    totalSavings += doc.data().amount;
  });

  for (const document of savingsSnap.docs) {

    const data = document.data();

    const sharePercent =
      data.amount / totalSavings;

    const memberProfit =
      totalProfit * sharePercent;

    await addDoc(collection(db, "profitShares"), {

      uid: data.uid,

      savings: data.amount,

      sharePercent,

      profit: memberProfit,

      year: new Date().getFullYear()
    });
  }

  alert("Profit distributed");
};
