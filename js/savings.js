import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   STATE
========================= */
let selectedMember = null;

/* =========================
   ELEMENTS
========================= */
const searchInput = document.getElementById("memberSearch");
const resultsBox = document.getElementById("searchResults");
const selectedBox = document.getElementById("selectedMember");
const table = document.getElementById("savingsTable");

/* =========================
   LOAD SAVINGS
========================= */
async function loadSavings() {

  table.innerHTML = "";

  const snap =
    await getDocs(collection(db, "savings"));

  snap.forEach(docSnap => {

    const s = docSnap.data();

    table.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${s.phone}</td>
        <td>${s.amount} ETB</td>
        <td>${new Date(s.date).toLocaleDateString()}</td>
      </tr>
    `;
  });
}

/* =========================
   SEARCH MEMBER
========================= */
searchInput.addEventListener("input", async function () {

  const value = this.value.toLowerCase();

  resultsBox.innerHTML = "";

  const snap =
    await getDocs(collection(db, "members"));

  snap.forEach(docSnap => {

    const m = docSnap.data();

    if (
      m.name.toLowerCase().includes(value) ||
      m.phone.includes(value) ||
      m.nid.includes(value)
    ) {

      const div = document.createElement("div");

      div.className = "result-item";

      div.innerText =
        `${m.name} - ${m.phone}`;

      div.onclick = () => {

        selectedMember = {
          id: docSnap.id,
          ...m
        };

        selectedBox.innerHTML = `
          <b>${m.name}</b><br>
          ${m.phone}<br>
          ${m.nid}
        `;

        resultsBox.innerHTML = "";
        searchInput.value = "";
      };

      resultsBox.appendChild(div);
    }
  });
});

/* =========================
   DEPOSIT MONEY
========================= */
window.depositMoney = async function () {

  const amount =
    Number(document.getElementById("amount").value);

  if (!selectedMember) {

    alert("Please select a member");

    return;
  }

  if (!amount || amount <= 0) {

    alert("Enter valid amount");

    return;
  }

  try {

    /* 1. SAVE TRANSACTION */
    await addDoc(collection(db, "savings"), {

      memberId: selectedMember.id,
      name: selectedMember.name,
      phone: selectedMember.phone,
      amount: amount,
      date: Date.now()

    });

    /* 2. UPDATE MEMBER BALANCE */
    const memberRef =
      doc(db, "members", selectedMember.id);

    const snap =
      await getDocs(collection(db, "members"));

    let currentBalance = 0;

    snap.forEach(d => {

      if (d.id === selectedMember.id) {

        currentBalance =
          (d.data().balance || 0);
      }
    });

    await updateDoc(memberRef, {

      balance:
        currentBalance + amount

    });

    alert("Deposit successful");

    document.getElementById("amount").value = "";

    selectedMember = null;

    selectedBox.innerHTML =
      "No member selected";

    loadSavings();

  } catch (err) {

    console.error(err);

    alert("Error processing deposit");
  }
};

/* =========================
   INIT
========================= */
loadSavings();
