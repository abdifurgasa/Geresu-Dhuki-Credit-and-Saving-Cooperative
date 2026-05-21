import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================================================
   AUTH SAFE USER
========================================================= */

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

/* =========================================================
   ELEMENTS
========================================================= */

const memberSelect = document.getElementById("member");
const amountInput = document.getElementById("amount");
const table = document.getElementById("savingTable");
const selectedBox = document.getElementById("selectedBox");

/* =========================================================
   LOAD MEMBERS
========================================================= */

async function loadMembers() {
  const snap = await getDocs(collection(db, "members"));

  memberSelect.innerHTML = "";

  snap.forEach((docSnap) => {
    const m = docSnap.data();

    memberSelect.innerHTML += `
      <option value="${docSnap.id}">
        ${m.name}
      </option>
    `;
  });
}

loadMembers();

/* =========================================================
   SAVE SAVINGS (MAIN LOGIC)
========================================================= */

document.getElementById("saveBtn").addEventListener("click", async () => {
  try {
    const memberId = memberSelect.value;
    const amount = Number(amountInput.value);

    if (!memberId || amount <= 0) {
      alert("Enter valid data");
      return;
    }

    const memberRef = doc(db, "members", memberId);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      alert("Member not found");
      return;
    }

    const member = memberSnap.data();

    const previousBalance = member.savingsBalance || 0;
    const newBalance = previousBalance + amount;

    // 1. UPDATE MEMBER BALANCE
    await updateDoc(memberRef, {
      savingsBalance: newBalance
    });

    // 2. SAVE TRANSACTION (LEDGER)
    await addDoc(collection(db, "savings"), {
      memberId,
      memberName: member.name,
      amount,
      previousBalance,
      newBalance,
      type: "deposit",
      createdAt: serverTimestamp(),
      createdBy: currentUser?.email || "system"
    });

    alert("✅ Savings added successfully");

    amountInput.value = "";

    loadSavings();

  } catch (err) {
    console.error(err);
    alert("❌ Error saving deposit");
  }
});

/* =========================================================
   LOAD SAVINGS HISTORY
========================================================= */

async function loadSavings() {
  const snap = await getDocs(collection(db, "savings"));

  table.innerHTML = "";

  snap.forEach((docSnap) => {
    const s = docSnap.data();

    table.innerHTML += `
      <tr>
        <td>${s.memberName}</td>
        <td>${s.amount}</td>
        <td>${s.previousBalance}</td>
        <td>${s.newBalance}</td>
        <td>${s.createdBy}</td>
        <td>${
          s.createdAt
            ? new Date(s.createdAt.seconds * 1000).toLocaleDateString()
            : "-"
        }</td>
      </tr>
    `;
  });
}

loadSavings();
