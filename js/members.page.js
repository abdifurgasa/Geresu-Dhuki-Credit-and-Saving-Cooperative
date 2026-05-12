import {
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   REALTIME MEMBERS SYSTEM
========================= */

function loadMembersRealtime() {

  onSnapshot(
    collection(db, "members"),

    async (memberSnap) => {

      table.innerHTML = "";

      /* =========================
         LOAD OTHER COLLECTIONS
      ========================= */

      const savingsSnap =
        await getDocs(collection(db, "savings"));

      const loansSnap =
        await getDocs(collection(db, "loans"));

      const repaymentsSnap =
        await getDocs(collection(db, "repayments"));

      /* =========================
         LOOP MEMBERS
      ========================= */

      memberSnap.forEach(memberDoc => {

        const m = memberDoc.data();

        let totalSavings = 0;
        let totalLoans = 0;
        let totalRepayments = 0;

        /* =========================
           SAVINGS
        ========================= */

        savingsSnap.forEach(s => {

          const saving = s.data();

          if (
            saving.memberId === memberDoc.id
          ) {

            totalSavings += Number(
              saving.amount || 0
            );
          }
        });

        /* =========================
           LOANS
        ========================= */

        loansSnap.forEach(l => {

          const loan = l.data();

          if (
            loan.memberId === memberDoc.id
          ) {

            totalLoans += Number(
              loan.totalAmount ||
              loan.amount ||
              0
            );
          }
        });

        /* =========================
           REPAYMENTS
        ========================= */

        repaymentsSnap.forEach(r => {

          const repayment = r.data();

          if (
            repayment.memberId === memberDoc.id
          ) {

            totalRepayments += Number(
              repayment.amount || 0
            );
          }
        });

        /* =========================
           REMAINING
        ========================= */

        const remaining =
          totalLoans - totalRepayments;

        /* =========================
           TABLE ROW
        ========================= */

        const row =
          document.createElement("tr");

        row.innerHTML = `

          <td>

            <div style="
              display:flex;
              align-items:center;
              gap:10px;
            ">

              <img
                src="${
                  m.photo ||
                  'https://via.placeholder.com/40'
                }"

                style="
                  width:40px;
                  height:40px;
                  border-radius:50%;
                  object-fit:cover;
                "
              >

              <strong>

                ${m.name}

              </strong>

            </div>

          </td>

          <td>

            ${m.phone}

          </td>

          <td>

            ${m.nid}

          </td>

          <td>

            ${totalSavings.toLocaleString()} ETB

          </td>

          <td>

            ${totalLoans.toLocaleString()} ETB

          </td>

          <td>

            ${totalRepayments.toLocaleString()} ETB

          </td>

          <td>

            ${remaining.toLocaleString()} ETB

          </td>

          <td>

            <span class="status active">

              ${m.status || "Active"}

            </span>

          </td>

          <td>

            <button
              class="btn success"
              onclick="editMember('${memberDoc.id}')"
            >

              Edit

            </button>

            <button
              class="btn danger"
              data-id="${memberDoc.id}"
            >

              Delete

            </button>

          </td>
        `;

        table.appendChild(row);
      });

      /* =========================
         UPDATE CARDS
      ========================= */

      updateDashboardCards(memberSnap);
    }
  );
}
