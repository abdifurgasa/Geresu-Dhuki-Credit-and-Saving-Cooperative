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

/* =========================
   FIREBASE STORAGE
========================= */
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
let membersCache = [];

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
   UPLOAD PHOTO
========================= */
async function uploadPhoto(file, memberId) {
  const storageRef = ref(storage, `members/${memberId}_${file.name}`);

  await uploadBytes(storageRef, file);

  return await getDownloadURL(storageRef);
}

/* =========================
   SAVE MEMBER (ADD / EDIT)
========================= */
window.saveMember = async function () {

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const nid = document.getElementById("nid").value.trim();
  const photoFile = document.getElementById("photo").files[0];

  if (!validate(name, phone, nid)) return;

  try {

    let photoURL = "";

    /* =========================
       UPLOAD PHOTO (IF NEW)
    ========================= */
    if (photoFile) {
      photoURL = await uploadPhoto(photoFile, editId || Date.now());
    }

    if (editId) {

      await updateDoc(doc(db, "members", editId), {
        name,
        phone,
        nid,
        ...(photoURL && { photoURL })
      });

      alert("Member updated successfully");

    } else {

      await addDoc(collection(db, "members"), {
        name,
        phone,
        nid,
        photoURL: photoURL || "",
        status: "Active",
        savings: 0,
        loans: 0,
        remaining: 0,
        createdAt: serverTimestamp()
      });

      alert("Member added successfully");
    }

    closeModal();
    loadMembers();

  } catch (err) {
    console.error(err);
    alert("Error saving member");
  }
};

/* =========================
   LOAD MEMBERS (REALTIME)
========================= */
function loadMembers() {

  onSnapshot(collection(db, "members"), (snap) => {

    membersCache = [];

    table.innerHTML = "";

    snap.forEach(docSnap => {

      const m = docSnap.data();
      membersCache.push({ id: docSnap.id, ...m });

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

          <td>${m.savings || 0} ETB</td>
          <td>${m.loans || 0} ETB</td>
          <td>${m.remaining || 0} ETB</td>

          <td>
            <span class="status active">
              ${m.status || "Active"}
            </span>
          </td>

          <td>

            <button class="btn success"
              onclick="editMember('${docSnap.id}')">

              Edit

            </button>

            <button class="btn danger"
              onclick="deleteMember('${docSnap.id}')">

              Delete

            </button>

          </td>

        </tr>
      `;
    });
  });
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

  alert("Member deleted successfully");
};

/* =========================
   SEARCH
========================= */
searchBox.addEventListener("input", function () {

  const value = this.value.toLowerCase();

  table.innerHTML = "";

  membersCache
    .filter(m =>
      m.name.toLowerCase().includes(value) ||
      m.phone.includes(value) ||
      m.nid.includes(value)
    )
    .forEach(m => {

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

          <td>${m.savings || 0} ETB</td>
          <td>${m.loans || 0} ETB</td>
          <td>${m.remaining || 0} ETB</td>

          <td>
            <span class="status active">
              ${m.status || "Active"}
            </span>
          </td>

          <td>

            <button class="btn success"
              onclick="editMember('${m.id}')">

              Edit

            </button>

            <button class="btn danger"
              onclick="deleteMember('${m.id}')">

              Delete

            </button>

          </td>

        </tr>
      `;
    });
});

/* =========================
   INIT
========================= */
loadMembers();
