import { db, auth } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loanTable = document.getElementById("loanTable");
const memberSelect = document.getElementById("member");

/* =========================
   INTEREST ENGINE
========================= */
function calculateLoan(amount, rate, type, durationValue, durationType) {

  let months = durationType === "years"
    ? durationValue * 12
    : durationValue;

  let total = 0;

  if (type === "simple") {
    const interest = (amount * rate * months) / 12 / 100;
    total = amount + interest;
  }

  else if (type === "flat") {
    const interest = (amount * rate) / 100;
    total = amount + interest;
  }

  else if (type === "compound") {
    total = amount * Math.pow((1 + rate / 100 / 12), months);
  }

  return {
    totalPayable: Number(total.toFixed(2)),
    months
  };
}

/* =========================
   LOAD MEMBERS
========================= */
async function loadMembers() {

  const snap = await getDocs(collection(db, "members"));

  memberSelect.innerHTML = `<option value="">Select Member</option>`;

  snap.forEach(d => {
    const m = d.data();
    memberSelect.innerHTML += `
      <option value="${d.id}">${m.name}</option>
    `;
  });
}

/* =========================
   LOAD LOANS
========================= */
async function loadLoans() {

  loanTable.innerHTML = "";

  const snap = await getDocs(collection(db, "loans"));

  snap.forEach(d => {

    const l = d.data();

    loanTable.innerHTML += `
      <tr>
        <td>${l.memberName}</td>
        <td>${l.loanAmount}</td>
        <td>${l.interestType}</td>
        <td>${l.interestRate}%</td>
        <td>${l.durationValue} ${l.durationType}</td>
        <td>${l.totalPayable}</td>
        <td>${l.remainingLoan}</td>
        <td>${l.status}</td>
      </tr>
    `;
  });
}

/* =========================
   CREATE LOAN
========================= */
document.getElementById("loanForm")
.addEventListener("submit", async (e) => {

  e.preventDefault();

  const memberId = document.getElementById("member").value;
  const amount = Number(document.getElementById("amount").value);
  const interest = Number(document.getElementById("interest").value);
  const interestType = document.getElementById("interestType").value;

  const durationValue = Number(document.getElementById("durationValue").value);
  const durationType = document.getElementById("durationType").value;

  const memberRef = doc(db, "members", memberId);
  const memberSnap = await getDoc(memberRef);

  if (!memberSnap.exists()) {
    alert("Member not found");
    return;
  }

  const member = memberSnap.data();

  const result = calculateLoan(
    amount,
    interest,
    interestType,
    durationValue,
    durationType
  );

  const user = auth.currentUser;

  await addDoc(collection(db, "loans"), {

    memberId,
    memberName: member.name,

    loanAmount: amount,
    interestRate: interest,
    interestType,

    durationValue,
    durationType,
    durationMonths: result.months,

    totalPayable: result.totalPayable,
    remainingLoan: result.totalPayable,

    status: "active",

    createdAt: serverTimestamp(),
    createdBy: user ? user.uid : null
  });

  await updateDoc(memberRef, {
    loanTotal: result.totalPayable,
    loanRemaining: result.totalPayable
  });

  alert("Loan created successfully!");

  document.getElementById("loanForm").reset();
  closeModal();
  loadLoans();
});

/* =========================
   SEARCH
========================= */
document.getElementById("searchInput")
.addEventListener("input", function () {

  const val = this.value.toLowerCase();

  document.querySelectorAll("#loanTable tr").forEach(row => {
    row.style.display =
      row.innerText.toLowerCase().includes(val) ? "" : "none";
  });
});

/* INIT */
loadMembers();
loadLoans();
