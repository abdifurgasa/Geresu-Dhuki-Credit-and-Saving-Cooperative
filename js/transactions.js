import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   ROLE CONTROL
========================= */
const role = localStorage.getItem("role");

if (!role) {
  window.location.href = "index.html";
}

/* =========================
   GLOBAL MEMBER
========================= */
let selectedMember = null;

/* =========================
   SEARCH MEMBERS
========================= */
window.searchMembers = async function () {

  const keyword = document.getElementById("memberSearch").value.toLowerCase();

  const resultsBox = document.getElementById("searchResults");
  resultsBox.innerHTML = "";

  const snapshot = await getDocs(collection(db, "members"));

  snapshot.forEach((docSnap) => {

    const m = docSnap.data();

    const match =
      m.name?.toLowerCase().includes(keyword) ||
      m.phone?.includes(keyword) ||
      m.nid?.includes(keyword);

    if (match) {

      const div = document.createElement("div");

      div.className = "result-item";

      div.innerHTML = `
        <strong>${m.name}</strong><br>
        ${m.phone}
      `;

      div.onclick = () => {
        selectedMember = { id: docSnap.id, ...m };

        document.getElementById("selectedMember").innerHTML = `
          👤 ${m.name}<br>
          📱 ${m.phone}<br>
          🆔 ${m.nid}
        `;

        resultsBox.innerHTML = "";
      };

      resultsBox.appendChild(div);
    }
  });
};

/* =========================
   TRANSACTION ENGINE
========================= */
window.submitTransaction = async function () {

  if (!selectedMember) {
    alert("Select member first");
    return;
  }

  const type = document.getElementById("transactionType").value;
  const amount = Number(document.getElementById("amount").value);

  if (!amount || amount <= 0) {
    alert("Invalid amount");
    return;
  }

  const walletRef = doc(db, "wallets", selectedMember.id);
  const walletSnap = await getDoc(walletRef);

  let balance = walletSnap.exists()
    ? Number(walletSnap.data().balance)
    : 0;

  /* =========================
     SAVING
  ========================= */
  if (type === "saving") {
    balance += amount;

    await addDoc(collection(db, "savings"), {
      memberId: selectedMember.id,
      amount,
      date: serverTimestamp()
    });
  }

  /* =========================
     REPAYMENT
  ========================= */
  if (type === "repayment") {
    balance -= amount;

    const loansQ = query(
      collection(db, "loans"),
      where("memberId", "==", selectedMember.id),
      where("status", "==", "active")
    );

    const loansSnap = await getDocs(loansQ);

    if (!loansSnap.empty) {

      const loanDoc = loansSnap.docs[0];

      const loan = loanDoc.data();

      const newPaid = (loan.paid || 0) + amount;
      const remaining = (loan.totalAmount || loan.principal) - newPaid;

      await updateDoc(doc(db, "loans", loanDoc.id), {
        paid: newPaid,
        remaining,
        status: remaining <= 0 ? "completed" : "active"
      });
    }

    await addDoc(collection(db, "repayments"), {
      memberId: selectedMember.id,
      amount,
      date: serverTimestamp()
    });
  }

  /* =========================
     WALLET UPDATE (FIXED)
  ========================= */
  await setDoc(walletRef, {
    memberId: selectedMember.id,
    balance
  }, { merge: true });

  /* =========================
     CENTRAL LEDGER
  ========================= */
  await addDoc(collection(db, "transactions"), {
    type,
    memberId: selectedMember.id,
    memberName: selectedMember.name,
    amount,
    createdBy: auth.currentUser?.email || "system",
    date: serverTimestamp()
  });

  alert("Transaction completed");

  document.getElementById("amount").value = "";
};

/* =========================
   REALTIME LEDGER
========================= */
function loadLedger() {

  const table = document.getElementById("transactionTable");

  onSnapshot(collection(db, "transactions"), (snap) => {

    table.innerHTML = "";

    snap.forEach(doc => {

      const t = doc.data();

      table.innerHTML += `
        <tr>
          <td>${t.memberName}</td>
          <td>${t.type}</td>
          <td>${t.amount}</td>
          <td>${t.date?.toDate ? new Date(t.date.toDate()).toLocaleString() : ""}</td>
        </tr>
      `;
    });
  });
}

loadLedger();
