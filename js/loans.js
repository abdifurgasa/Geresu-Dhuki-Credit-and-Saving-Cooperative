import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GLOBAL DATA
========================= */
let members = [];

/* =========================
   LOAD MEMBERS
========================= */
async function loadMembers() {
  const snap = await getDocs(collection(db, "members"));

  members = [];
  snap.forEach(doc => {
    members.push({ id: doc.id, ...doc.data() });
  });
}
loadMembers();

/* =========================
   SEARCH MEMBERS
========================= */
window.searchMembers = function () {

  const input = document.getElementById("memberSearch").value.toLowerCase();
  const box = document.getElementById("searchResults");

  box.innerHTML = "";

  if (input.length < 2) return;

  const filtered = members.filter(m =>
    (m.name && m.name.toLowerCase().includes(input)) ||
    (m.phone && m.phone.includes(input)) ||
    (m.nationalId && m.nationalId.includes(input))
  );

  filtered.forEach(m => {
    const div = document.createElement("div");
    div.className = "search-item";

    div.innerHTML = `
      <b>${m.name}</b><br>
      <small>${m.phone || ""} | ${m.nationalId || ""}</small>
    `;

    div.onclick = () => selectMember(m);

    box.appendChild(div);
  });
};

/* =========================
   SELECT MEMBER
========================= */
function selectMember(m) {
  window.selectedMember = m;

  document.getElementById("selectedMemberName").value = m.name;
  document.getElementById("memberSearch").value = "";
  document.getElementById("searchResults").innerHTML = "";
}

/* =========================
   LOAN ENGINE
========================= */
window.addLoan = async function () {

  const member = window.selectedMember;
  const amount = parseFloat(document.getElementById("amount").value);
  const rate = parseFloat(document.getElementById("rate").value);
  const months = parseInt(document.getElementById("months").value);

  if (!member) return alert("Select member first!");
  if (!amount || !rate || !months) return alert("Fill all fields!");

  // INTEREST CALCULATION
  const interest = (amount * rate / 100);
  const total = amount + interest;
  const monthly = total / months;

  // DUE DATE
  let due = new Date();
  due.setMonth(due.getMonth() + months);

  const loanData = {
    memberId: member.id,
    memberName: member.name,
    amount,
    rate,
    months,
    interest,
    total,
    monthly,
    dueDate: due.toISOString().split("T")[0],
    penalty: 0,
    balance: total,
    status: "ACTIVE",
    createdAt: Timestamp.now()
  };

  await addDoc(collection(db, "loans"), loanData);

  alert("Loan Created Successfully");

  loadLoans();
};

/* =========================
   LOAD LOANS
========================= */
async function loadLoans() {

  const snap = await getDocs(collection(db, "loans"));

  const table = document.getElementById("loanTable");
  table.innerHTML = "";

  snap.forEach(doc => {
    const l = doc.data();

    const row = `
      <tr>
        <td>${l.memberName}</td>
        <td>${l.amount}</td>
        <td>${l.interest}</td>
        <td>${l.total}</td>
        <td>${l.monthly}</td>
        <td>${l.dueDate}</td>
        <td>${l.penalty}</td>
        <td>${l.balance}</td>
        <td>${l.status}</td>
      </tr>
    `;

    table.innerHTML += row;
  });
}

loadLoans();
