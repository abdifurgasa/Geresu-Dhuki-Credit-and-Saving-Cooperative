import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   SELECTED MEMBER
========================= */
let selectedMember = null;

/* =========================
   SEARCH MEMBER
========================= */
window.searchMembers = async function () {

  const keyword = document.getElementById("searchInput").value.toLowerCase();

  const snap = await getDocs(collection(db, "members"));

  const results = document.getElementById("searchResults");

  results.innerHTML = "";

  snap.forEach(docSnap => {

    const m = docSnap.data();

    if (
      m.name.toLowerCase().includes(keyword) ||
      m.phone.includes(keyword) ||
      m.nid.includes(keyword)
    ) {

      const div = document.createElement("div");

      div.className = "result-item";

      div.innerHTML = `
        ${m.name} - ${m.phone}
      `;

      div.onclick = () => {

        selectedMember = {
          id: docSnap.id,
          ...m
        };

        document.getElementById("selectedMember").innerText =
          "Selected: " + m.name;

        results.innerHTML = "";
      };

      results.appendChild(div);
    }
  });
};

/* =========================
   DEPOSIT SAVINGS
========================= */
window.depositSaving = async function () {

  if (!selectedMember) {
    alert("Select a member first");
    return;
  }

  const amount = Number(document.getElementById("amount").value);

  if (!amount || amount <= 0) {
    alert("Invalid amount");
    return;
  }

  try {

    /* 1. GET MEMBER */
    const memberRef = doc(db, "members", selectedMember.id);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) return;

    const member = memberSnap.data();

    const newBalance =
      Number(member.walletBalance || 0) + amount;

    /* 2. UPDATE MEMBER WALLET */
    await updateDoc(memberRef, {
      walletBalance: newBalance,
      totalSavings: (member.totalSavings || 0) + amount
    });

    /* 3. SAVE SAVING RECORD */
    await addDoc(collection(db, "savings"), {

      memberId: selectedMember.id,
      memberName: selectedMember.name,
      amount: amount,
      balanceAfter: newBalance,
      createdAt: serverTimestamp(),
      createdBy: "teller"

    });

    /* 4. TRANSACTION LOG */
    await addDoc(collection(db, "transactions"), {

      type: "saving",
      memberId: selectedMember.id,
      amount: amount,
      date: serverTimestamp()

    });

    alert("Deposit successful");

    document.getElementById("amount").value = "";

  } catch (err) {

    console.error(err);
    alert("Deposit failed");

  }
};
