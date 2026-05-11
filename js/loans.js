import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GLOBAL STATE
========================= */

let selectedMember = null;

let calculated = {
  monthly: 0,
  total: 0,
  interest: 0
};

/* =========================
   SEARCH MEMBERS
========================= */

window.searchMembers = async function () {

  const keyword =
    document.getElementById("memberSearch")
      .value
      .toLowerCase()
      .trim();

  const box =
    document.getElementById("searchResults");

  box.innerHTML = "";

  if (!keyword) return;

  const snapshot =
    await getDocs(collection(db, "members"));

  snapshot.forEach(docSnap => {

    const m = docSnap.data();

    const text = `
      ${m.name}
      ${m.phone}
      ${m.nid}
    `.toLowerCase();

    if (text.includes(keyword)) {

      const div =
        document.createElement("div");

      div.className = "result-item";

      div.innerHTML = `
        👤 ${m.name}<br>
        📱 ${m.phone}<br>
        🆔 ${m.nid}
      `;

      div.onclick = () =>
        selectMember(docSnap.id, m);

      box.appendChild(div);
    }
  });
};

/* =========================
   SELECT MEMBER
========================= */

function selectMember(id, m) {

  selectedMember = {
    id,
    ...m
  };

  document.getElementById(
    "selectedMember"
  ).innerHTML = `
    👤 ${m.name}<br>
    📱 ${m.phone}<br>
    🆔 ${m.nid}
  `;

  document.getElementById(
    "searchResults"
  ).innerHTML = "";
}

/* =========================
   LOAN CALCULATION
========================= */

window.calculateLoan = function () {

  const amount =
    Number(document.getElementById("loanAmount").value);

  const interest =
    Number(document.getElementById("interestRate").value);

  const duration =
    Number(document.getElementById("duration").value);

  const type =
    document.getElementById("durationType").value;

  if (!amount || !interest || !duration) {
    alert("Fill all fields");
    return;
  }

  let months =
    type === "years"
      ? duration * 12
      : duration;

  let totalInterest =
    (amount * interest * months) / 100;

  let total =
    amount + totalInterest;

  let monthly =
    total / months;

  calculated = {
    monthly,
    total,
    interest: totalInterest
  };

  document.getElementById("monthlyPayment").innerText =
    monthly.toFixed(2) + " ETB";

  document.getElementById("totalRepayment").innerText =
    total.toFixed(2) + " ETB";

  document.getElementById("totalInterest").innerText =
    totalInterest.toFixed(2) + " ETB";
};

/* =========================
   CREATE LOAN (WITH BLOCKING)
========================= */

window.createLoan = async function () {

  if (!selectedMember) {
    alert("Select member first");
    return;
  }

  const amount =
    Number(document.getElementById("loanAmount").value);

  const interest =
    Number(document.getElementById("interestRate").value);

  const duration =
    Number(document.getElementById("duration").value);

  const type =
    document.getElementById("durationType").value;

  if (!amount || !interest || !duration) {
    alert("Fill all fields");
    return;
  }

  /* =========================
     CHECK ACTIVE LOAN
  ========================= */

  const snapshot =
    await getDocs(collection(db, "loans"));

  let hasActiveLoan = false;

  snapshot.forEach(docSnap => {

    const l = docSnap.data();

    if (
      l.memberId === selectedMember.id &&
      l.status === "active"
    ) {
      hasActiveLoan = true;
    }
  });

  if (hasActiveLoan) {
    alert("❌ Please Finish Your Loan First");
    return;
  }

  /* =========================
     CALCULATION
  ========================= */

  let months =
    type === "years"
      ? duration * 12
      : duration;

  let totalInterest =
    (amount * interest * months) / 100;

  let total =
    amount + totalInterest;

  let monthly =
    total / months;

  /* =========================
     SAVE LOAN
  ========================= */

  await addDoc(collection(db, "loans"), {

    memberId: selectedMember.id,
    memberName: selectedMember.name,
    phone: selectedMember.phone,

    principal: amount,
    interest,
    durationMonths: months,

    monthlyPayment: monthly,
    totalInterest,
    totalAmount: total,

    paid: 0,
    remaining: total,

    status: "active",

    createdAt: serverTimestamp(),
    date: new Date().toISOString()
  });

  alert("Loan created successfully");

  clearForm();
};

/* =========================
   CLEAR FORM
========================= */

function clearForm() {

  document.getElementById("loanAmount").value = "";
  document.getElementById("interestRate").value = "";
  document.getElementById("duration").value = "";

  document.getElementById("monthlyPayment").innerText = "0 ETB";
  document.getElementById("totalRepayment").innerText = "0 ETB";
  document.getElementById("totalInterest").innerText = "0 ETB";
}

/* =========================
   REALTIME TABLE
========================= */

function loadLoans() {

  const table =
    document.getElementById("loanTable");

  onSnapshot(collection(db, "loans"), (snapshot) => {

    table.innerHTML = "";

    snapshot.forEach(docSnap => {

      const l = docSnap.data();

      table.innerHTML += `
        <tr>
          <td>${l.memberName}</td>
          <td>${l.principal} ETB</td>
          <td>${l.interest}%</td>
          <td>${l.durationMonths} mo</td>
          <td>${l.monthlyPayment.toFixed(2)}</td>
          <td>${l.totalAmount.toFixed(2)}</td>
          <td>${l.paid || 0}</td>
          <td>${l.remaining.toFixed(2)}</td>
          <td>
            <span class="status ${
              l.status === "active"
                ? "pending"
                : "active"
            }">
              ${l.status}
            </span>
          </td>
        </tr>
      `;
    });
  });
}

/* =========================
   INIT
========================= */

loadLoans();
