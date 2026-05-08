import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const membersRef = collection(db, "members");
const savingsRef = collection(db, "savings");

let membersMap = {};

/* =========================
   LOAD MEMBERS (DROPDOWN)
========================= */
async function loadMembers() {

  const snap = await getDocs(membersRef);

  let options = `<option value="">Select Member</option>`;

  snap.forEach(m => {
    membersMap[m.id] = m.data().fullName;

    options += `
      <option value="${m.id}">
        ${m.data().fullName}
      </option>
    `;
  });

  document.getElementById("memberSelect").innerHTML = options;
}

loadMembers();

/* =========================
   ADD SAVING
========================= */
window.addSaving = async function () {

  const memberId = document.getElementById("memberSelect").value;
  const amount = document.getElementById("amount").value;

  if (!memberId || !amount) {
    alert("Select member and enter amount");
    return;
  }

  if (amount <= 0) {
    alert("Amount must be greater than 0");
    return;
  }

  await addDoc(savingsRef, {
    memberId,
    amount: Number(amount),
    date: new Date()
  });

  document.getElementById("amount").value = "";

  loadSavings();
  loadTotal();
};

/* =========================
   LOAD SAVINGS TABLE
========================= */
async function loadSavings() {

  const snap = await getDocs(savingsRef);

  let html = "";

  snap.forEach(s => {
    const data = s.data();

    html += `
      <tr>
        <td>${membersMap[data.memberId] || "Unknown"}</td>
        <td>${data.amount} ETB</td>
        <td>${new Date(data.date.seconds ? data.date.seconds * 1000 : data.date).toLocaleDateString()}</td>
        <td>
          <button onclick="deleteSaving('${s.id}')">Delete</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("savingsTable").innerHTML = html;
}

loadSavings();

/* =========================
   TOTAL SAVINGS
========================= */
async function loadTotal() {

  const snap = await getDocs(savingsRef);

  let total = 0;

  snap.forEach(s => {
    total += Number(s.data().amount);
  });

  document.getElementById("totalSavings").innerText = total + " ETB";
}

loadTotal();

/* =========================
   DELETE SAVING
========================= */
window.deleteSaving = async function (id) {

  if (!confirm("Delete this saving record?")) return;

  await deleteDoc(doc(db, "savings", id));

  loadSavings();
  loadTotal();
};

/* =========================
   SIDEBAR
========================= */
window.toggleSidebar = function () {
  document.getElementById("sidebar").classList.toggle("collapsed");
};
