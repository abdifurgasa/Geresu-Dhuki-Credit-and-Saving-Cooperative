
import {
  db,
  auth
} from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* TABLE */
const table = document.getElementById("loanTable");

/* MEMBER DROPDOWN */
const memberSelect = document.getElementById("member");

/* =========================
   LOAD MEMBERS
========================= */
async function loadMembers() {

  const snap = await getDocs(collection(db, "members"));

  snap.forEach(docSnap => {

    const m = docSnap.data();

    memberSelect.innerHTML += `
      <option value="${docSnap.id}">
        ${m.name}
      </option>
    `;
  });
}

/* =========================
   LOAD LOANS
========================= */
async function loadLoans() {

  table.innerHTML = "";

  const snap = await getDocs(collection(db, "loans"));

  if (snap.empty) {

    table.innerHTML = `
      <tr><td colspan="9">No loans found</td></tr>
    `;

    return;
  }

  snap.forEach(docSnap => {

    const l = docSnap.data();

    table.innerHTML += `
      <tr>

        <td>${l.memberName}</td>

        <td>${l.loanAmount}</td>

        <td>${l.interestType}</td>

        <td>${l.interestRate}%</td>

        <td>${l.totalPayable}</td>

        <td>${l.remainingLoan}</td>

        <td>${l.duration}</td>

        <td>${l.status}</td>

        <td>
          ${
            l.createdAt
            ? new Date(l.createdAt.seconds * 1000).toLocaleDateString()
            : "-"
          }
        </td>

      </tr>
    `;
  });
}

/* =========================
   CREATE LOAN
========================= */
document.getElementById("loanForm")
.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    const memberId = document.getElementById("member").value;
    const amount = Number(document.getElementById("amount").value);
    const interest = Number(document.getElementById("interest").value);
    const interestType = document.getElementById("interestType").value;
    const duration = document.getElementById("duration").value;
    const note = document.getElementById("note").value;

    const memberRef = doc(db, "members", memberId);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      alert("Member not found");
      return;
    }

    const member = memberSnap.data();

    const interestAmount = amount * interest / 100;
    const totalPayable = amount + interestAmount;

    const user = auth.currentUser;

    await addDoc(collection(db, "loans"), {

      memberId,
      memberName: member.name,

      loanAmount: amount,

      interestRate: interest,
      interestType: interestType,

      totalPayable,
      remainingLoan: totalPayable,

      duration,
      note,

      status: "active",

      createdAt: serverTimestamp(),
      createdBy: user ? user.uid : "unknown"

    });

    await updateDoc(memberRef, {

      loanTotal: totalPayable,
      loanRemaining: totalPayable,

      lastUpdatedAt: serverTimestamp(),
      lastUpdatedBy: user ? user.uid : "unknown"

    });

    alert("Loan created successfully");

    document.getElementById("loanForm").reset();
    closeModal();
    loadLoans();

  } catch (err) {

    console.error(err);
    alert("Failed to create loan");
  }

});

/* =========================
   SEARCH
========================= */
document.getElementById("searchInput")
.addEventListener("keyup", function () {

  const val = this.value.toLowerCase();

  document.querySelectorAll("#loanTable tr")
  .forEach(row => {

    row.style.display =
      row.innerText.toLowerCase().includes(val)
      ? ""
      : "none";
  });

});

/* INIT */
loadMembers();
loadLoans();
