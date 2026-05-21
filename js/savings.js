// js/savings.js (UPGRADED REAL-TIME VERSION)

import { db, auth } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   ELEMENTS
========================= */

const table = document.getElementById("savingsTable");
const memberSelect = document.getElementById("member");

/* =========================
   CURRENT USER INFO
   (YOU SHOULD REPLACE WITH ROLES SYSTEM LATER)
========================= */

function getUserName() {
  const user = auth.currentUser;
  return user ? user.email || user.uid : "unknown";
}

/* =========================
   LOAD MEMBERS (ONE TIME)
========================= */

async function loadMembers() {
  const snapshot = await getDocs(collection(db, "members"));

  memberSelect.innerHTML = `<option value="">Select member</option>`;

  snapshot.forEach((docSnap) => {
    const m = docSnap.data();

    memberSelect.innerHTML += `
      <option value="${docSnap.id}">
        ${m.name}
      </option>
    `;
  });
}

/* =========================
   REAL-TIME SAVINGS LIST
========================= */

function loadSavings() {

  onSnapshot(collection(db, "savings"), (snapshot) => {

    table.innerHTML = "";

    if (snapshot.empty) {
      table.innerHTML = `
        <tr>
          <td colspan="9">No savings found</td>
        </tr>
      `;
      return;
    }

    snapshot.forEach((docSnap) => {

      const s = docSnap.data();

      table.innerHTML += `
        <tr>

          <td>${s.memberName}</td>

          <td>${s.amount} ETB</td>

          <td>${s.previousBalance ?? 0} ETB</td>

          <td>${s.newBalance ?? 0} ETB</td>

          <td>${s.paymentMethod || "-"}</td>

          <td>${s.note || "-"}</td>

          <td>
            ${s.createdAt
              ? new Date(s.createdAt.seconds * 1000).toLocaleString()
              : "-"}
          </td>

          <td><b>${s.createdByName || "unknown"}</b></td>

          <td>
            <span class="badge active">
              ${s.status || "completed"}
            </span>
          </td>

        </tr>
      `;
    });

  });
}

/* =========================
   ADD SAVINGS
========================= */

document.getElementById("savingForm")
.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    const memberId = document.getElementById("member").value;
    const amount = Number(document.getElementById("amount").value);
    const paymentMethod = document.getElementById("paymentMethod").value;
    const note = document.getElementById("note").value;

    if (!memberId || !amount) {
      alert("Fill all required fields");
      return;
    }

    /* GET MEMBER */
    const memberRef = doc(db, "members", memberId);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      alert("Member not found");
      return;
    }

    const member = memberSnap.data();

    const previousBalance = member.savings || 0;
    const newBalance = previousBalance + amount;

    const userName = getUserName();

    /* SAVE SAVINGS */
    await addDoc(collection(db, "savings"), {
      memberId,
      memberName: member.name,
      amount,
      previousBalance,
      newBalance,
      paymentMethod,
      note,

      status: "completed",

      createdAt: serverTimestamp(),

      createdByName: userName
    });

    /* UPDATE MEMBER BALANCE */
    await updateDoc(memberRef, {
      savings: newBalance,
      lastUpdatedAt: serverTimestamp(),
      lastUpdatedBy: userName
    });

    alert("Savings added successfully");

    document.getElementById("savingForm").reset();

  } catch (error) {
    console.error(error);
    alert("Failed to save savings");
  }

});

/* =========================
   SEARCH FILTER
========================= */

document.getElementById("searchInput")
.addEventListener("keyup", function () {

  const value = this.value.toLowerCase();

  document.querySelectorAll("#savingsTable tr").forEach(row => {

    row.style.display =
      row.innerText.toLowerCase().includes(value)
        ? ""
        : "none";

  });

});

/* =========================
   INIT
========================= */

loadMembers();
loadSavings();
