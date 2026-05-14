import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAN ENGINE
========================= */
function calculateLoan(p, r, t, typeTime, type) {

  p = Number(p);
  r = Number(r);
  t = Number(t);

  if (typeTime === "months") t = t / 12;

  let interest = 0;
  let total = 0;

  if (type === "simple") {
    interest = (p * r * t) / 100;
    total = p + interest;
  }

  if (type === "compound") {
    total = p * Math.pow((1 + r / 100), t);
    interest = total - p;
  }

  if (type === "flat") {
    interest = (p * r * t) / 100;
    total = p + interest;
  }

  return {
    principal: p,
    interest,
    total,
    remaining: total
  };
}

/* =========================
   MEMBER SEARCH
========================= */
const searchInput = document.getElementById("searchMember");
const resultsBox = document.getElementById("searchResults");
const selectedBox = document.getElementById("selectedMember");

let members = [];
let selectedMemberId = null;

/* LOAD MEMBERS */
async function loadMembers() {

  const snap = await getDocs(collection(db, "members"));

  members = [];

  snap.forEach(doc => {
    members.push({ id: doc.id, ...doc.data() });
  });
}

loadMembers();

/* SEARCH */
searchInput.addEventListener("input", (e) => {

  const value = e.target.value.toLowerCase();

  resultsBox.innerHTML = "";

  const filtered = members.filter(m =>
    m.name?.toLowerCase().includes(value) ||
    m.phone?.includes(value) ||
    m.nid?.includes(value)
  );

  filtered.forEach(m => {

    const div = document.createElement("div");

    div.className = "result-item";

    div.innerHTML = `
      👤 ${m.name}<br>
      📱 ${m.phone}<br>
      🆔 ${m.nid}
    `;

    div.onclick = () => {

      selectedMemberId = m.id;

      selectedBox.innerHTML = `
        👤 ${m.name}<br>
        📱 ${m.phone}<br>
        🆔 ${m.nid}<br>
        💰 Savings: ${m.savings || 0}
      `;

      searchInput.value = m.name;
      resultsBox.innerHTML = "";
    };

    resultsBox.appendChild(div);
  });

});

/* =========================
   CREATE LOAN
========================= */
document.getElementById("loanForm").addEventListener("submit", async (e) => {

  e.preventDefault();

  if (!selectedMemberId) {
    alert("Select member first!");
    return;
  }

  const p = document.getElementById("principal").value;
  const r = document.getElementById("rate").value;
  const t = document.getElementById("time").value;
  const tt = document.getElementById("timeType").value;
  const type = document.getElementById("interestType").value;

  const loan = calculateLoan(p, r, t, tt, type);

  await addDoc(collection(db, "loans"), {

    memberId: selectedMemberId,

    principal: loan.principal,
    interest: loan.interest,
    total: loan.total,
    remaining: loan.remaining,

    interestType: type,
    timeType: tt,

    paid: 0,
    status: "active",

    createdAt: serverTimestamp(),
    createdBy: auth.currentUser?.uid || null
  });

  alert("Loan created!");

  e.target.reset();

  selectedMemberId = null;
  selectedBox.innerHTML = "👤 Select member first";
});

/* =========================
   LOAD LOANS TABLE
========================= */
const table = document.getElementById("loansTable");

onSnapshot(collection(db, "loans"), (snap) => {

  table.innerHTML = "";

  snap.forEach(doc => {

    const d = doc.data();

    table.innerHTML += `
      <tr>
        <td>${d.memberId}</td>
        <td>${d.principal}</td>
        <td>${d.interest.toFixed(2)}</td>
        <td>${d.total.toFixed(2)}</td>
        <td>${d.remaining.toFixed(2)}</td>
        <td>${d.interestType}</td>
        <td>${d.status}</td>
      </tr>
    `;
  });

});
