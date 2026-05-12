import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const table = document.getElementById("memberTable");

let members = [];
let savings = [];
let loans = [];
let repayments = [];

/* =========================
   LOAD ALL DATA
========================= */

async function loadData() {

  const mSnap = await getDocs(collection(db, "members"));
  const sSnap = await getDocs(collection(db, "savings"));
  const lSnap = await getDocs(collection(db, "loans"));
  const rSnap = await getDocs(collection(db, "repayments"));

  members = mSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  savings = sSnap.docs.map(d => d.data());
  loans = lSnap.docs.map(d => d.data());
  repayments = rSnap.docs.map(d => d.data());

  renderTable();
}

/* =========================
   CALCULATIONS
========================= */

function getSavings(memberId) {
  return savings
    .filter(s => s.memberId === memberId)
    .reduce((sum, s) => sum + Number(s.amount || 0), 0);
}

function getLoans(memberId) {
  return loans
    .filter(l => l.memberId === memberId)
    .reduce((sum, l) => sum + Number(l.amount || 0), 0);
}

function getRepayments(memberId) {
  return repayments
    .filter(r => r.memberId === memberId)
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);
}

function getRemaining(memberId) {

  const loan = getLoans(memberId);
  const paid = getRepayments(memberId);

  return loan - paid;
}

/* =========================
   RENDER TABLE
========================= */

function renderTable() {

  table.innerHTML = "";

  members.forEach(m => {

    const savingsTotal = getSavings(m.id);
    const loansTotal = getLoans(m.id);
    const paidTotal = getRepayments(m.id);
    const remaining = getRemaining(m.id);

    const row = document.createElement("tr");

    row.innerHTML = `
      <td style="display:flex;align-items:center;gap:10px;">
        <img src="${m.photo || 'https://via.placeholder.com/40'}"
             style="width:40px;height:40px;border-radius:50%;">
        <b>${m.name}</b>
      </td>

      <td>${m.phone}</td>
      <td>${m.nid}</td>

      <td>${savingsTotal.toLocaleString()} ETB</td>
      <td>${loansTotal.toLocaleString()} ETB</td>
      <td>${paidTotal.toLocaleString()} ETB</td>
      <td>${remaining.toLocaleString()} ETB</td>

      <td>
        <span class="status ${remaining <= 0 ? "active" : "warning"}">
          ${remaining <= 0 ? "Clear" : "Ongoing"}
        </span>
      </td>

      <td>
        <button class="btn success" onclick="editMember('${m.id}')">
          Edit
        </button>

        <button class="btn danger" onclick="deleteMember('${m.id}')">
          Delete
        </button>
      </td>
    `;

    table.appendChild(row);
  });
}

/* =========================
   INIT
========================= */

loadData();
