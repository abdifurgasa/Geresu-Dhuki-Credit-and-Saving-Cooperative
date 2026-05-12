import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GLOBAL STATE
========================= */

let selectedMember = null;
let isProcessing = false;

/* =========================
   SEARCH MEMBER
========================= */

window.searchMembers = async function () {

  const keyword = document.getElementById("memberSearch")
    .value.toLowerCase().trim();

  const box = document.getElementById("searchResults");

  box.innerHTML = "";

  if (!keyword) return;

  const snapshot = await getDocs(collection(db, "members"));

  snapshot.forEach(docSnap => {

    const m = docSnap.data();
    const text = `${m.name} ${m.phone} ${m.nid}`.toLowerCase();

    if (text.includes(keyword)) {

      const div = document.createElement("div");

      div.className = "result-item";

      div.innerHTML = `
        👤 ${m.name}<br>
        📱 ${m.phone}<br>
        🆔 ${m.nid}
      `;

      div.onclick = () => selectMember(docSnap.id, m);

      box.appendChild(div);
    }
  });
};

/* =========================
   SELECT MEMBER
========================= */

function selectMember(id, m) {

  selectedMember = { id, ...m };

  document.getElementById("selectedMember").innerHTML = `
    👤 ${m.name}<br>
    📱 ${m.phone}<br>
    🆔 ${m.nid}
  `;

  document.getElementById("searchResults").innerHTML = "";
}

/* =========================
   CHECK ACTIVE LOAN
========================= */

async function hasActiveLoan(memberId) {

  const q = query(
    collection(db, "loans"),
    where("memberId", "==", memberId),
    where("status", "==", "active")
  );

  const snap = await getDocs(q);

  return !snap.empty;
}

/* =========================
   LOAN ENGINE (CLEAN)
========================= */

function calculateLoan(principal, rate, years, type) {

  const r = rate / 100;

  let totalInterest = 0;
  let totalAmount = 0;

  // SIMPLE
  if (type === "simple") {

    totalInterest = principal * r * years;
    totalAmount = principal + totalInterest;
  }

  // COMPOUND (monthly)
  else if (type === "compound") {

    const n = 12;

    totalAmount =
      principal * Math.pow((1 + r / n), (n * years));

    totalInterest = totalAmount - principal;
  }

  // FLAT RATE
  else if (type === "flat") {

    totalInterest = principal * r * years;
    totalAmount = principal + totalInterest;
  }

  return { totalAmount, totalInterest };
}

/* =========================
   CALCULATE BUTTON
========================= */

window.calculateLoan = function () {

  const principal = Number(document.getElementById("loanAmount").value);
  const rate = Number(document.getElementById("interestRate").value);
  const duration = Number(document.getElementById("duration").value);

  const durationType = document.getElementById("durationType").value;
  const interestType = document.getElementById("interestType").value;

  if (!principal || !rate || !duration) {
    alert("Fill all fields");
    return;
  }

  const years = durationType === "years"
    ? duration
    : duration / 12;

  const result = calculateLoan(
    principal,
    rate,
    years,
    interestType
  );

  const months = durationType === "years"
    ? duration * 12
    : duration;

  const monthly = result.totalAmount / months;

  document.getElementById("monthlyPayment").innerText =
    monthly.toFixed(2) + " ETB";

  document.getElementById("totalRepayment").innerText =
    result.totalAmount.toFixed(2) + " ETB";

  document.getElementById("totalInterest").innerText =
    result.totalInterest.toFixed(2) + " ETB";
};

/* =========================
   CREATE LOAN (FIXED)
========================= */

window.createLoan = async function () {

  if (isProcessing) return;

  if (!selectedMember) {
    alert("Select member first");
    return;
  }

  const principal = Number(document.getElementById("loanAmount").value);
  const rate = Number(document.getElementById("interestRate").value);
  const duration = Number(document.getElementById("duration").value);

  const durationType = document.getElementById("durationType").value;
  const interestType = document.getElementById("interestType").value;

  if (!principal || !rate || !duration) {
    alert("Fill all fields");
    return;
  }

  if (await hasActiveLoan(selectedMember.id)) {
    alert("❌ Please finish your existing loan first");
    return;
  }

  try {

    isProcessing = true;

    const years = durationType === "years"
      ? duration
      : duration / 12;

    const result = calculateLoan(
      principal,
      rate,
      years,
      interestType
    );

    const months = durationType === "years"
      ? duration * 12
      : duration;

    const monthly = result.totalAmount / months;

    await addDoc(collection(db, "loans"), {

      memberId: selectedMember.id,
      memberName: selectedMember.name,
      phone: selectedMember.phone,

      principal,
      interestRate: rate,
      interestType,

      durationMonths: months,

      totalAmount: result.totalAmount,
      totalInterest: result.totalInterest,

      monthlyPayment: monthly,

      paid: 0,
      remaining: result.totalAmount,

      status: "active",

      createdAt: serverTimestamp()
    });

    alert("✅ Loan created successfully");

    clearForm();

  } catch (err) {

    console.error(err);
    alert("❌ Error creating loan");

  } finally {

    isProcessing = false;
  }
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
   LOAD LOANS TABLE
========================= */

function loadLoans() {

  const table = document.getElementById("loanTable");

  onSnapshot(collection(db, "loans"), (snap) => {

    table.innerHTML = "";

    snap.forEach(docSnap => {

      const l = docSnap.data();

      table.innerHTML += `
        <tr>
          <td>${l.memberName}</td>
          <td>${l.principal}</td>
          <td>${l.interestRate}% (${l.interestType})</td>
          <td>${l.durationMonths}</td>
          <td>${l.monthlyPayment.toFixed(2)}</td>
          <td>${l.totalAmount.toFixed(2)}</td>
          <td>${l.paid}</td>
          <td>${l.remaining.toFixed(2)}</td>
          <td>${l.status}</td>
        </tr>
      `;
    });
  });
}

loadLoans();
