import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const storage = getStorage();

let currentEditId = null;
let uploadedImageURL = "";

/* ================= TOAST ================= */
function toast(msg) {
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}

/* ================= MODAL ================= */
window.openModal = function () {
  document.getElementById("modal").classList.add("show");
  document.getElementById("formTitle").innerText =
    currentEditId ? "Edit Member" : "Add Member";
};

window.closeModal = function () {
  document.getElementById("modal").classList.remove("show");
  clearForm();
};

function clearForm() {
  currentEditId = null;
  uploadedImageURL = "";

  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("nid").value = "";
  document.getElementById("preview").src =
    "https://via.placeholder.com/100";
}

/* ================= IMAGE UPLOAD ================= */
document.getElementById("photo").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const storageRef = ref(storage, "members/" + file.name);
  await uploadBytes(storageRef, file);
  uploadedImageURL = await getDownloadURL(storageRef);

  document.getElementById("preview").src = uploadedImageURL;
  toast("Image uploaded");
});

/* ================= SAVE MEMBER ================= */
window.saveMember = async function () {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const nid = document.getElementById("nid").value;

  if (!name || !phone || !nid) {
    toast("Fill all fields");
    return;
  }

  if (currentEditId) {
    await updateDoc(doc(db, "members", currentEditId), {
      name,
      phone,
      nid,
      photo: uploadedImageURL
    });
    toast("Member updated");
  } else {
    await addDoc(collection(db, "members"), {
      name,
      phone,
      nid,
      photo: uploadedImageURL,
      savings: 0,
      loans: 0,
      status: "Active",
      createdAt: new Date()
    });
    toast("Member added");
  }

  closeModal();
  loadMembers();
  loadCounts();
};

/* ================= EDIT ================= */
window.openEdit = function (id, m) {
  currentEditId = id;

  document.getElementById("name").value = m.name;
  document.getElementById("phone").value = m.phone;
  document.getElementById("nid").value = m.nid;

  if (m.photo) {
    document.getElementById("preview").src = m.photo;
    uploadedImageURL = m.photo;
  }

  openModal();
};

/* ================= DELETE ================= */
window.deleteMember = async function (id) {
  if (!confirm("Are you sure you want to delete this member?")) return;

  await deleteDoc(doc(db, "members", id));
  toast("Member deleted");

  loadMembers();
  loadCounts();
};

/* ================= VIEW ================= */
window.viewMember = function (m) {
  alert(`
Name: ${m.name}
Phone: ${m.phone}
NID: ${m.nid}
Savings: ${m.savings || 0}
Loans: ${m.loans || 0}
  `);
};

/* ================= LOAD MEMBERS ================= */
export async function loadMembers() {
  const table = document.getElementById("memberTable");
  table.innerHTML = "";

  const snap = await getDocs(collection(db, "members"));

  snap.forEach((d) => {
    const m = d.data();

    table.innerHTML += `
      <tr>
        <td>
          ${m.photo ? `<img src="${m.photo}" width="40" style="border-radius:50%">` : ""}
          ${m.name}
        </td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>
        <td>${m.savings || 0}</td>
        <td>${m.loans || 0}</td>
        <td>${(m.savings || 0) - (m.loans || 0)}</td>
        <td>${m.status}</td>
        <td>
          <button class="btn view-btn" onclick='viewMember(${JSON.stringify(m)})'>View</button>
          <button class="btn edit-btn" onclick='openEdit("${d.id}",${JSON.stringify(m)})'>Edit</button>
          <button class="btn delete-btn" onclick='deleteMember("${d.id}")'>Delete</button>
        </td>
      </tr>
    `;
  });
}

/* ================= DASHBOARD COUNTS ================= */
export async function loadCounts() {
  const snap = await getDocs(collection(db, "members"));

  let total = 0;
  let active = 0;

  snap.forEach((d) => {
    total++;
    if (d.data().status === "Active") active++;
  });

  document.getElementById("memberCount").innerText = total;
  document.getElementById("activeCount").innerText = active;
}
