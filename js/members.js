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
   ELEMENTS
========================= */
const table = document.getElementById("memberTable");
const searchBox = document.getElementById("searchBox");
const modal = document.getElementById("modal");

/* =========================
   STATE
========================= */
let editId = null;
let cache = [];

/* =========================
   MODAL
========================= */
window.openModal = () => {
  modal.style.display = "flex";
  editId = null;
  clearForm();
};

window.closeModal = () => {
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
   PHOTO UPLOAD
========================= */
async function uploadPhoto(file, id) {
  const storageRef = ref(storage, `members/${id}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

/* =========================
   SAVE MEMBER
========================= */
window.saveMember = async () => {

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const nid = document.getElementById("nid").value;
  const file = document.getElementById("photo").files[0];

  if (!name || !phone || !nid) {
    alert("Fill all fields");
    return;
  }

  let photoURL = "";

  try {

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
        savings: 0,
        loans: 0,
        remaining: 0,
        status: "Active",
        createdAt: serverTimestamp()
      });

      alert("Saved successfully");
    }

    closeModal();

  } catch (e) {
    alert("Error saving member");
  }
};

/* =========================
   LOAD MEMBERS
========================= */
function loadMembers() {

  onSnapshot(collection(db, "members"), snap => {

    cache = [];
    table.innerHTML = "";

    snap.forEach(d => {

      const m = d.data();
      cache.push({ id: d.id, ...m });

      table.innerHTML += `
        <tr>

          <td>
            <img src="${m.photoURL || 'https://via.placeholder.com/40'}"
                 width="40"
                 height="40"
                 style="border-radius:50%">
          </td>

          <td>${m.name}</td>
          <td>${m.phone}</td>
          <td>${m.nid}</td>

          <td>${m.savings || 0}</td>
          <td>${m.loans || 0}</td>
          <td>${m.remaining || 0}</td>

          <td>${m.status || "Active"}</td>

          <td>

            <button onclick="editMember('${d.id}')">Edit</button>
            <button onclick="deleteMember('${d.id}')">Delete</button>

          </td>

        </tr>
      `;
    });
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
  alert("Deleted");
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
  ).forEach(m => {

    table.innerHTML += `
      <tr>

        <td>
          <img src="${m.photoURL || 'https://via.placeholder.com/40'}"
               width="40"
               height="40"
               style="border-radius:50%">
        </td>

        <td>${m.name}</td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>

        <td>${m.savings || 0}</td>
        <td>${m.loans || 0}</td>
        <td>${m.remaining || 0}</td>

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
   INIT
========================= */
loadMembers();
