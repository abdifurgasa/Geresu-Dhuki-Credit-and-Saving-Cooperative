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
   OPEN / CLOSE MODAL
========================= */
window.openModal = () => modal.style.display = "flex";
window.closeModal = () => modal.style.display = "none";

/* =========================
   UPLOAD PHOTO
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

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const nid = document.getElementById("nid").value.trim();
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

    alert("Member updated");

  } else {

    await addDoc(collection(db, "members"), {

      name,
      phone,
      nid,
      photoURL,

      // ✅ IMPORTANT: finance fields stored here
      savingsTotal: 0,
      loansTotal: 0,
      remainingLoan: 0,

      status: "Active",
      createdAt: serverTimestamp()
    });

    alert("Member saved");
  }

  closeModal();
};

/* =========================
   LOAD MEMBERS (FAST + STABLE)
========================= */
function loadMembers() {

  onSnapshot(collection(db, "members"), snap => {

    table.innerHTML = "";
    cache = [];

    document.getElementById("memberCount").innerText = snap.size;

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

          <!-- ✅ DIRECT FROM DATABASE -->
          <td>${m.savingsTotal || 0} ETB</td>
          <td>${m.loansTotal || 0} ETB</td>
          <td>${m.remainingLoan || 0} ETB</td>

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
};

/* =========================
   SEARCH
========================= */
searchBox.addEventListener("input", () => {

  const val = searchBox.value.toLowerCase();

  table.innerHTML = "";

  cache
    .filter(m =>
      m.name.toLowerCase().includes(val) ||
      m.phone.includes(val) ||
      m.nid.includes(val)
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

          <td>${m.savingsTotal || 0}</td>
          <td>${m.loansTotal || 0}</td>
          <td>${m.remainingLoan || 0}</td>

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
