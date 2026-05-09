import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   ELEMENTS
========================= */
const table = document.getElementById("memberTable");
const searchBox = document.getElementById("searchBox");
const modal = document.getElementById("modal");

/* =========================
   STATE
========================= */
let editId = null;

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
}

/* =========================
   VALIDATION
========================= */
function validate(name, phone, nid) {

  if (!name || !phone || !nid) {
    alert("All fields are required");
    return false;
  }

  if (!/^[0-9]{9}$/.test(phone)) {
    alert("Phone must be 9 digits");
    return false;
  }

  if (!/^[0-9]{16}$/.test(nid)) {
    alert("NID must be 16 digits");
    return false;
  }

  return true;
}

/* =========================
   DUPLICATE CHECK
========================= */
async function isDuplicate(phone, nid, ignoreId = null) {

  const snap = await getDocs(collection(db, "members"));

  let found = false;

  snap.forEach(d => {

    const m = d.data();

    if (ignoreId && d.id === ignoreId) return;

    if (m.phone === phone || m.nid === nid) {
      found = true;
    }
  });

  return found;
}

/* =========================
   SAVE (ADD / EDIT)
========================= */
window.saveMember = async function () {

  const name =
    document.getElementById("name").value.trim();

  const phone =
    document.getElementById("phone").value.trim();

  const nid =
    document.getElementById("nid").value.trim();

  if (!validate(name, phone, nid)) return;

  const duplicate =
    await isDuplicate(phone, nid, editId);

  if (duplicate) {
    alert("Member already exists (Phone or NID duplicate)");
    return;
  }

  try {

    if (editId) {

      await updateDoc(doc(db, "members", editId), {
        name,
        phone,
        nid
      });

      alert("Member updated successfully");

    } else {

      await addDoc(collection(db, "members"), {
        name,
        phone,
        nid,
        status: "Active",
        createdAt: new Date()
      });

      alert("Member added successfully");
    }

    closeModal();

    loadMembers();

  } catch (error) {

    console.error(error);

    alert("Error saving member");
  }
};

/* =========================
   LOAD MEMBERS
========================= */
async function loadMembers() {

  table.innerHTML = "";

  const snap =
    await getDocs(collection(db, "members"));

  snap.forEach(d => {

    const m = d.data();

    table.innerHTML += `
      <tr>
        <td>${m.name}</td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>

        <td>
          <span class="status active">
            ${m.status || "Active"}
          </span>
        </td>

        <td>

          <button class="btn success"
            onclick="editMember('${d.id}',
            '${m.name}',
            '${m.phone}',
            '${m.nid}')">

            Edit

          </button>

          <button class="btn danger"
            onclick="deleteMember('${d.id}')">

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
window.editMember = function (id, name, phone, nid) {

  editId = id;

  modal.style.display = "flex";

  document.getElementById("formTitle").innerText =
    "Edit Member";

  document.getElementById("name").value = name;
  document.getElementById("phone").value = phone;
  document.getElementById("nid").value = nid;
};

/* =========================
   DELETE MEMBER
========================= */
window.deleteMember = async function (id) {

  if (!confirm("Are you sure to delete this member?")) return;

  await deleteDoc(doc(db, "members", id));

  loadMembers();
};

/* =========================
   SEARCH (REAL TIME)
========================= */
searchBox.addEventListener("input", async function () {

  const value = this.value.toLowerCase();

  table.innerHTML = "";

  const snap =
    await getDocs(collection(db, "members"));

  snap.forEach(d => {

    const m = d.data();

    if (
      m.name.toLowerCase().includes(value) ||
      m.phone.includes(value) ||
      m.nid.includes(value)
    ) {

      table.innerHTML += `
        <tr>
          <td>${m.name}</td>
          <td>${m.phone}</td>
          <td>${m.nid}</td>

          <td>
            <span class="status active">
              ${m.status || "Active"}
            </span>
          </td>

          <td>

            <button class="btn success"
              onclick="editMember('${d.id}',
              '${m.name}',
              '${m.phone}',
              '${m.nid}')">

              Edit

            </button>

            <button class="btn danger"
              onclick="deleteMember('${d.id}')">

              Delete

            </button>

          </td>
        </tr>
      `;
    }
  });
});

/* =========================
   INIT
========================= */
loadMembers();
