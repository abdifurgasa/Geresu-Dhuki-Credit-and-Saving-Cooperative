import { db } from "./firebase.js";

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

const storage = getStorage();

/* =========================
   STATE
========================= */
const table = document.getElementById("memberTable");
const searchBox = document.getElementById("searchBox");
const modal = document.getElementById("modal");

let editId = null;
let cache = [];

/* =========================
   MODAL
========================= */
window.openModal = () => {
  modal.style.display = "flex";
  editId = null;
};

window.closeModal = () => {
  modal.style.display = "none";
};

/* =========================
   PHOTO UPLOAD
========================= */
async function uploadPhoto(file, id) {
  const storageRef = ref(storage, `members/${id}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

/* =========================
   CALCULATE FINANCE (REAL BANKING LOGIC)
========================= */
async function getFinance(memberId) {

  let savings = 0;
  let loans = 0;
  let remaining = 0;

  const sSnap = await getDocs(collection(db, "savings"));
  sSnap.forEach(d => {
    if (d.data().memberId === memberId) {
      savings += Number(d.data().amount || 0);
    }
  });

  const lSnap = await getDocs(collection(db, "loans"));
  lSnap.forEach(d => {
    const data = d.data();
    if (data.memberId === memberId) {
      loans += Number(data.totalAmount || 0);
      remaining += Number(data.remaining || 0);
    }
  });

  return { savings, loans, remaining };
}

/* =========================
   SAVE MEMBER
========================= */
window.saveMember = async () => {

  const name = nameInput();
  const phone = phoneInput();
  const nid = nidInput();
  const file = document.getElementById("photo").files[0];

  if (!name || !phone || !nid) {
    alert("Fill all fields");
    return;
  }

  let photoURL = "";

  if (file) {
    photoURL = await uploadPhoto(file, editId || Date.now());
  }

  if (editId) {

    await updateDoc(doc(db, "members", editId), {
      name,
      phone,
      nid,
      ...(photoURL && { photoURL })
    });

    alert("Updated successfully");

  } else {

    await addDoc(collection(db, "members"), {
      name,
      phone,
      nid,
      photoURL,
      status: "Active",
      createdAt: serverTimestamp()
    });

    alert("Saved successfully");
  }

  closeModal();
};

/* =========================
   LOAD MEMBERS (REALTIME)
========================= */
function loadMembers() {

  onSnapshot(collection(db, "members"), async snap => {

    cache = [];
    table.innerHTML = "";

    for (const d of snap.docs) {

      const m = d.data();
      const finance = await getFinance(d.id);

      cache.push({ id: d.id, ...m });

      table.innerHTML += `
        <tr>

          <td>
            <img src="${m.photoURL || 'https://via.placeholder.com/40'}"
                 width="40" height="40"
                 style="border-radius:50%">
          </td>

          <td>${m.name}</td>
          <td>${m.phone}</td>
          <td>${m.nid}</td>

          <td>${finance.savings}</td>
          <td>${finance.loans}</td>
          <td>${finance.remaining}</td>

          <td>${m.status || "Active"}</td>

          <td>
            <button onclick="editMember('${d.id}')">Edit</button>
            <button onclick="deleteMember('${d.id}')">Delete</button>
          </td>

        </tr>
      `;
    }
  });
}

/* =========================
   EDIT
========================= */
window.editMember = (id) => {
  const m = cache.find(x => x.id === id);
  if (!m) return;

  editId = id;
  modal.style.display = "flex";

  document.getElementById("name").value = m.name;
  document.getElementById("phone").value = m.phone;
  document.getElementById("nid").value = m.nid;
};

/* =========================
   DELETE
========================= */
window.deleteMember = async (id) => {
  if (!confirm("Delete member?")) return;
  await deleteDoc(doc(db, "members", id));
};

/* =========================
   SEARCH
========================= */
searchBox.addEventListener("input", () => {

  const val = searchBox.value.toLowerCase();

  table.innerHTML = "";

  cache.filter(m =>
    m.name.toLowerCase().includes(val) ||
    m.phone.includes(val) ||
    m.nid.includes(val)
  ).forEach(async m => {

    const finance = await getFinance(m.id);

    table.innerHTML += `
      <tr>

        <td>
          <img src="${m.photoURL || 'https://via.placeholder.com/40'}"
               width="40" height="40"
               style="border-radius:50%">
        </td>

        <td>${m.name}</td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>

        <td>${finance.savings}</td>
        <td>${finance.loans}</td>
        <td>${finance.remaining}</td>

        <td>${m.status || "Active"}</td>

        <td>
          <button onclick="editMember('${m.id}')">Edit</button>
          <button onclick="deleteMember('${m.id}')">Delete</button>
        </td>

      </tr>
    `;
  });
});

/* =========================
   HELPERS
========================= */
function nameInput() {
  return document.getElementById("name").value.trim();
}

function phoneInput() {
  return document.getElementById("phone").value.trim();
}

function nidInput() {
  return document.getElementById("nid").value.trim();
}

/* =========================
   INIT
========================= */
loadMembers();
