import { db, app } from "./firebase.js";

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

const storage = getStorage(app);

/* =========================
   SAFE DOM CHECK (IMPORTANT FIX)
========================= */
let table, modal;

window.addEventListener("DOMContentLoaded", () => {

  table = document.getElementById("memberTable");
  modal = document.getElementById("modal");

  if (!modal) {
    console.error("❌ Modal not found in HTML!");
  }

  if (!table) {
    console.error("❌ Table not found in HTML!");
  }

  loadMembers();
});

/* =========================
   OPEN MODAL (FIXED 100%)
========================= */
window.openModal = function () {

  if (!modal) {
    modal = document.getElementById("modal");
  }

  if (!modal) {
    alert("Modal missing in HTML!");
    return;
  }

  modal.style.display = "flex";

  clearForm();
};

/* =========================
   CLOSE MODAL
========================= */
window.closeModal = function () {

  if (!modal) return;

  modal.style.display = "none";

  clearForm();
};

/* =========================
   FORM CLEAR
========================= */
function clearForm() {

  const el = (id) => document.getElementById(id);

  el("name").value = "";
  el("phone").value = "";
  el("nid").value = "";
  el("photo").value = "";
}

/* =========================
   VALIDATION (SAFE)
========================= */
function validate(name, phone, nid) {

  if (!name || !phone || !nid) {
    alert("All fields required");
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

    if (ignoreId && d.id === ignoreId) return;

    const m = d.data();

    if (m.phone === phone || m.nid === nid) {
      found = true;
    }
  });

  return found;
}

/* =========================
   SAVE MEMBER (SAFE)
========================= */
window.saveMember = async function () {

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const nid = document.getElementById("nid").value.trim();
  const file = document.getElementById("photo").files[0];

  if (!validate(name, phone, nid)) return;

  if (await isDuplicate(phone, nid)) {
    alert("Duplicate phone or NID");
    return;
  }

  try {

    let photoURL = "";

    if (file) {
      const storageRef = ref(storage, "members/" + Date.now() + file.name);
      await uploadBytes(storageRef, file);
      photoURL = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "members"), {
      name,
      phone,
      nid,
      photo: photoURL,
      status: "Active",
      createdAt: serverTimestamp()
    });

    alert("Member Saved Successfully");

    closeModal();
    loadMembers();

  } catch (err) {
    console.error(err);
    alert("Error saving member");
  }
};

/* =========================
   LOAD MEMBERS (SAFE)
========================= */
async function loadMembers() {

  if (!table) table = document.getElementById("memberTable");

  table.innerHTML = "";

  const snap = await getDocs(collection(db, "members"));

  snap.forEach(docSnap => {

    const m = docSnap.data();

    table.innerHTML += `
      <tr>
        <td>
          <img src="${m.photo || 'https://via.placeholder.com/40'}"
               style="width:40px;height:40px;border-radius:50%;">
          ${m.name}
        </td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>
        <td>${m.status || "Active"}</td>
        <td>
          <button onclick="deleteMember('${docSnap.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* =========================
   DELETE MEMBER
========================= */
window.deleteMember = async function (id) {

  await deleteDoc(doc(db, "members", id));

  alert("Deleted Successfully");

  loadMembers();
};
