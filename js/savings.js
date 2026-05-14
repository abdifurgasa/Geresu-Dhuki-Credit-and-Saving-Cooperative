// js/savings.js

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

/* =========================
   TABLE
========================= */
const table =
  document.getElementById("savingsTable");

/* =========================
   MEMBER SELECT
========================= */
const memberSelect =
  document.getElementById("member");

/* =========================
   LOAD MEMBERS
========================= */
async function loadMembers() {

  const snapshot =
    await getDocs(
      collection(db, "members")
    );

  snapshot.forEach((docSnap) => {

    const member = docSnap.data();

    memberSelect.innerHTML += `

      <option value="${docSnap.id}">

        ${member.name}

      </option>

    `;
  });
}

/* =========================
   LOAD SAVINGS
========================= */
async function loadSavings() {

  table.innerHTML = "";

  const snapshot =
    await getDocs(
      collection(db, "savings")
    );

  if (snapshot.empty) {

    table.innerHTML = `
      <tr>
        <td colspan="9">
          No savings found
        </td>
      </tr>
    `;

    return;
  }

  snapshot.forEach((docSnap) => {

    const s = docSnap.data();

    table.innerHTML += `

      <tr>

        <td>
          ${s.memberName}
        </td>

        <td>
          ${s.amount} ETB
        </td>

        <td>
          ${s.previousBalance} ETB
        </td>

        <td>
          ${s.newBalance} ETB
        </td>

        <td>
          ${s.paymentMethod}
        </td>

        <td>
          ${s.note || "-"}
        </td>

        <td>

          ${
            s.createdAt
            ? new Date(
                s.createdAt.seconds * 1000
              ).toLocaleDateString()
            : "-"
          }

        </td>

        <td>
          ${s.createdBy || "-"}
        </td>

        <td>

          <span class="badge active">
            ${s.status}
          </span>

        </td>

      </tr>

    `;
  });
}

/* =========================
   ADD SAVINGS
========================= */
document
.getElementById("savingForm")
.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    /* FORM VALUES */
    const memberId =
      document.getElementById("member").value;

    const amount =
      Number(
        document.getElementById("amount").value
      );

    const paymentMethod =
      document.getElementById("paymentMethod").value;

    const note =
      document.getElementById("note").value;

    /* GET MEMBER */
    const memberRef =
      doc(db, "members", memberId);

    const memberSnap =
      await getDoc(memberRef);

    if (!memberSnap.exists()) {

      alert("Member not found");

      return;
    }

    const member =
      memberSnap.data();

    /* BALANCE */
    const previousBalance =
      member.savings || 0;

    const newBalance =
      previousBalance + amount;

    /* CURRENT USER */
    const user =
      auth.currentUser;

    /* SAVE TRANSACTION */
    await addDoc(
      collection(db, "savings"),
      {

        memberId,

        memberName:
          member.name,

        amount,

        previousBalance,

        newBalance,

        paymentMethod,

        note,

        status: "completed",

        createdAt:
          serverTimestamp(),

        createdBy:
          user
          ? user.uid
          : "unknown"

      }
    );

    /* UPDATE MEMBER */
    await updateDoc(
      memberRef,
      {

        savings:
          newBalance,

        lastUpdatedAt:
          serverTimestamp(),

        lastUpdatedBy:
          user
          ? user.uid
          : "unknown"

      }
    );

    alert("Savings added successfully");

    /* RESET */
    document
      .getElementById("savingForm")
      .reset();

    closeModal();

    loadSavings();

  } catch (error) {

    console.error(error);

    alert("Failed to save");
  }

});

/* =========================
   SEARCH
========================= */
document
.getElementById("searchInput")
.addEventListener("keyup", function () {

  const value =
    this.value.toLowerCase();

  const rows =
    document.querySelectorAll(
      "#savingsTable tr"
    );

  rows.forEach((row) => {

    row.style.display =
      row.innerText
        .toLowerCase()
        .includes(value)

      ? ""

      : "none";

  });

});

/* =========================
   INITIAL LOAD
========================= */
loadMembers();

loadSavings();
