import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   SELECTED MEMBER
========================= */
let selectedMember = null;

/* =========================
   SEARCH MEMBERS
========================= */
const searchInput = document.getElementById("searchMember");
const resultsBox = document.getElementById("searchResults");

searchInput.addEventListener("input", async function () {

  const value = this.value.toLowerCase();

  resultsBox.innerHTML = "";

  if (!value) return;

  const snap = await getDocs(collection(db, "members"));

  snap.forEach(doc => {

    const m = doc.data();

    const match =
      m.name.toLowerCase().includes(value) ||
      m.nid.includes(value) ||
      m.phone.includes(value);

    if (match) {
      const div = document.createElement("div");
      div.className = "result-item";

      div.innerText = `${m.name} | ${m.phone} | ${m.nid}`;

      div.onclick = () => {
        selectedMember = m;

        document.getElementById("selectedMember").innerText =
          `${m.name} (${m.phone})`;

        resultsBox.innerHTML = "";
        searchInput.value = "";
      };

      resultsBox.appendChild(div);
    }
  });
});

/* =========================
   SAVE SAVINGS
========================= */
window.saveSaving = async () => {

  const amount = document.getElementById("amount").value;

  if (!selectedMember) {
    alert("Please select a member first");
    return;
  }

  if (!amount || amount <= 0) {
    alert("Enter valid amount");
    return;
  }

  await addDoc(collection(db, "savings"), {
    memberName: selectedMember.name,
    memberNID: selectedMember.nid,
    memberPhone: selectedMember.phone,
    amount: Number(amount),
    date: new Date()
  });

  alert("Saving recorded successfully");

  document.getElementById("amount").value = "";

  loadSavings();
};

/* =========================
   LOAD SAVINGS HISTORY
========================= */
async function loadSavings() {

  const snap = await getDocs(collection(db, "savings"));

  const table = document.getElementById("savingTable");
  table.innerHTML = "";

  snap.forEach(doc => {

    const s = doc.data();

    const row = `
      <tr>
        <td>${s.memberName}</td>
        <td>${s.amount}</td>
        <td>${new Date(s.date.seconds ? s.date.seconds * 1000 : s.date).toLocaleDateString()}</td>
      </tr>
    `;

    table.innerHTML += row;
  });
}

loadSavings();

/* =========================
   SIDEBAR TOGGLE
========================= */
window.toggleSidebar = function () {
  document.getElementById("sidebar").classList.toggle("collapsed");
};
