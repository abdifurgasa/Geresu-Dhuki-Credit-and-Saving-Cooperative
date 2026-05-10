import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function loadAnalytics() {

  const savings =
    await getDocs(collection(db, "savings"));

  const loans =
    await getDocs(collection(db, "loans"));

  const transactions =
    await getDocs(collection(db, "transactions"));

  let savingsTotal = 0;
  let loansTotal = 0;
  let repayments = 0;

  savings.forEach(d => {
    savingsTotal += d.data().amount;
  });

  loans.forEach(d => {
    loansTotal += d.data().amount;
  });

  transactions.forEach(d => {

    if (d.data().type === "loan_repayment") {
      repayments += d.data().amount;
    }
  });

  new Chart(document.getElementById("financeChart"), {

    type: "bar",

    data: {

      labels: [
        "Savings",
        "Loans",
        "Repayments"
      ],

      datasets: [{

        label: "Financial Analytics",

        data: [
          savingsTotal,
          loansTotal,
          repayments
        ]
      }]
    }
  });
}

loadAnalytics();
