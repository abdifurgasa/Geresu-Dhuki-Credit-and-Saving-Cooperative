import { db } from "./firebase.js";

import {

  collection,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  doc

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GLOBAL
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

  const snap =
    await getDocs(
      collection(db, "members")
    );

  snap.forEach((memberDoc) => {

    const data =
      memberDoc.data();

    const name =
      (data.name || "")
      .toLowerCase();

    const phone =
      (data.phone || "")
      .toLowerCase();

    const nid =
      (data.nid || "")
      .toLowerCase();

    if (
      name.includes(keyword) ||
      phone.includes(keyword) ||
      nid.includes(keyword)
    ) {

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
        `;

        resultsBox.innerHTML = "";
      };

      resultsBox.appendChild(div);
    }
  });
};

/* =========================
   PROCESS TRANSACTION
========================= */
window.processTransaction =
async function () {

  if (!selectedMember) {

    alert("Select member first");
    return;
  }

  const type =
    document.getElementById(
      "transactionType"
    ).value;

  const amount =
    Number(
      document.getElementById(
        "amount"
      ).value
    );

  if (!type || !amount) {

    alert("Fill all fields");
    return;
  }

  try {

    /* =====================
       SAVING DEPOSIT
    ===================== */
    if (type === "saving") {

      await addDoc(
        collection(db, "savings"),
        {

          memberId:
            selectedMember.id,

          memberName:
            selectedMember.name,

          amount:
            amount,

          createdAt:
            new Date()
        }
      );
    }

    /* =====================
       LOAN REPAYMENT
    ===================== */
    if (type === "repayment") {

      const q =
        query(
          collection(db, "loans"),
          where(
            "memberId",
            "==",
            selectedMember.id
          )
        );

      const loanSnap =
        await getDocs(q);

      if (loanSnap.empty) {

        alert("No loan found");
        return;
      }

      const loanDoc =
        loanSnap.docs[0];

      const loan =
        loanDoc.data();

      const newPaid =
        Number(loan.paid || 0)
        + amount;

      const newRemaining =
        Number(loan.totalRepayment)
        - newPaid;

      let status =
        "Active";

      if (newRemaining <= 0) {

        status =
          "Completed";
      }

      await updateDoc(
        doc(db, "loans", loanDoc.id),
        {

          paid:
            newPaid,

          remaining:
            newRemaining,

          status:
            status
        }
      );
    }

    /* =====================
       SAVE TRANSACTION
    ===================== */
    await addDoc(
      collection(db, "transactions"),
      {

        memberId:
          selectedMember.id,

        memberName:
          selectedMember.name,

        type:
          type,

        amount:
          amount,

        createdAt:
          new Date()
      }
    );

    alert(
      "Transaction successful"
    );

    loadTransactions();

  }

  catch (err) {

    console.error(err);

    alert(
      "Transaction failed"
    );
  }
};

/* =========================
   LOAD TRANSACTIONS
========================= */
async function loadTransactions() {

  const table =
    document.getElementById(
      "transactionTable"
    );

  table.innerHTML = "";

  const snap =
    await getDocs(
      collection(db, "transactions")
    );

  snap.forEach((docItem) => {

    const data =
      docItem.data();

    table.innerHTML += `

      <tr>

        <td>
          ${data.memberName}
        </td>

        <td>
          ${data.type}
        </td>

        <td>
          ${Number(data.amount)
            .toLocaleString()} ETB
        </td>

        <td>
          ${new Date(
            data.createdAt.seconds * 1000
          ).toLocaleDateString()}
        </td>

      </tr>
    `;
  });
}

/* =========================
   INITIAL LOAD
========================= */
loadTransactions();
