
import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   STATE
========================= */
let selectedLoan = null;

/* =========================
   ELEMENTS
========================= */
const searchInput =
  document.getElementById("memberSearch");

const resultsBox =
  document.getElementById("searchResults");

const selectedBox =
  document.getElementById("selectedLoan");

const table =
  document.getElementById("loanTable");

/* =========================
   SEARCH LOANS
========================= */
window.searchLoans = async function () {

  const value =
    searchInput.value.toLowerCase();

  resultsBox.innerHTML = "";

  const snap =
    await getDocs(collection(db, "loans"));

  let found = false;

  snap.forEach(docSnap => {

    const l = docSnap.data();

    if (
      l.name.toLowerCase().includes(value) ||
      l.phone.includes(value)
    ) {

      found = true;

      const div =
        document.createElement("div");

      div.className = "result-item";

      div.innerHTML = `
        <b>${l.name}</b><br>
        Loan: ${l.total} ETB | Remaining: ${l.remaining}
      `;

      div.onclick = () => {

        selectedLoan = {
          id: docSnap.id,
          ...l
        };

        selectedBox.innerHTML = `
          <b>${l.name}</b><br>
          Loan: ${l.total} ETB<br>
          Remaining: ${l.remaining} ETB
        `;

        resultsBox.innerHTML = "";
        searchInput.value = "";
      };

      resultsBox.appendChild(div);
    }
  });

  if (!found) {

    resultsBox.innerHTML =
      "<div class='result-item'>No loan found</div>";
  }
};

/* =========================
   MAKE REPAYMENT
========================= */
window.makeRepayment = async function () {

  const amount =
    Number(document.getElementById("payAmount").value);

  if (!selectedLoan) {

    alert("Select a loan first");

    return;
  }

  if (!amount || amount <= 0) {

    alert("Enter valid amount");

    return;
  }

  try {

    const newPaid =
      selectedLoan.paid + amount;

    const newRemaining =
      selectedLoan.total - newPaid;

    if (newRemaining < 0) {

      alert("Payment exceeds loan balance");

      return;
    }

    let status = "Active";

    if (newRemaining === 0) {

      status = "Paid";
    }

    /* UPDATE LOAN */
    const loanRef =
      doc(db, "loans", selectedLoan.id);

    await updateDoc(loanRef, {

      paid: newPaid,
      remaining: newRemaining,
      status: status

    });

    /* SAVE TRANSACTION HISTORY */
    await addDoc(collection(db, "repayments"), {

      loanId: selectedLoan.id,
      name: selectedLoan.name,
      amount: amount,
      date: Date.now()

    });

    alert("Payment successful");

    document.getElementById("payAmount").value = "";

    selectedLoan = null;

    selectedBox.innerHTML =
      "No loan selected";

    loadLoans();

  } catch (err) {

    console.error(err);

    alert("Payment failed");
  }
};

/* =========================
   LOAD LOANS
========================= */
async function loadLoans() {

  table.innerHTML = "";

  const snap =
    await getDocs(collection(db, "loans"));

  snap.forEach(docSnap => {

    const l = docSnap.data();

    table.innerHTML += `
      <tr>

        <td>${l.name}</td>

        <td>${l.total} ETB</td>

        <td>${l.paid} ETB</td>

        <td>${l.remaining} ETB</td>

        <td>
          <span class="status ${l.status === "Paid" ? "inactive" : "active"}">
            ${l.status}
          </span>
        </td>

      </tr>
    `;
  });
}

/* =========================
   INIT
========================= */
loadLoans();
