import { db, storage } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

/* =========================
   ELEMENTS
========================= */

const table =
  document.getElementById("memberTable");

const modal =
  document.getElementById("modal");

const searchBox =
  document.getElementById("searchBox");

/* =========================
   STATE
========================= */

let editId = null;

/* =========================
   OPEN MODAL
========================= */

document
  .getElementById("btnOpenModal")
  .addEventListener("click", () => {

    modal.classList.remove("hidden");

    document.getElementById(
      "modalTitle"
    ).innerText = "Add Member";

    clearForm();

    editId = null;
  });

/* =========================
   CLOSE MODAL
========================= */

document
  .getElementById("btnClose")
  .addEventListener("click", () => {

    modal.classList.add("hidden");
  });

/* =========================
   IMAGE PREVIEW
========================= */

document
  .getElementById("photo")
  .addEventListener("change", e => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {

      document.getElementById(
        "previewImage"
      ).src = event.target.result;
    };

    reader.readAsDataURL(file);
  });

/* =========================
   CLEAR FORM
========================= */

function clearForm() {

  document.getElementById("name").value = "";

  document.getElementById("phone").value = "";

  document.getElementById("nid").value = "";

  document.getElementById("photo").value = "";

  document.getElementById(
    "previewImage"
  ).src =
    "https://via.placeholder.com/100";
}

/* =========================
   VALIDATION
========================= */

function validate(name, phone, nid) {

  if (!name || !phone || !nid) {

    alert("All fields are required");

    return false;
  }

  /* PHONE = 9 DIGITS */

  if (!/^[0-9]{9}$/.test(phone)) {

    alert(
      "Phone number must be exactly 9 digits"
    );

    return false;
  }

  /* NID = 16 DIGITS */

  if (!/^[0-9]{16}$/.test(nid)) {

    alert(
      "National ID must be exactly 16 digits"
    );

    return false;
  }

  return true;
}

/* =========================
   DUPLICATE CHECK
========================= */

async function isDuplicate(
  phone,
  nid,
  ignoreId = null
) {

  const snap =
    await getDocs(collection(db, "members"));

  let found = false;

  snap.forEach(d => {

    const m = d.data();

    if (
      ignoreId &&
      d.id === ignoreId
    ) return;

    if (
      m.phone === phone ||
      m.nid === nid
    ) {

      found = true;
    }
  });

  return found;
}

/* =========================
   SAVE MEMBER
========================= */

document
  .getElementById("btnSave")
  .addEventListener("click", saveMember);

async function saveMember() {

  const name =
    document.getElementById("name")
    .value.trim();

  const phone =
    document.getElementById("phone")
    .value.trim();

  const nid =
    document.getElementById("nid")
    .value.trim();

  const photoFile =
    document.getElementById("photo")
    .files[0];

  /* VALIDATION */

  if (!validate(name, phone, nid))
    return;

  /* DUPLICATE */

  const duplicate =
    await isDuplicate(
      phone,
      nid,
      editId
    );

  if (duplicate) {

    alert(
      "Duplicate phone or National ID"
    );

    return;
  }

  try {

    let photoURL = "";

    /* =========================
       PHOTO UPLOAD
    ========================= */

    if (photoFile) {

      const storageRef = ref(

        storage,

        "members/" +
        Date.now() +
        "_" +
        photoFile.name
      );

      await uploadBytes(
        storageRef,
        photoFile
      );

      photoURL =
        await getDownloadURL(storageRef);
    }

    /* =========================
       UPDATE MEMBER
    ========================= */

    if (editId) {

      const updateData = {

        name,
        phone,
        nid
      };

      if (photoURL) {

        updateData.photo =
          photoURL;
      }

      await updateDoc(

        doc(db, "members", editId),

        updateData
      );

      alert(
        "Member updated successfully"
      );
    }

    /* =========================
       ADD MEMBER
    ========================= */

    else {

      await addDoc(

        collection(db, "members"),

        {

          name,
          phone,
          nid,

          photo: photoURL,

          status: "Active",

          verified: true,

          createdAt: new Date()
        }
      );

      alert(
        "Member saved successfully"
      );
    }

    modal.classList.add("hidden");

    clearForm();

  }

  catch (error) {

    console.error(error);

    alert(
      "Error saving member"
    );
  }
}

/* =========================
   REALTIME MEMBERS SYSTEM
========================= */

function loadMembersRealtime() {

  onSnapshot(

    collection(db, "members"),

    async (memberSnap) => {

      table.innerHTML = "";

      /* =========================
         LOAD COLLECTIONS
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
              onclick="editMember(
                '${memberDoc.id}',
                '${m.name}',
                '${m.phone}',
                '${m.nid}'
              )"
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

      /* UPDATE CARDS */

      updateDashboardCards(memberSnap);
    }
  );
}

/* =========================
   DASHBOARD CARDS
========================= */

function updateDashboardCards(memberSnap) {

  let total =
    memberSnap.size;

  let active = 0;

  memberSnap.forEach(doc => {

    const m = doc.data();

    if (
      (m.status || "")
      .toLowerCase() === "active"
    ) {

      active++;
    }
  });

  document.getElementById(
    "memberCount"
  ).innerText = total;

  document.getElementById(
    "activeCount"
  ).innerText = active;

  document.getElementById(
    "verifiedCount"
  ).innerText = total;
}

/* =========================
   EDIT MEMBER
========================= */

window.editMember = function (
  id,
  name,
  phone,
  nid
) {

  editId = id;

  modal.classList.remove("hidden");

  document.getElementById(
    "modalTitle"
  ).innerText = "Edit Member";

  document.getElementById("name")
    .value = name;

  document.getElementById("phone")
    .value = phone;

  document.getElementById("nid")
    .value = nid;
};

/* =========================
   DELETE MEMBER
========================= */

table.addEventListener(
  "click",

  async (e) => {

    if (
      e.target.dataset.id
    ) {

      const id =
        e.target.dataset.id;

      const confirmDelete =
        confirm(
          "Delete this member?"
        );

      if (!confirmDelete)
        return;

      await deleteDoc(
        doc(db, "members", id)
      );

      alert(
        "Member deleted successfully"
      );
    }
  }
);

/* =========================
   SEARCH FILTER
========================= */

searchBox.addEventListener(
  "input",

  function () {

    const value =
      this.value.toLowerCase();

    const rows =
      table.querySelectorAll("tr");

    rows.forEach(row => {

      if (
        row.innerText
          .toLowerCase()
          .includes(value)
      ) {

        row.style.display = "";

      } else {

        row.style.display = "none";
      }
    });
  }
);

/* =========================
   INIT
========================= */

loadMembersRealtime();
