import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { deposit } from "./wallet.js";

/* =========================
   GLOBAL STATE
========================= */

let selectedMember = null;

/* =========================
   SEARCH MEMBERS
========================= */

window.searchMembers = async function () {

  const keyword = document.getElementById("memberSearch")
    .value.toLowerCase().trim();

  const box = document.getElementById("searchResults");

  box.innerHTML = "";

  if (!keyword) {
    alert("Enter search keyword");
    return;
  }

  const snapshot = await getDocs(collection(db, "members"));

  snapshot.forEach(docSnap => {

    const member = docSnap.data();

    const text = `${member.name} ${member.phone} ${member.nid}`.toLowerCase();

    if (text.includes(keyword)) {

      const div = document.createElement("div");

      div.className = "result-item";

      div.innerHTML = `
        👤 ${member.name}<br>
        📱 ${member.phone}<br>
        🆔 ${member.nid}
      `;

      div.onclick = () => selectMember(docSnap.id, member);

      box.appendChild(div);
    }
  });
};

/* =========================
   SELECT MEMBER
========================= */

function selectMember(id, member) {

  selectedMember = {
    id,
    ...member
  };

  document.getElementById("selectedMember").innerHTML = `
    👤 ${member.name}<br>
    📱 ${member.phone}<br>
    🆔 ${member.nid}
  `;

  document.getElementById("searchResults").innerHTML = "";
}

/* =========================
   DEPOSIT SAVINGS
========================= */

window.depositMoney = async function () {

  if (!selectedMember) {
    alert("Select member first");
    return;
  }

  const amount = Number(document.getElementById("amount").value);

  if (!amount || amount <= 0) {
    alert("Invalid amount");
    return;
  }

  /* =========================
     SAVE SAVINGS RECORD
  ========================= */

  await addDoc(collection(db, "savings"), {
    memberId: selectedMember.id,
    memberName: selectedMember.name,
    phone: selectedMember.phone,
    amount,
    type: "saving",
    createdAt: serverTimestamp(),
    date: new Date().toISOString()
  });

  /* =========================
     TRANSACTION LOG
  ========================= */

  await addDoc(collection(db, "transactions"), {
    memberId: selectedMember.id,
    memberName: selectedMember.name,
    type: "saving",
    amount,
    createdAt: serverTimestamp(),
    date: new Date().toISOString()
  });

  /* =========================
     WALLET UPDATE (IMPORTANT FIX)
  ========================= */

  await deposit(selectedMember.id, selectedMember.name, amount);

  alert("Deposit successful");

  document.getElementById("amount").value = "";
};
