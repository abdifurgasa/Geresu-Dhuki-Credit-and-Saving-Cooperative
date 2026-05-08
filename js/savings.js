import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =====================
   STATE
===================== */
let members = [];
let selectedMember = null;

/* =====================
   INIT
===================== */
document.addEventListener("DOMContentLoaded", async () => {

  await loadMembers();
  await loadHistory();

  searchMember.addEventListener("input", search);
});

/* =====================
   LOAD MEMBERS (FOR SEARCH)
===================== */
async function loadMembers() {

  const snap = await getDocs(collection(db, "members"));

  members = [];

  snap.forEach(d => {
    members.push({
      id: d.id,
      ...d.data()
    });
  });
}

/* =====================
   SEARCH MEMBER (FIXED)
===================== */
function search(e) {

  const value = e.target.value.toLowerCase();

  results.innerHTML = "";

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(value) ||
    m.phone.includes(value) ||
    m.nid.includes(value)
  );

  filtered.forEach(m => {

    results.innerHTML += `
      <div class="result-item" onclick="selectMember('${m.id}')">
        ${m.name} - ${m.phone}
      </div>
    `;
  });
}

/* =====================
   SELECT MEMBER (FIXED LINK)
===================== */
window.selectMember = (id) => {

  selectedMember = members.find(m => m.id === id);

  selectedBox.innerHTML = `
    Selected: ${selectedMember.name} | ${selectedMember.phone}
  `;

  results.innerHTML = "";
  searchMember.value = "";
};

/* =====================
   DEPOSIT SAVINGS
===================== */
window.deposit = async () => {

  const amount = parseFloat(document.getElementById("amount").value);

  if (!selectedMember) {
    return alert("Select a member first");
  }

  if (!amount || amount <= 0) {
    return alert("Enter valid amount");
  }

  await addDoc(collection(db, "savings"), {
    memberId: selectedMember.id,
    memberName: selectedMember.name,
    amount,
    type: "deposit",
    date: new Date()
  });

  alert("Deposit successful");

  document.getElementById("amount").value = "";

  loadHistory();
};

/* =====================
   LOAD HISTORY
===================== */
async function loadHistory() {

  const snap = await getDocs(collection(db, "savings"));

  historyTable.innerHTML = "";

  snap.forEach(d => {

    const s = d.data();

    historyTable.innerHTML += `
      <tr>
        <td>${s.memberName}</td>
        <td>${s.amount}</td>
        <td>${new Date(s.date.seconds ? s.date.seconds * 1000 : s.date).toLocaleString()}</td>
      </tr>
    `;
  });
}
