import { db, app } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp
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
   STATE
========================= */
let editId = null;

let membersCache = [];
let savingsCache = [];

/* =========================
   DOM SAFE INIT
========================= */
let table, modal;

window.addEventListener("DOMContentLoaded", () => {

  table = document.getElementById("memberTable");
  modal = document.getElementById("modal");

  initRealtime();
});

/* =========================
   OPEN MODAL
========================= */
window.openModal = function () {

  modal.style.display = "flex";

  document.getElementById("formTitle").innerText = "Add Member";

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
function isDuplicate(phone, nid) {

  return membersCache.some(m =>
    m.phone === phone || m.nid === nid
  );
}

/* =========================
   SAVE MEMBER
========================= */
window.saveMember = async function () {

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const nid = document.getElementById("nid").value.trim();
  const file = document.getElementById("photo").files[0];

  if (!validate(name, phone, nid)) return;

  if (!editId && isDuplicate(phone, nid)) {
    alert("Duplicate Phone or NID");
    return;
  }

  try {

    let photoURL = "";

    if (file) {

      const storageRef = ref(storage, "members/" + Date.now() + "_" + file.name);

      await uploadBytes(storageRef, file);

      photoURL = await getDownloadURL(storageRef);
    }

    if (editId) {

      await updateDoc(doc(db, "members", editId), {
        name,
        phone,
        nid,
        ...(photoURL && { photo: photoURL })
      });

      alert("Member Updated Successfully");
    }

    else {

      await addDoc(collection(db, "members"), {
        name,
        phone,
        nid,
        photo: photoURL,
        status: "Active",
        createdAt: serverTimestamp()
      });

      alert("Member Saved Successfully");
    }

    closeModal();

  } catch (err) {

    console.error(err);

    alert("Error saving member");
  }
};

/* =========================
   REAL-TIME SYSTEM (CORE FIX)
========================= */
function initRealtime() {

  /* MEMBERS LIVE */
  onSnapshot(collection(db, "members"), snap => {

    membersCache = [];

    snap.forEach(d => {
      membersCache.push({ id: d.id, ...d.data() });
    });

    renderMembers();
    updateCards();
  });

  /* SAVINGS LIVE */
  onSnapshot(collection(db, "savings"), snap => {

    savingsCache = [];

    snap.forEach(d => {
      savingsCache.push({ id: d.id, ...d.data() });
    });

    renderMembers();
    updateCards();
  });
}

/* =========================
   CALCULATE SAVINGS
========================= */
function getSavings(memberId) {

  return savingsCache
    .filter(s => s.memberId === memberId)
    .reduce((sum, s) => sum + Number(s.amount || 0), 0);
}

/* =========================
   RENDER TABLE
========================= */
function renderMembers() {

  if (!table) return;

  table.innerHTML = "";

  membersCache.forEach(m => {

    const savings = getSavings(m.id);

    table.innerHTML += `
      <tr>
        <td>
          <img src="${m.photo || 'https://via.placeholder.com/40'}"
               style="width:40px;height:40px;border-radius:50%;">
          ${m.name}
        </td>

        <td>${m.phone}</td>
        <td>${m.nid}</td>

        <td>${savings.toLocaleString()} ETB</td>

        <td>${m.status || "Active"}</td>

        <td>
          <button onclick="editMember('${m.id}')">Edit</button>
          <button onclick="deleteMember('${m.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* =========================
   DASHBOARD CARDS
========================= */
function updateCards() {

  let totalSavings = savingsCache.reduce(
    (sum, s) => sum + Number(s.amount || 0),
    0
  );

  const el = document.getElementById("savings");

  if (el) {
    el.innerText = totalSavings.toLocaleString() + " ETB";
  }
}

/* =========================
   EDIT MEMBER
========================= */
window.editMember = function (id) {

  const m = membersCache.find(x => x.id === id);

  if (!m) return;

  editId = id;

  modal.style.display = "flex";

  document.getElementById("formTitle").innerText = "Edit Member";

  document.getElementById("name").value = m.name;
  document.getElementById("phone").value = m.phone;
  document.getElementById("nid").value = m.nid;
};

/* =========================
   DELETE MEMBER
========================= */
window.deleteMember = async function (id) {

  if (!confirm("Delete this member?")) return;

  await deleteDoc(doc(db, "members", id));

  alert("Deleted Successfully");
};
