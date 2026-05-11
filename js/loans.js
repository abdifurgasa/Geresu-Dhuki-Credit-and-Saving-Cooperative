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

/* =========================
   SEARCH MEMBER
========================= */

window.searchMembers = async function () {

  const keyword = document.getElementById("memberSearch").value.toLowerCase().trim();
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
   COMPOUND INTEREST ENGINE
========================= */

function calculateCompound(principal, rate, years) {

  const n = 12; // monthly compounding

  const r = rate / 100;

  const amount =
    principal * Math.pow((1 + r / n), (n * years));

  const interest = amount - principal;

  return { amount, interest };
}

/* =========================
   CREATE LOAN (COMPOUND + PENALTY)
========================= */

window.createLoan = async function () {

  if (!selectedMember) {
    alert("Select member first");
    return;
  }

  const principal = Number(document.getElementById("loanAmount").value);
  const rate = Number(document.getElementById("interestRate").value);
  const duration = Number(document.getElementById("duration").value);
  const type = document.getElementById("durationType").value;

  if (!principal || !rate || !duration) {
    alert("Fill all fields");
    return;
  }

  /* ❌ ONE LOAN RULE */
  if (await hasActiveLoan(selectedMember.id)) {
    alert("❌ Please finish your existing loan first");
    return;
  }

  const years = type === "years" ? duration : duration / 12;

  /* =========================
     COMPOUND INTEREST CALC
  ========================= */

  const result = calculateCompound(principal, rate, years);

  const total = result.amount;
  const interest = result.interest;

  const monthly = total / (duration * (type === "years" ? 12 : 1));

  /* =========================
     PENALTY SYSTEM SETUP
  ========================= */

  const startDate = new Date();

  const nextDue = new Date();
  nextDue.setMonth(nextDue.getMonth() + 1);

  await addDoc(collection(db, "loans"), {

    memberId: selectedMember.id,
    memberName: selectedMember.name,
    phone: selectedMember.phone,

    principal,
    interestRate: rate,

    durationMonths: duration * (type === "years" ? 12 : 1),

    totalAmount: total,
    totalInterest: interest,

    monthlyPayment: monthly,

    paid: 0,
    remaining: total,

    status: "active",

    schedule: {
      startDate: startDate.toISOString(),
      nextDueDate: nextDue.toISOString(),
      penaltyRate: 2 // 2% monthly penalty
    },

    createdAt: serverTimestamp()
  });

  alert("Loan created successfully (Compound + Penalty enabled)");

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
   LOANS TABLE
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
          <td>${l.interestRate}%</td>
          <td>${l.durationMonths}</td>
          <td>${l.monthlyPayment.toFixed(2)}</td>
          <td>${l.totalAmount.toFixed(2)}</td>
          <td>${l.paid}</td>
          <td>${l.remaining.toFixed(2)}</td>
          <td>
            <span class="status ${
              l.status === "active" ? "pending" : "active"
            }">
              ${l.status}
            </span>
          </td>
        </tr>
      `;
    });
  });
}

loadLoans();
