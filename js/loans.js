import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GLOBAL VARIABLES
========================= */
let selectedMember = null;

/* =========================
   SEARCH MEMBERS
========================= */
window.searchMembers = async function () {

  const keyword =
    document.getElementById("memberSearch")
    .value
    .trim()
    .toLowerCase();

  const resultsBox =
    document.getElementById("searchResults");

  resultsBox.innerHTML = "";

  if (!keyword) {

    alert("Enter member name or phone");
    return;
  }

  try {

    const snap =
      await getDocs(
        collection(db, "members")
      );

    let found = false;

    snap.forEach((memberDoc) => {

      const data = memberDoc.data();

      const name =
        (data.name || "").toLowerCase();

      const phone =
        (data.phone || "").toLowerCase();

      const nid =
        (data.nid || "").toLowerCase();

      if (
        name.includes(keyword) ||
        phone.includes(keyword) ||
        nid.includes(keyword)
      ) {

        found = true;

        const div =
          document.createElement("div");

        div.className =
          "result-item";

        div.innerHTML = `
          <strong>${data.name}</strong><br>
          ${data.phone}
        `;

        div.onclick = () => {

          selectedMember = {
            id: memberDoc.id,
            ...data
          };

          document.getElementById(
            "selectedMember"
          ).innerHTML = `
            ✅ Selected:
            <strong>${data.name}</strong>
            (${data.phone})
          `;

          resultsBox.innerHTML = "";
        };

        resultsBox.appendChild(div);
      }
    });

    if (!found) {

      resultsBox.innerHTML = `
        <div class="result-item">
          No member found
        </div>
      `;
    }

  } catch (err) {

    console.error(err);

    alert("Search failed");
  }
};

/* =========================
   CALCULATE LOAN
========================= */
window.calculateLoan = function () {

  const amount =
    Number(
      document.getElementById("loanAmount").value
    );

  const rate =
    Number(
      document.getElementById("interestRate").value
    );

  let duration =
    Number(
      document.getElementById("duration").value
    );

  const type =
    document.getElementById("durationType").value;

  if (
    !amount ||
    !rate ||
    !duration
  ) {

    alert("Fill all fields");
    return;
  }

  /* CONVERT YEARS TO MONTHS */
  if (type === "years") {

    duration =
      duration * 12;
  }

  /* SIMPLE INTEREST */
  const interestAmount =
    (amount * rate / 100);

  const totalRepayment =
    amount + interestAmount;

  const monthlyPayment =
    totalRepayment / duration;

  document.getElementById(
    "monthlyPayment"
  ).innerText =
    monthlyPayment.toFixed(2) + " ETB";

  document.getElementById(
    "totalRepayment"
  ).innerText =
    totalRepayment.toFixed(2) + " ETB";

  document.getElementById(
    "totalInterest"
  ).innerText =
    interestAmount.toFixed(2) + " ETB";
};

/* =========================
   CREATE LOAN
========================= */
window.createLoan = async function () {

  if (!selectedMember) {

    alert("Select member first");
    return;
  }

  const amount =
    Number(
      document.getElementById("loanAmount").value
    );

  const rate =
    Number(
      document.getElementById("interestRate").value
    );

  let duration =
    Number(
      document.getElementById("duration").value
    );

  const type =
    document.getElementById("durationType").value;

  if (
    !amount ||
    !rate ||
    !duration
  ) {

    alert("Fill all fields");
    return;
  }

  if (type === "years") {

    duration =
      duration * 12;
  }

  /* CALCULATIONS */
  const interestAmount =
    (amount * rate / 100);

  const total =
    amount + interestAmount;

  const monthly =
    total / duration;

  const dueDate =
    new Date();

  dueDate.setMonth(
    dueDate.getMonth() + duration
  );

  try {

    await addDoc(
      collection(db, "loans"),
      {

        memberId:
          selectedMember.id,

        memberName:
          selectedMember.name,

        amount:
          amount,

        interestRate:
          rate,

        interest:
          interestAmount,

        duration:
          duration,

        monthlyPayment:
          monthly,

        totalRepayment:
          total,

        paid:
          0,

        remaining:
          total,

        status:
          "Active",

        createdAt:
          new Date(),

        dueDate:
          dueDate.toISOString()
      }
    );

    alert("Loan created successfully");

    loadLoans();

  }

  catch (err) {

    console.error(err);

    alert("Loan creation failed");
  }
};

/* =========================
   LOAD LOANS
========================= */
async function loadLoans() {

  const table =
    document.getElementById("loanTable");

  table.innerHTML = "";

  try {

    const snap =
      await getDocs(
        collection(db, "loans")
      );

    snap.forEach((loanDoc) => {

      const loan =
        loanDoc.data();

      table.innerHTML += `

        <tr>

          <td>
            ${loan.memberName}
          </td>

          <td>
            ${loan.amount.toLocaleString()} ETB
          </td>

          <td>
            ${loan.interestRate}%
          </td>

          <td>
            ${loan.duration} Months
          </td>

          <td>
            ${loan.monthlyPayment.toFixed(2)} ETB
          </td>

          <td>
            ${loan.totalRepayment.toLocaleString()} ETB
          </td>

          <td>
            ${loan.paid.toLocaleString()} ETB
          </td>

          <td>
            ${loan.remaining.toLocaleString()} ETB
          </td>

          <td>
            <span class="status active">
              ${loan.status}
            </span>
          </td>

        </tr>
      `;
    });

  }

  catch (err) {

    console.error(err);
  }
}

/* =========================
   INITIAL LOAD
========================= */
loadLoans();
