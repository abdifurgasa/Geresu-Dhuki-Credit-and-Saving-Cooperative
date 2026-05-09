
import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   STATE
========================= */
let selectedMember = null;

/* =========================
   ELEMENTS
========================= */
const searchInput =
  document.getElementById("memberSearch");

const resultsBox =
  document.getElementById("searchResults");

const selectedBox =
  document.getElementById("selectedMember");

const table =
  document.getElementById("loanTable");

/* =========================
   SEARCH MEMBERS
========================= */
window.searchMembers = async function () {

  const value =
    searchInput.value.toLowerCase();

  resultsBox.innerHTML = "";

  const snap =
    await getDocs(collection(db, "members"));

  let found = false;

  snap.forEach(docSnap => {

    const m = docSnap.data();

    if (
      m.name.toLowerCase().includes(value) ||
      m.phone.includes(value) ||
      m.nid.includes(value)
    ) {

      found = true;

      const div =
        document.createElement("div");

      div.className = "result-item";

      div.innerHTML = `
        <b>${m.name}</b><br>
        ${m.phone} | ${m.nid}
      `;

      div.onclick = () => {

        selectedMember = {
          id: docSnap.id,
          ...m
        };

        selectedBox.innerHTML = `
          <b>${m.name}</b><br>
          ${m.phone}<br>
          ${m.nid}
        `;

        resultsBox.innerHTML = "";
        searchInput.value = "";
      };

      resultsBox.appendChild(div);
    }
  });

  if (!found) {

    resultsBox.innerHTML =
      "<div class='result-item'>No member found</div>";
  }
};

/* =========================
   CREATE LOAN
========================= */
window.createLoan = async function () {

  const amount =
    Number(document.getElementById("loanAmount").value);

  const interest =
    Number(document.getElementById("interest").value);

  if (!selectedMember) {

    alert("Select member first");

    return;
  }

  if (!amount || amount <= 0) {

    alert("Enter valid loan amount");

    return;
  }

  if (interest < 0) {

    alert("Invalid interest");

    return;
  }

  try {

    /* CHECK ACTIVE LOAN */
    const snap =
      await getDocs(collection(db, "loans"));

    let hasActive = false;

    snap.forEach(d => {

      const l = d.data();

      if (
        l.memberId === selectedMember.id &&
        l.status === "Active"
      ) {

        hasActive = true;
      }
    });

    if (hasActive) {

      alert("Member already has active loan");

      return;
    }

    const total =
      amount + (amount * interest / 100);

    await addDoc(collection(db, "loans"), {

      memberId: selectedMember.id,
      name: selectedMember.name,
      phone: selectedMember.phone,

      amount: amount,
      interest: interest,
      total: total,

      paid: 0,
      remaining: total,

      status: "Active",

      date: Date.now()

    });

    alert("Loan created successfully");

    document.getElementById("loanAmount").value = "";
    document.getElementById("interest").value = "";

    selectedMember = null;

    selectedBox.innerHTML =
      "No member selected";

    loadLoans();

  } catch (err) {

    console.error(err);

    alert("Loan creation failed");
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

        <td>${l.amount}</td>

        <td>${l.interest}%</td>

        <td>${l.total}</td>

        <td>${l.paid}</td>

        <td>${l.remaining}</td>

        <td>
          <span class="status ${l.status === "Active" ? "active" : "inactive"}">
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
