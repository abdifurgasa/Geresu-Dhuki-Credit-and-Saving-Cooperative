import { db, app } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

/* =========================
   STORAGE
========================= */

const storage = getStorage(app);

/* =========================
   ELEMENTS
========================= */

const table =
  document.getElementById("memberTable");

const searchBox =
  document.getElementById("searchBox");

const modal =
  document.getElementById("modal");

/* =========================
   STATE
========================= */

let editId = null;

/* =========================
   OPEN MODAL
========================= */

function openModal() {

  modal.style.display = "flex";

  document.getElementById("formTitle")
    .innerText = "Add Member";

  clearForm();

  editId = null;
}

/* =========================
   CLOSE MODAL
========================= */

function closeModal() {

  modal.style.display = "none";

  clearForm();

  editId = null;
}

/* =========================
   CLEAR FORM
========================= */

function clearForm() {

  document.getElementById("name").value = "";

  document.getElementById("phone").value = "";

  document.getElementById("nid").value = "";

  document.getElementById("photo").value = "";

  document.getElementById("previewImage")
    .src =
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

    if (ignoreId && d.id === ignoreId)
      return;

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

  /* VALIDATE */

  if (!validate(name, phone, nid))
    return;

  /* DUPLICATE CHECK */

  const duplicate =
    await isDuplicate(
      phone,
      nid,
      editId
    );

  if (duplicate) {

    alert(
      "Duplicate Phone or National ID"
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

    closeModal();

    loadMembers();

    loadCards();

  }

  catch (error) {

    console.error(error);

    alert(
      "Error saving member"
    );
  }
}

/* =========================
   LOAD MEMBERS
========================= */

async function loadMembers() {

  table.innerHTML = "";

  const memberSnap =
    await getDocs(collection(db, "members"));

  const savingsSnap =
    await getDocs(collection(db, "savings"));

  const loansSnap =
    await getDocs(collection(db, "loans"));

  memberSnap.forEach(memberDoc => {

    const m = memberDoc.data();

    let totalSavings = 0;

    let totalLoans = 0;

    let remainingLoans = 0;

    /* SAVINGS */

    savingsSnap.forEach(s => {

      const saving = s.data();

      if (
        saving.memberId === memberDoc.id
      ) {

        totalSavings +=
          Number(saving.amount || 0);
      }
    });

    /* LOANS */

    loansSnap.forEach(l => {

      const loan = l.data();

      if (
        loan.memberId === memberDoc.id
      ) {

        totalLoans +=
          Number(
            loan.totalAmount || 0
          );

        remainingLoans +=
          Number(
            loan.remaining || 0
          );
      }
    });

    table.innerHTML += `

      <tr>

        <td>

          <div style="
            display:flex;
            align-items:center;
            gap:10px;
          ">

            <img
              src="${
                m.photo ||
                'https://via.placeholder.com/50'
              }"

              style="
                width:50px;
                height:50px;
                border-radius:50%;
                object-fit:cover;
              "
            >

            <div>

              <strong>

                ${m.name}

              </strong>

            </div>

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

          ${remainingLoans.toLocaleString()} ETB

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

            onclick="deleteMember(
              '${memberDoc.id}'
            )"
          >

            Delete

          </button>

        </td>

      </tr>
    `;
  });
}

/* =========================
   LOAD CARDS
========================= */

async function loadCards() {

  const snap =
    await getDocs(collection(db, "members"));

  let total = snap.size;

  let active = 0;

  let verified = 0;

  let newMembers = 0;

  const currentMonth =
    new Date().getMonth();

  snap.forEach(doc => {

    const m = doc.data();

    if (
      (m.status || "")
      .toLowerCase() === "active"
    ) {

      active++;
    }

    if (m.verified) {

      verified++;
    }

    if (m.createdAt) {

      const createdDate =
        new Date(m.createdAt);

      if (
        createdDate.getMonth() ===
        currentMonth
      ) {

        newMembers++;
      }
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
  ).innerText = verified;

  document.getElementById(
    "newCount"
  ).innerText = newMembers;
}

/* =========================
   EDIT MEMBER
========================= */

function editMember(
  id,
  name,
  phone,
  nid
) {

  editId = id;

  modal.style.display = "flex";

  document.getElementById("formTitle")
    .innerText = "Edit Member";

  document.getElementById("name")
    .value = name;

  document.getElementById("phone")
    .value = phone;

  document.getElementById("nid")
    .value = nid;
}

/* =========================
   DELETE MEMBER
========================= */

async function deleteMember(id) {

  if (
    !confirm(
      "Delete this member?"
    )
  ) return;

  await deleteDoc(
    doc(db, "members", id)
  );

  alert(
    "Member deleted successfully"
  );

  loadMembers();

  loadCards();
}

/* =========================
   SEARCH MEMBERS
========================= */

searchBox.addEventListener(
  "input",

  async function () {

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
   GLOBAL FUNCTIONS
========================= */

window.openModal = openModal;

window.closeModal = closeModal;

window.saveMember = saveMember;

window.editMember = editMember;

window.deleteMember = deleteMember;

/* =========================
   INIT
========================= */

loadMembers();

loadCards();
