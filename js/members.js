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

const table = document.getElementById("memberTable");

let editId = null;

/* =======================
   VALIDATION
======================= */
function validate(name, phone, nid) {
  if (!name || !phone || !nid) {
    alert("All fields required");
    return false;
  }

  if (!/^\d{9}$/.test(phone)) {
    alert("Phone must be 9 digits");
    return false;
  }

  if (!/^\d{16}$/.test(nid)) {
    alert("NID must be 16 digits");
    return false;
  }

  return true;
}

/* =======================
   DUPLICATE CHECK
======================= */
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

/* =======================
   OPEN / CLOSE MODAL
======================= */
window.openModal = () => {
  document.getElementById("modal").style.display = "flex";
  editId = null;
};

window.closeModal = () => {
  document.getElementById("modal").style.display = "none";
};

/* =======================
   SAVE MEMBER
======================= */
window.saveMember = async () => {

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const nid = document.getElementById("nid").value.trim();
  const file = document.getElementById("photo").files[0];

  if (!validate(name, phone, nid)) return;

  if (await isDuplicate(phone, nid, editId)) {
    alert("Duplicate phone or NID");
    return;
  }

  let photoURL = "";

  if (file) {
    const imgRef = ref(storage, "members/" + Date.now() + file.name);
    await uploadBytes(imgRef, file);
    photoURL = await getDownloadURL(imgRef);
  }

  if (editId) {
    await updateDoc(doc(db, "members", editId), {
      name, phone, nid,
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
      createdAt: serverTimestamp()
    });

    alert("Member saved successfully");
  }

  closeModal();
  loadMembers();
  loadCards();
};

/* =======================
   LOAD MEMBERS
======================= */
async function loadMembers() {

  table.innerHTML = "";

  const members = await getDocs(collection(db, "members"));
  const savings = await getDocs(collection(db, "savings"));
  const loans = await getDocs(collection(db, "loans"));

  members.forEach(mDoc => {

    const m = mDoc.data();

    let savingTotal = 0;
    let loanTotal = 0;
    let remaining = 0;

    savings.forEach(s => {
      if (s.data().memberId === mDoc.id)
        savingTotal += Number(s.data().amount || 0);
    });

    loans.forEach(l => {
      if (l.data().memberId === mDoc.id) {
        loanTotal += Number(l.data().amount || 0);
        remaining += Number(l.data().remaining || 0);
      }
    });

    table.innerHTML += `
      <tr>
        <td>
          <img src="${m.photo || 'https://via.placeholder.com/40'}"
               style="width:40px;height:40px;border-radius:50%">
          ${m.name}
        </td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>
        <td>${savingTotal}</td>
        <td>${loanTotal}</td>
        <td>${remaining}</td>
        <td>${m.status}</td>
        <td>
          <button onclick="editMember('${mDoc.id}')">Edit</button>
          <button onclick="deleteMember('${mDoc.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* =======================
   CARDS
======================= */
async function loadCards() {
  const snap = await getDocs(collection(db, "members"));

  document.getElementById("memberCount").innerText = snap.size;
  document.getElementById("activeCount").innerText = snap.size;
  document.getElementById("verifiedCount").innerText = snap.size;
  document.getElementById("newCount").innerText = snap.size;
}

/* =======================
   EDIT
======================= */
window.editMember = async (id) => {
  editId = id;
  document.getElementById("modal").style.display = "flex";
};

/* =======================
   DELETE
======================= */
window.deleteMember = async (id) => {
  await deleteDoc(doc(db, "members", id));
  alert("Deleted successfully");
  loadMembers();
  loadCards();
};

/* =======================
   INIT
======================= */
loadMembers();
loadCards();
