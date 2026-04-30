import { db } from "./firebase.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let charts = {};

/* =========================
   SAVINGS CHART
========================= */
function savingsChart(){

  onSnapshot(collection(db, "savings"), snap => {

    let labels = [];
    let data = [];

    snap.forEach(d => {
      labels.push(d.data().date || "");
      data.push(d.data().amount || 0);
    });

    if(charts.savings) charts.savings.destroy();

    charts.savings = new Chart(
      document.getElementById("savingsChart"),
      {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "Savings",
            data,
            borderColor: "#1cc88a"
          }]
        }
      }
    );

  });

}

/* =========================
   LOANS VS REPAYMENTS
========================= */
function loanChart(){

  let loans = 0;
  let repayments = 0;

  onSnapshot(collection(db, "loans"), snap => {
    loans = 0;
    snap.forEach(d => loans += d.data().amount || 0);
    update();
  });

  onSnapshot(collection(db, "transactions"), snap => {
    repayments = 0;
    snap.forEach(d => {
      if(d.data().type === "Repayment"){
        repayments += d.data().amount || 0;
      }
    });
    update();
  });

  function update(){

    if(charts.loan) charts.loan.destroy();

    charts.loan = new Chart(
      document.getElementById("loanChart"),
      {
        type: "bar",
        data: {
          labels: ["Loans", "Repayments"],
          datasets: [{
            data: [loans, repayments],
            backgroundColor: ["#f6c23e", "#1cc88a"]
          }]
        }
      }
    );

  }

}

/* =========================
   MEMBERS CHART
========================= */
function memberChart(){

  onSnapshot(collection(db, "members"), snap => {

    if(charts.member) charts.member.destroy();

    charts.member = new Chart(
      document.getElementById("memberChart"),
      {
        type: "doughnut",
        data: {
          labels: ["Members"],
          datasets: [{
            data: [snap.size],
            backgroundColor: ["#4e73df"]
          }]
        }
      }
    );

  });

}

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  savingsChart();
  loanChart();
  memberChart();
});
