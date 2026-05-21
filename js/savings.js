import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================================================
   ELEMENTS
========================================================= */

const searchInput = document.getElementById("searchMember");
const searchResults = document.getElementById("searchResults");
const selectedBox = document.getElementById("selectedMember");

const amountEl = document.getElementById("amount");
const noteEl = document.getElementById("note");
const methodEl = document.getElementById("paymentMethod");

const saveBtn = document.getElementById("saveBtn");
const table = document.getElementById("savingTable");

/* =========================================================
   SELECTED MEMBER STORAGE
========================================================= */

let selectedMemberId = null;
let selectedMemberData = null;

/* =========================================================
   LOAD MEMBERS FOR SEARCH
========================================================= */

async function loadMembers(queryText) {
  searchResults.innerHTML = "";

  const snapshot = await getDocs(collection(db, "members"));

  snapshot.forEach((docSnap) => {
    const m = docSnap.data();

    const match =
      m.name?.toLowerCase().includes(queryText) ||
      m.phone?.includes(queryText) ||
      m.nid?.includes(queryText);

    if (!queryText || !match) return;

    const div = document.createElement("div");
    div.className = "search-item";

    div.innerHTML = `
      <strong>${m.name}</strong><br>
      <small>${m.phone}</small>
    `;

    div.onclick = () => {
      selectedMemberId = docSnap.id;
      selectedMemberData = m;

      selectedBox.innerHTML = `
        👤 ${m.name}<br>
        📞 ${m.phone}<br>
        🪪 ${m.nid}<br>
        💰 Savings: ${m.savings || 0} ETB
      `;

      searchResults.innerHTML = "";
      searchInput.value = m.name;
    };

    searchResults.appendChild(div);
  });
}

/* =========================================================
   SEARCH EVENT
========================================================= */

searchInput.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase().trim();
  loadMembers(value);
});

/* =========================================================
   SAVE SAVINGS (DEPOSIT)
========================================================= */

saveBtn.addEventListener("click", async () => {
  try {
    if (!selectedMemberId) {
      alert("Please select a member");
      return;
    }

    const amount = Number(amountEl.value);

    if (!amount || amount <= 0) {
      alert("Enter valid amount");
      return;
    }

    const note = noteEl.value;
    const method = methodEl.value;

    /* GET MEMBER REFRESH DATA */
    const memberRef = doc(db, "members", selectedMemberId);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      alert("Member not found");
      return;
    }

    const member = memberSnap.data();

    const previousBalance = member.savings || 0;
    const newBalance = previousBalance + amount;

    const user = auth.currentUser;

    /* SAVE TRANSACTION */
    await addDoc(collection(db, "savings"), {
      memberId: selectedMemberId,
      memberName: member.name,

      amount,
      previousBalance,
      newBalance,

      paymentMethod: method,
      note: note || "",

      createdAt: serverTimestamp(),

      createdBy: user ? user.email : "unknown"
    });

    /* UPDATE MEMBER BALANCE */
    await updateDoc(memberRef, {
      savings: newBalance,
      lastUpdatedAt: serverTimestamp(),
      lastUpdatedBy: user ? user.email : "unknown"
    });

    alert("Savings added successfully");

    /* RESET UI */
    amountEl.value = "";
    noteEl.value = "";
    selectedBox.innerHTML = "👤 Select a member";
    selectedMemberId = null;
    selectedMemberData = null;

    loadSavingsHistory();

  } catch (error) {
    console.error(error);
    alert("Error: " + error.message);
  }
});

/* =========================================================
   LOAD SAVINGS HISTORY
========================================================= */

async function loadSavingsHistory() {
  table.innerHTML = "";

  const snapshot = await getDocs(collection(db, "savings"));

  if (snapshot.empty) {
    table.innerHTML = `
      <tr>
        <td colspan="7">No savings found</td>
      </tr>
    `;
    return;
  }

  snapshot.forEach((docSnap) => {
    const s = docSnap.data();

    const date = s.createdAt
      ? new Date(s.createdAt.seconds * 1000).toLocaleString()
      : "-";

    table.innerHTML += `
      <tr>
        <td>${s.memberName}</td>
        <td>${s.amount} ETB</td>
        <td>${s.previousBalance} ETB</td>
        <td>${s.newBalance} ETB</td>
        <td>${s.paymentMethod}</td>
        <td>${s.createdBy}</td>
        <td>${date}</td>
      </tr>
    `;
  });
}

/* =========================================================
   INITIAL LOAD
========================================================= */

loadSavingsHistory();
