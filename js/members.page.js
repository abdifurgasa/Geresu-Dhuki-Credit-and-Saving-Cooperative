import { db, storage } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

/* =========================
   ELEMENTS
========================= */
const table = document.getElementById("memberTable");
const modal = document.getElementById("modal");
const searchBox = document.getElementById("searchBox");

/* =========================
   STATE
========================= */
let editId = null;

/* =========================
   INIT AFTER DOM LOAD
========================= */
document.addEventListener("DOMContentLoaded", () => {

  // OPEN MODAL
  document.getElementById("btnOpenModal")
    .addEventListener("click", () => {
      modal.classList.remove("hidden");
      clearForm();
      editId = null;
    });

  // CLOSE MODAL
  document.getElementById("btnClose")
    .addEventListener("click", () => {
      modal.classList.add("hidden");
    });

  // SAVE MEMBER
  document.getElementById("btnSave")
    .addEventListener("click", saveMember);

  loadMembers();
});

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
async function checkDuplicate(phone, nid, ignoreId = null) {

  const snap = await getDocs(collection(db, "members"));

  let exists = false;

  snap.forEach(d => {

    if (ignoreId && d.id === ignoreId) return;

    const m = d.data();

    if (m.phone === phone || m.nid === nid) {
      exists = true;
    }
  });

  return exists;
}

/* =========================
   SAVE MEMBER
========================= */
async function saveMember() {

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const nid = document.getElementById("nid").value.trim();
  const photo = document.getElementById("photo").files[0];

  if (!validate(name, phone, nid)) return;

  const duplicate = await checkDuplicate(phone, nid, editId);

  if (duplicate) {
    alert("Phone or NID already exists");
    return;
  }

  let photoURL = "";

  try {

    // ================= PHOTO UPLOAD =================
    if (photo) {

      const imgRef = ref(storage, "members/" + Date.now() + "_" + photo.name);

      await uploadBytes(imgRef, photo);

      photoURL = await getDownloadURL(imgRef);
    }

    // ================= CREATE =================
    if (!editId) {

      await addDoc(collection(db, "members"), {
        name,
        phone,
        nid,
        photo: photoURL,
        status: "Active",
        createdAt: new Date()
      });

      alert("Member Saved Successfully"); // ✅ FIXED
    }

    // ================= UPDATE =================
    else {

      await updateDoc(doc(db, "members", editId), {
        name,
        phone,
        nid,
        photo: photoURL || null
      });

      alert("Member Updated Successfully");
    }

    modal.classList.add("hidden");

    loadMembers();

  } catch (err) {

    console.error(err);
    alert("Error saving member");
  }
}

/* =========================
   LOAD MEMBERS
========================= */
async function loadMembers() {

  table.innerHTML = "";

  const snap = await getDocs(collection(db, "members"));

  snap.forEach(docSnap => {

    const m = docSnap.data();

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <img src="${m.photo || 'https://via.placeholder.com/40'}"
             style="width:40px;height:40px;border-radius:50%;">
        ${m.name}
      </td>

      <td>${m.phone}</td>
      <td>${m.nid}</td>

      <td>0</td>
      <td>0</td>
      <td>0</td>

      <td>${m.status || "Active"}</td>

      <td>
        <button class="btn danger" data-id="${docSnap.id}">
          Delete
        </button>
      </td>
    `;

    table.appendChild(row);
  });
}

/* =========================
   DELETE MEMBER
========================= */
table.addEventListener("click", async (e) => {

  if (e.target.dataset.id) {

    const id = e.target.dataset.id;

    await deleteDoc(doc(db, "members", id));

    alert("Member Deleted");

    loadMembers();
  }
});
