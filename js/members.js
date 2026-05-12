import { db, app } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
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

const table = document.getElementById("memberTable");
const modal = document.getElementById("modal");

let editId = null;

/* =========================
   OPEN / CLOSE MODAL (FIXED)
========================= */
window.openModal = function () {
  modal.style.display = "flex";
  clearForm();
  editId = null;
};

window.closeModal = function () {
  modal.style.display = "none";
  clearForm();
};

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
   SAVE MEMBER (FIXED)
========================= */
window.saveMember = async function () {

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const nid = document.getElementById("nid").value.trim();
  const file = document.getElementById("photo").files[0];

  if (!validate(name, phone, nid)) return;

  if (await isDuplicate(phone, nid, editId)) {
    alert("Duplicate Phone or NID");
    return;
  }

  try {
    let photoURL = "";

    if (file) {
      const storageRef = ref(storage, "members/" + Date.now() + file.name);
      await uploadBytes(storageRef, file);
      photoURL = await getDownloadURL(storageRef);
    }

    if (editId) {
      await updateDoc(doc(db, "members", editId), {
        name, phone, nid, photo: photoURL
      });

      alert("Updated Successfully");
    } else {
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
    loadMembers();

  } catch (e) {
    console.error(e);
    alert("Error saving member");
  }
};

/* =========================
   LOAD MEMBERS + FINANCIAL DATA
========================= */
async function loadMembers() {

  table.innerHTML = "";

  const members = await getDocs(collection(db, "members"));
  const savings = await getDocs(collection(db, "savings"));
  const loans = await getDocs(collection(db, "loans"));

  members.forEach(mdoc => {

    const m = mdoc.data();

    let totalSavings = 0;
    let totalLoans = 0;
    let remaining = 0;

    savings.forEach(s => {
      if (s.data().memberId === mdoc.id) {
        totalSavings += Number(s.data().amount || 0);
      }
    });

    loans.forEach(l => {
      if (l.data().memberId === mdoc.id) {
        totalLoans += Number(l.data().amount || 0);
        remaining += Number(l.data().remaining || 0);
      }
    });

    table.innerHTML += `
      <tr>
        <td>
          <img src="${m.photo || 'https://via.placeholder.com/40'}"
               style="width:40px;height:40px;border-radius:50%;">
          ${m.name}
        </td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>
        <td>${totalSavings}</td>
        <td>${totalLoans}</td>
        <td>${remaining}</td>
        <td>${m.status}</td>
        <td>
          <button onclick="deleteMember('${mdoc.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* =========================
   DELETE
========================= */
window.deleteMember = async function (id) {
  await deleteDoc(doc(db, "members", id));
  alert("Deleted");
  loadMembers();
};

/* =========================
   INIT
========================= */
loadMembers();
