import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =====================
   STATE
===================== */
let editId = null;
let cache = [];

/* =====================
   INIT
===================== */
document.addEventListener("DOMContentLoaded", () => {
  loadMembers();
  searchBox.addEventListener("input", searchMembers);
});

/* =====================
   MODAL
===================== */
window.openModal = () => {
  editId = null;
  clearForm();
  modal.style.display = "flex";
};

window.closeModal = () => {
  modal.style.display = "none";
};

/* =====================
   VALIDATION
===================== */
function validate(name, phone, nid) {

  if (!name) return "Name is required";

  if (!/^[0-9]{9}$/.test(phone)) {
    return "Phone must be 9 digits";
  }

  if (!/^[0-9]{16}$/.test(nid)) {
    return "National ID must be 16 digits";
  }

  return null;
}

/* =====================
   SAVE MEMBER (ADD / EDIT)
===================== */
window.saveMember = async () => {

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const nid = document.getElementById("nid").value.trim();

  const error = validate(name, phone, nid);
  if (error) return alert(error);

  const snap = await getDocs(collection(db, "members"));

  let duplicate = false;

  snap.forEach(d => {
    const m = d.data();

    if (!editId) {
      if (m.phone === phone || m.nid === nid) {
        duplicate = true;
      }
    }
  });

  if (duplicate) {
    return alert("Member already exists");
  }

  if (editId) {

    await updateDoc(doc(db, "members", editId), {
      name, phone, nid
    });

    alert("Updated");

  } else {

    await addDoc(collection(db, "members"), {
      name,
      phone,
      nid,
      createdAt: new Date()
    });

    alert("Added");
  }

  closeModal();
  loadMembers();
};

/* =====================
   LOAD MEMBERS
===================== */
async function loadMembers() {

  const snap = await getDocs(collection(db, "members"));

  cache = [];
  memberTable.innerHTML = "";

  snap.forEach(d => {

    const m = d.data();

    cache.push({
      id: d.id,
      name: m.name,
      phone: m.phone,
      nid: m.nid
    });

    memberTable.innerHTML += `
      <tr>
        <td>${m.name}</td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>
        <td>
          <button onclick="editMember('${d.id}')">Edit</button>
          <button onclick="deleteMember('${d.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* =====================
   EDIT MEMBER
===================== */
window.editMember = (id) => {

  const m = cache.find(x => x.id === id);

  editId = id;

  name.value = m.name;
  phone.value = m.phone;
  nid.value = m.nid;

  modal.style.display = "flex";
};

/* =====================
   DELETE MEMBER
===================== */
window.deleteMember = async (id) => {

  if (!confirm("Delete member?")) return;

  await deleteDoc(doc(db, "members", id));

  loadMembers();
};

/* =====================
   SEARCH
===================== */
function searchMembers(e) {

  const value = e.target.value.toLowerCase();

  memberTable.innerHTML = "";

  cache
    .filter(m =>
      m.name.toLowerCase().includes(value) ||
      m.phone.includes(value) ||
      m.nid.includes(value)
    )
    .forEach(m => {

      memberTable.innerHTML += `
        <tr>
          <td>${m.name}</td>
          <td>${m.phone}</td>
          <td>${m.nid}</td>
          <td>
            <button onclick="editMember('${m.id}')">Edit</button>
            <button onclick="deleteMember('${m.id}')">Delete</button>
          </td>
        </tr>
      `;
    });
}

/* =====================
   CLEAR FORM
===================== */
function clearForm() {
  name.value = "";
  phone.value = "";
  nid.value = "";
}
