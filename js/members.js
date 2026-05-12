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

let editId = null;

const table = document.getElementById("memberTable");
const modal = document.getElementById("modal");

/* ================= MODAL ================= */

window.openModal = function () {
  modal.style.display = "flex";
  document.getElementById("formTitle").innerText = "Add Member";
  clearForm();
  editId = null;
};

window.closeModal = function () {
  modal.style.display = "none";
  clearForm();
};

function clearForm() {
  name.value = "";
  phone.value = "";
  nid.value = "";
  photo.value = "";
}

/* ================= VALIDATION ================= */

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

/* ================= DUPLICATE CHECK ================= */

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

/* ================= SAVE MEMBER ================= */

window.saveMember = async function () {

  const nameVal = name.value.trim();
  const phoneVal = phone.value.trim();
  const nidVal = nid.value.trim();
  const file = photo.files[0];

  if (!validate(nameVal, phoneVal, nidVal)) return;

  if (await isDuplicate(phoneVal, nidVal, editId)) {
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

    if (editId) {

      await updateDoc(doc(db, "members", editId), {
        name: nameVal,
        phone: phoneVal,
        nid: nidVal,
        ...(photoURL && { photo: photoURL })
      });

      alert("Member updated successfully");

    } else {

      await addDoc(collection(db, "members"), {
        name: nameVal,
        phone: phoneVal,
        nid: nidVal,
        photo: photoURL,
        status: "Active",
        createdAt: serverTimestamp()
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

/* ================= LOAD MEMBERS ================= */

async function loadMembers() {

  table.innerHTML = "";

  const members = await getDocs(collection(db, "members"));
  const savings = await getDocs(collection(db, "savings"));
  const loans = await getDocs(collection(db, "loans"));

  members.forEach(mdoc => {

    const m = mdoc.data();

    let totalSaving = 0;
    let totalLoan = 0;
    let remaining = 0;

    savings.forEach(s => {
      if (s.data().memberId === mdoc.id) {
        totalSaving += Number(s.data().amount || 0);
      }
    });

    loans.forEach(l => {
      if (l.data().memberId === mdoc.id) {
        totalLoan += Number(l.data().total || 0);
        remaining += Number(l.data().remaining || 0);
      }
    });

    table.innerHTML += `
      <tr>
        <td>
          <img src="${m.photo || 'https://via.placeholder.com/40'}"
          style="width:40px;height:40px;border-radius:50%"> ${m.name}
        </td>

        <td>${m.phone}</td>
        <td>${m.nid}</td>

        <td>${totalSaving}</td>
        <td>${totalLoan}</td>
        <td>${remaining}</td>

        <td>${m.status}</td>

        <td>
          <button class="btn success" onclick="editMember('${mdoc.id}','${m.name}','${m.phone}','${m.nid}')">Edit</button>
          <button class="btn danger" onclick="deleteMember('${mdoc.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* ================= CARDS ================= */

async function loadCards() {

  const snap = await getDocs(collection(db, "members"));

  let total = snap.size;
  let active = 0;
  let verified = 0;
  let newThisMonth = 0;

  const month = new Date().getMonth();

  snap.forEach(d => {
    const m = d.data();

    if (m.status === "Active") active++;
    if (m.verified) verified++;

    if (m.createdAt) {
      const dte = m.createdAt.toDate?.() || new Date(m.createdAt);
      if (dte.getMonth() === month) newThisMonth++;
    }
  });

  memberCount.innerText = total;
  activeCount.innerText = active;
  verifiedCount.innerText = verified;
  newCount.innerText = newThisMonth;
}

/* ================= EDIT ================= */

window.editMember = function (id, name, phone, nid) {
  editId = id;
  modal.style.display = "flex";

  document.getElementById("formTitle").innerText = "Edit Member";

  name.value = name;
  phone.value = phone;
  nid.value = nid;
};

/* ================= DELETE ================= */

window.deleteMember = async function (id) {
  if (!confirm("Delete member?")) return;

  await deleteDoc(doc(db, "members", id));

  alert("Deleted successfully");

  loadMembers();
  loadCards();
};

/* ================= INIT ================= */

loadMembers();
loadCards();
