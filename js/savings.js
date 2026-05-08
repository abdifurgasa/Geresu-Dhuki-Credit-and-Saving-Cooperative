import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   STATE
========================= */
let selectedMember = null;

/* =========================
   SAFE INIT (IMPORTANT FIX)
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const input = document.getElementById("searchMember");

  if (input) {
    input.addEventListener("input", liveSearch);
  }

});

/* =========================
   LIVE SEARCH (FIXED)
========================= */
async function liveSearch(e) {

  const value = e.target.value.toLowerCase().trim();

  const resultsBox = document.getElementById("searchResults");
  resultsBox.innerHTML = "";

  if (value.length < 1) return;

  const snap = await getDocs(collection(db, "members"));

  snap.forEach(doc => {

    const m = doc.data();

    const match =
      (m.name || "").toLowerCase().includes(value) ||
      (m.nid || "").includes(value) ||
      (m.phone || "").includes(value);

    if (match) {

      const div = document.createElement("div");
      div.className = "result-item";

      div.textContent = `${m.name} | ${m.phone} | ${m.nid}`;

      div.onclick = () => {
        selectMember(m);
        resultsBox.innerHTML = "";
        document.getElementById("searchMember").value = "";
      };

      resultsBox.appendChild(div);
    }
  });
}

/* =========================
   MANUAL SEARCH BUTTON
========================= */
window.manualSearch = async function () {

  const value = document.getElementById("searchMember").value.toLowerCase().trim();
  const resultsBox = document.getElementById("searchResults");

  resultsBox.innerHTML = "";

  if (!value) {
    alert("Please type search value");
    return;
  }

  const snap = await getDocs(collection(db, "members"));

  let found = false;

  snap.forEach(doc => {

    const m = doc.data();

    const match =
      (m.name || "").toLowerCase().includes(value) ||
      (m.nid || "").includes(value) ||
      (m.phone || "").includes(value);

    if (match) {

      found = true;

      const div = document.createElement("div");
      div.className = "result-item";

      div.textContent = `${m.name} | ${m.phone} | ${m.nid}`;

      div.onclick = () => {
        selectMember(m);
        resultsBox.innerHTML = "";
        document.getElementById("searchMember").value = "";
      };

      resultsBox.appendChild(div);
    }
  });

  if (!found) {
    resultsBox.innerHTML = `<div class="result-item">No member found</div>`;
  }
};

/* =========================
   SELECT MEMBER
========================= */
function selectMember(m) {

  selectedMember = m;

  document.getElementById("selectedMember").innerText =
    `${m.name} (${m.phone})`;
}

/* =========================
   SAVE SAVINGS (UNCHANGED LOGIC)
========================= */
window.saveSaving = async function () {

  const amount = document.getElementById("amount").value;

  if (!selectedMember) {
    alert("Select a member first");
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

  alert("Saved successfully");

  document.getElementById("amount").value = "";

  loadSavings();
};

/* =========================
   LOAD HISTORY
========================= */
async function loadSavings() {

  const snap = await getDocs(collection(db, "savings"));

  const table = document.getElementById("savingTable");
  table.innerHTML = "";

  snap.forEach(doc => {

    const s = doc.data();

    table.innerHTML += `
      <tr>
        <td>${s.memberName}</td>
        <td>${s.amount}</td>
        <td>${new Date(s.date.seconds ? s.date.seconds * 1000 : s.date).toLocaleDateString()}</td>
      </tr>
    `;
  });
}

loadSavings();

/* =========================
   SIDEBAR
========================= */
window.toggleSidebar = function () {
  document.getElementById("sidebar").classList.toggle("collapsed");
};
