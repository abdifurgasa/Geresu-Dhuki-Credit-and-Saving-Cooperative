import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GLOBAL STATE
========================= */
let selectedMember = null;

/* =========================
   SEARCH MEMBER
========================= */
window.searchMembers = async function () {

  const keyword = document.getElementById("memberSearch").value.toLowerCase();

  const snap = await getDocs(collection(db, "members"));

  const results = document.getElementById("searchResults");
  results.innerHTML = "";

  snap.forEach(docSnap => {

    const m = docSnap.data();

    if (
      m.name.toLowerCase().includes(keyword) ||
      m.phone?.includes(keyword) ||
      m.nid?.includes(keyword)
    ) {

      const div = document.createElement("div");
      div.className = "result-item";

      div.innerText = `${m.name} - ${m.phone}`;

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
   CREATE LOAN
========================= */
window.createLoan = async function () {

  if (!selectedMember) {
    alert("Select a member first");
    return;
  }

  const principal = Number(document.getElementById("loanAmount").value);
  const interestRate = Number(document.getElementById("interest").value);
  const durationMonths = 12; // fixed (can upgrade later)

  if (!principal || principal <= 0) {
    alert("Invalid loan amount");
    return;
  }

  if (!interestRate || interestRate < 0) {
    alert("Invalid interest rate");
    return;
  }

  try {

    /* =========================
       CALCULATIONS
    ========================= */

    const interestAmount =
      (principal * interestRate) / 100;

    const totalRepayable =
      principal + interestAmount;

    const monthlyPayment =
      totalRepayable / durationMonths;

    /* =========================
       SAVE LOAN
    ========================= */

    const loanRef = await addDoc(collection(db, "loans"), {

      memberId: selectedMember.id,
      memberName: selectedMember.name,

      principal,
      interest: interestRate,

      durationMonths,

      totalAmount: totalRepayable,

      paid: 0,
      remaining: totalRepayable,

      monthlyPayment,

      status: "active",

      createdAt: serverTimestamp()

    });

    /* =========================
       UPDATE MEMBER
    ========================= */

    const memberRef = doc(db, "members", selectedMember.id);
    const memberSnap = await getDoc(memberRef);

    if (memberSnap.exists()) {

      const m = memberSnap.data();

      await updateDoc(memberRef, {

        totalLoans:
          (m.totalLoans || 0) + principal,

        walletBalance:
          (m.walletBalance || 0) - principal

      });
    }

    /* =========================
       TRANSACTION LOG
    ========================= */

    await addDoc(collection(db, "transactions"), {

      type: "loan",
      memberId: selectedMember.id,
      amount: principal,
      date: serverTimestamp()

    });

    alert("Loan created successfully");

    document.getElementById("loanAmount").value = "";
    document.getElementById("interest").value = "";

  } catch (err) {

    console.error(err);
    alert("Loan creation failed");

  }
};
