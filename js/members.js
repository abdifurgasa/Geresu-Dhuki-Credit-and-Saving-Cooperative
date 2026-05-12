import { db, app } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const storage = getStorage(app);

/* =========================
   ELEMENTS
========================= */
let table, searchBox, modal;

/* =========================
   STATE
========================= */
let editId = null;

/* =========================
   INIT SAFE LOAD
========================= */
window.addEventListener("DOMContentLoaded", () => {

  table = document.getElementById("memberTable");
  searchBox = document.getElementById("searchBox");
  modal = document.getElementById("modal");

  loadMembers();
  loadCards();
});

/* =========================
   OPEN MODAL
========================= */
window.openModal = function () {

  if (!modal) return;

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
    alert("National ID must be 16 digits");
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
   SAVE MEMBER
========================= */
window.saveMember = async function () {

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const nid = document.getElementById("nid").value.trim();
  const photoFile = document.getElementById("photo").files[0];

  if (!validate(name, phone, nid)) return;

  if (await isDuplicate(phone, nid, editId)) {
    alert("Phone or National ID already exists");
    return;
  }

  try {

    let photoURL = "";

    if (photoFile) {

      const storageRef = ref(storage, `members/${Date.now()}_${photoFile.name}`);

      await uploadBytes(storageRef, photoFile);

      photoURL = await getDownloadURL(storageRef);
    }

    if (editId) {

      await updateDoc(doc(db, "members", editId), {
        name,
        phone,
        nid,
        ...(photoURL && { photo: photoURL })
      });

      alert("Member updated successfully");

    } else {

      await addDoc(collection(db, "members"), {
        name,
        phone,
        nid,
        photo: photoURL,
        status: "Active",
        verified: true,
        createdAt: Date.now()
      });

      alert("Member saved successfully");
    }

    closeModal();

    loadMembers();
    loadCards();

  } catch (err) {
    console.error(err);
    alert("Error saving member");
  }
};

/* =========================
   LOAD MEMBERS (WITH FINANCE)
========================= */
async function loadMembers() {

  if (!table) return;

  table.innerHTML = "";

  const members = await getDocs(collection(db, "members"));
  const savings = await getDocs(collection(db, "savings"));
  const loans = await getDocs(collection(db, "loans"));

  members.forEach(mDoc => {

    const m = mDoc.data();

    let totalSavings = 0;
    let totalLoans = 0;
    let remainingLoans = 0;

    savings.forEach(s => {
      const data = s.data();
      if (data.memberId === mDoc.id) {
        totalSavings += Number(data.amount || 0);
      }
    });

    loans.forEach(l => {
      const data = l.data();
      if (data.memberId === mDoc.id) {
        totalLoans += Number(data.totalAmount || 0);
        remainingLoans += Number(data.remaining || 0);
      }
    });

    table.innerHTML += `
      <tr>

        <td>
          <div style="display:flex;gap:10px;align-items:center;">
            <img src="${m.photo || 'https://via.placeholder.com/50'}"
              style="width:45px;height:45px;border-radius:50%;object-fit:cover;">
            <b>${m.name}</b>
          </div>
        </td>

        <td>${m.phone}</td>
        <td>${m.nid}</td>

        <td>${totalSavings.toLocaleString()}</td>
        <td>${totalLoans.toLocaleString()}</td>
        <td>${remainingLoans.toLocaleString()}</td>

        <td>${m.status || "Active"}</td>

        <td>
          <button class="btn success"
            onclick="editMember('${mDoc.id}','${m.name}','${m.phone}','${m.nid}')">
            Edit
          </button>

          <button class="btn danger"
            onclick="deleteMember('${mDoc.id}')">
            Delete
          </button>
        </td>

      </tr>
    `;
  });
}

/* =========================
   LOAD CARDS
========================= */
async function loadCards() {

  const snap = await getDocs(collection(db, "members"));

  let total = snap.size;
  let active = 0;
  let verified = 0;
  let newThisMonth = 0;

  const now = new Date();

  snap.forEach(d => {

    const m = d.data();

    if ((m.status || "").toLowerCase() === "active") active++;

    if (m.verified) verified++;

    if (m.createdAt) {

      const date = new Date(m.createdAt);

      if (date.getMonth() === now.getMonth()) {
        newThisMonth++;
      }
    }
  });

  document.getElementById("memberCount").innerText = total;
  document.getElementById("activeCount").innerText = active;
  document.getElementById("verifiedCount").innerText = verified;
  document.getElementById("newCount").innerText = newThisMonth;
}

/* =========================
   EDIT
========================= */
window.editMember = function (id, name, phone, nid) {

  editId = id;

  modal.style.display = "flex";

  document.getElementById("formTitle").innerText = "Edit Member";

  document.getElementById("name").value = name;
  document.getElementById("phone").value = phone;
  document.getElementById("nid").value = nid;
};

/* =========================
   DELETE
========================= */
window.deleteMember = async function (id) {

  if (!confirm("Delete this member?")) return;

  await deleteDoc(doc(db, "members", id));

  alert("Member deleted");

  loadMembers();
  loadCards();
};
