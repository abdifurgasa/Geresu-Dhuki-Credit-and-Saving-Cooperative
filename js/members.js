import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

/* =========================
   FIREBASE STORAGE
========================= */
const storage = getStorage();

/* =========================
   ELEMENTS
========================= */
const table = document.getElementById("memberTable");

const searchBox =
  document.getElementById("searchBox");

const modal =
  document.getElementById("modal");

/* =========================
   STATE
========================= */
let editId = null;

let allMembers = [];

/* =========================
   OPEN MODAL
========================= */
window.openModal = function () {

  modal.style.display = "flex";

  document.getElementById("formTitle").innerText =
    "Add Member";

  clearForm();

  editId = null;
};

/* =========================
   CLOSE MODAL
========================= */
window.closeModal = function () {

  modal.style.display = "none";

  clearForm();

  editId = null;
};

/* =========================
   CLEAR FORM
========================= */
function clearForm() {

  document.getElementById("name").value = "";

  document.getElementById("phone").value = "";

  document.getElementById("nid").value = "";

  document.getElementById("photo").value = "";
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

    alert("Phone number must be exactly 9 digits");

    return false;
  }

  /* NATIONAL ID = 16 DIGITS */
  if (!/^[0-9]{16}$/.test(nid)) {

    alert("National ID must be exactly 16 digits");

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

  let duplicate = false;

  snap.forEach(d => {

    const member = d.data();

    /* IGNORE CURRENT EDIT MEMBER */
    if (ignoreId && d.id === ignoreId) {
      return;
    }

    /* DUPLICATE PHONE */
    if (member.phone === phone) {

      duplicate = true;
    }

    /* DUPLICATE NID */
    if (member.nid === nid) {

      duplicate = true;
    }
  });

  return duplicate;
}

/* =========================
   SAVE MEMBER
========================= */
window.saveMember = async function () {

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
  if (!validate(name, phone, nid)) {
    return;
  }

  /* CHECK DUPLICATES */
  const duplicate =
    await isDuplicate(phone, nid, editId);

  if (duplicate) {

    alert(
      "Duplicate detected!\nPhone or National ID already exists."
    );

    return;
  }

  try {

    let photoURL = "";

    /* =========================
       UPLOAD PHOTO
    ========================= */

    if (photoFile) {

      const imageRef = ref(
        storage,
        `members/${Date.now()}_${photoFile.name}`
      );

      await uploadBytes(
        imageRef,
        photoFile
      );

      photoURL =
        await getDownloadURL(imageRef);
    }

    /* =========================
       EDIT MEMBER
    ========================= */

    if (editId) {

      const updateData = {

        name,
        phone,
        nid
      };

      if (photoURL) {

        updateData.photoURL = photoURL;
      }

      await updateDoc(
        doc(db, "members", editId),
        updateData
      );

      alert("Member updated successfully");
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

          photoURL,

          status: "Active",

          verified: true,

          createdAt:
            serverTimestamp()
        }
      );

      alert("Member added successfully");
    }

    closeModal();

    loadMembers();

  }

  catch (error) {

    console.error(error);

    alert("Error saving member");
  }
};

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

  allMembers = [];

  /* =========================
     DASHBOARD COUNTS
  ========================= */

  let totalMembers = 0;

  let activeMembers = 0;

  let verifiedMembers = 0;

  let newThisMonth = 0;

  const currentMonth =
    new Date().getMonth();

  const currentYear =
    new Date().getFullYear();

  /* =========================
     MEMBER LOOP
  ========================= */

  memberSnap.forEach(memberDoc => {

    const m = memberDoc.data();

    totalMembers++;

    if (
      (m.status || "").toLowerCase()
      === "active"
    ) {

      activeMembers++;
    }

    if (m.verified) {

      verifiedMembers++;
    }

    if (m.createdAt?.toDate) {

      const created =
        m.createdAt.toDate();

      if (
        created.getMonth()
        === currentMonth &&

        created.getFullYear()
        === currentYear
      ) {

        newThisMonth++;
      }
    }

    /* =========================
       CALCULATE SAVINGS
    ========================= */

    let totalSavings = 0;

    savingsSnap.forEach(s => {

      const saving = s.data();

      if (
        saving.memberId
        === memberDoc.id
      ) {

        totalSavings += Number(
          saving.amount || 0
        );
      }
    });

    /* =========================
       CALCULATE LOANS
    ========================= */

    let totalLoans = 0;

    let remainingLoans = 0;

    loansSnap.forEach(l => {

      const loan = l.data();

      if (
        loan.memberId
        === memberDoc.id
      ) {

        totalLoans += Number(
          loan.totalAmount ||
          loan.total ||
          0
        );

        remainingLoans += Number(
          loan.remaining || 0
        );
      }
    });

    /* SAVE */
    allMembers.push({

      id: memberDoc.id,

      ...m,

      totalSavings,
      totalLoans,
      remainingLoans
    });
  });

  /* =========================
     UPDATE CARDS
  ========================= */

  document.getElementById("memberCount")
    .innerText = totalMembers;

  document.getElementById("activeCount")
    .innerText = activeMembers;

  document.getElementById("newCount")
    .innerText = newThisMonth;

  document.getElementById("verifiedCount")
    .innerText = verifiedMembers;

  /* =========================
     RENDER TABLE
  ========================= */

  renderTable(allMembers);
}

/* =========================
   RENDER TABLE
========================= */
function renderTable(data) {

  table.innerHTML = "";

  data.forEach(m => {

    table.innerHTML += `

      <tr>

        <!-- MEMBER -->
        <td>

          <div style="
            display:flex;
            align-items:center;
            gap:10px;
          ">

            <img
              src="${
                m.photoURL ||
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

              <b>${m.name}</b>

            </div>

          </div>

        </td>

        <!-- PHONE -->
        <td>

          ${m.phone}

        </td>

        <!-- NID -->
        <td>

          ${m.nid}

        </td>

        <!-- SAVINGS -->
        <td>

          ${Number(
            m.totalSavings || 0
          ).toLocaleString()} ETB

        </td>

        <!-- LOANS -->
        <td>

          ${Number(
            m.totalLoans || 0
          ).toLocaleString()} ETB

        </td>

        <!-- REMAINING -->
        <td>

          ${Number(
            m.remainingLoans || 0
          ).toLocaleString()} ETB

        </td>

        <!-- STATUS -->
        <td>

          <span class="status active">

            ${m.status || "Active"}

          </span>

        </td>

        <!-- ACTIONS -->
        <td>

          <button
            class="btn success"

            onclick="editMember(
              '${m.id}',
              '${m.name}',
              '${m.phone}',
              '${m.nid}'
            )">

            Edit

          </button>

          <button
            class="btn danger"

            onclick="deleteMember('${m.id}')">

            Delete

          </button>

        </td>

      </tr>
    `;
  });
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

  modal.style.display = "flex";

  document.getElementById("formTitle")
    .innerText = "Edit Member";

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
window.deleteMember =
async function (id) {

  const confirmDelete =
    confirm(
      "Delete this member?"
    );

  if (!confirmDelete) return;

  try {

    await deleteDoc(
      doc(db, "members", id)
    );

    alert("Member deleted");

    loadMembers();

  }

  catch (error) {

    console.error(error);

    alert("Delete failed");
  }
};

/* =========================
   SEARCH
========================= */
searchBox.addEventListener(
  "input",

  function () {

    const value =
      this.value.toLowerCase();

    const filtered =
      allMembers.filter(m =>

        m.name
          .toLowerCase()
          .includes(value)

        ||

        m.phone
          .includes(value)

        ||

        m.nid
          .includes(value)
      );

    renderTable(filtered);
  }
);

/* =========================
   INIT
========================= */
loadMembers();
