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
let membersCache = [];

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("searchMember")
    .addEventListener("input", liveSearch);

  loadMembersCache();
  loadSavings();
});

/* =========================
   LOAD MEMBERS ONCE
========================= */
async function loadMembersCache() {

  const snap = await getDocs(collection(db, "members"));

  membersCache = snap.docs.map(doc => {
    const m = doc.data();

    return {
      name: m.name || "Unknown",
      phone: m.phone || "No Phone",
      nid: m.nid || "No NID"
    };
  });
}

/* =========================
   LIVE SEARCH
========================= */
function liveSearch(e) {

  const value = e.target.value.toLowerCase();
  const box = document.getElementById("searchResults");

  box.innerHTML = "";

  if (!value) return;

  const results = membersCache.filter(m =>
    m.name.toLowerCase().includes(value) ||
    m.phone.includes(value) ||
    m.nid.includes(value)
  );

  if (results.length === 0) {
    box.innerHTML = `<div class="result-item">No member found</div>`;
    return;
  }

  results.forEach(m => {
    const div = document.createElement("div");
    div.className = "result-item";

    div.textContent = `${m.name} | ${m.phone} | ${m.nid}`;

    div.onclick = () => {
      selectMember(m);
      box.innerHTML = "";
      document.getElementById("searchMember").value = "";
    };

    box.appendChild(div);
  });
}

/* =========================
   MANUAL SEARCH
========================= */
window.manualSearch = function () {

  const value = document.getElementById("searchMember").value.toLowerCase();
  const box = document.getElementById("searchResults");

  box.innerHTML = "";

  const results = membersCache.filter(m =>
    m.name.toLowerCase().includes(value) ||
    m.phone.includes(value) ||
    m.nid.includes(value)
  );

  if (results.length === 0) {
    box.innerHTML = `<div class="result-item">No member found</div>`;
    return;
  }

  results.forEach(m => {
    const div = document.createElement("div");
    div.className = "result-item";

    div.textContent = `${m.name} | ${m.phone} | ${m.nid}`;

    div.onclick = () => {
      selectMember(m);
      box.innerHTML = "";
    };

    box.appendChild(div);
  });
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
   SAVE DEPOSIT (FIXED)
========================= */
window.saveSaving = async function () {

  try {

    const amount = Number(document.getElementById("amount").value);

    if (!selectedMember) {
      alert("Select a member first");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Enter valid amount");
      return;
    }

    const docRef = await addDoc(collection(db, "savings"), {
      memberName: selectedMember.name,
      memberPhone: selectedMember.phone,
      memberNID: selectedMember.nid,
      amount: amount,
      createdAt: new Date()
    });

    alert("Deposit saved successfully");

    console.log("Saved ID:", docRef.id);

    document.getElementById("amount").value = "";

    loadSavings();

  } catch (err) {
    console.error("ERROR:", err);
    alert("Saving failed: " + err.message);
  }
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
        <td>${new Date(s.createdAt?.seconds ? s.createdAt.seconds * 1000 : s.createdAt).toLocaleDateString()}</td>
      </tr>
    `;
  });
}

/* =========================
   SIDEBAR
========================= */
window.toggleSidebar = function () {
  document.getElementById("sidebar").classList.toggle("collapsed");
};
