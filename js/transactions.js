import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   ROLE CONTROL
========================= */

const role = localStorage.getItem("role");

if (role !== "admin" && role !== "teller") {
  alert("Access denied");
  window.location.href = "dashboard.html";
}

/* =========================
   GLOBALS
========================= */

let selectedMember = null;

/* =========================
   SEARCH MEMBERS
========================= */

window.searchMembers = async function () {

  const keyword = document
    .getElementById("memberSearch")
    .value
    .toLowerCase()
    .trim();

  const resultsBox = document.getElementById("searchResults");

  resultsBox.innerHTML = "";

  if (!keyword) {
    alert("Enter search keyword");
    return;
  }

  const snapshot = await getDocs(collection(db, "members"));

  snapshot.forEach((docSnap) => {

    const member = docSnap.data();

    const searchable = `
      ${member.name}
      ${member.phone}
      ${member.nid}
    `.toLowerCase();

    if (searchable.includes(keyword)) {

      const div = document.createElement("div");

      div.className = "result-item";

      div.innerHTML = `
        <strong>${member.name}</strong><br>
        ${member.phone}
      `;

      div.onclick = () => selectMember(docSnap.id, member);

      resultsBox.appendChild(div);
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
   SUBMIT TRANSACTION
========================= */

window.submitTransaction = async function () {

  if (!selectedMember) {
    alert("Select member first");
    return;
  }

  const type = document.getElementById("transactionType").value;

  const amount = Number(
    document.getElementById("amount").value
  );

  if (amount <= 0) {
    alert("Invalid amount");
    return;
  }

  /* =========================
     SAVING DEPOSIT
  ========================= */

  if (type === "saving") {

    await addDoc(collection(db, "savings"), {

      memberId: selectedMember.id,
      memberName: selectedMember.name,
      amount,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()

    });
  }

  /* =========================
     LOAN REPAYMENT
  ========================= */

  if (type === "repayment") {

    const loansSnapshot = await getDocs(
      query(
        collection(db, "loans"),
        where("memberId", "==", selectedMember.id),
        where("status", "==", "active")
      )
    );

    if (loansSnapshot.empty) {
      alert("No active loan found");
      return;
    }

    let loanDoc = loansSnapshot.docs[0];
    let loan = loanDoc.data();

    let paid = Number(loan.paid || 0);
    let total = Number(loan.totalAmount || 0);

    let newPaid = paid + amount;
    let remaining = total - newPaid;

    let status = remaining <= 0
      ? "completed"
      : "active";

    await updateDoc(doc(db, "loans", loanDoc.id), {
      paid: newPaid,
      remaining,
      status
    });

    await addDoc(collection(db, "repayments"), {

      loanId: loanDoc.id,
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      amount,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()

    });
  }

  /* =========================
     CENTRAL TRANSACTION LEDGER
  ========================= */

  await addDoc(collection(db, "transactions"), {

    type,
    memberId: selectedMember.id,
    memberName: selectedMember.name,
    amount,
    status: "completed",
    createdBy: auth.currentUser?.email || "Unknown",
    date: new Date().toISOString(),
    createdAt: serverTimestamp()

  });

  /* =========================
     UPDATE MEMBER WALLET
  ========================= */

  const walletRef = doc(db, "wallets", selectedMember.id);

  const walletSnap = await getDoc(walletRef);

  let currentBalance = 0;

  if (walletSnap.exists()) {
    currentBalance = Number(walletSnap.data().balance || 0);
  }

  let newBalance = currentBalance;

  if (type === "saving") {
    newBalance += amount;
  }

  if (type === "repayment") {
    newBalance -= amount;
  }

  await updateDoc(walletRef, {
    balance: newBalance
  }).catch(async () => {

    await addDoc(collection(db, "wallets"), {
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      balance: newBalance
    });
  });

  alert("Transaction completed successfully");

  document.getElementById("amount").value = "";
};

/* =========================
   REALTIME LEDGER
========================= */

function loadLedger() {

  const table = document.getElementById("transactionTable");

  onSnapshot(collection(db, "transactions"), (snapshot) => {

    table.innerHTML = "";

    snapshot.forEach((docSnap) => {

      const tx = docSnap.data();

      table.innerHTML += `
        <tr>
          <td>${tx.memberName}</td>
          <td>${tx.type}</td>
          <td>${tx.amount} ETB</td>
          <td>${new Date(tx.date).toLocaleString()}</td>
          <td>
            <span class="status active">
              ${tx.status}
            </span>
          </td>
        </tr>
      `;
    });
  });
}

loadLedger();
