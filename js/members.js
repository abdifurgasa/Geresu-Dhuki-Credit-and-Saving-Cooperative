import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const membersRef = collection(db, "members");

/* =========================
   LOAD MEMBERS
========================= */
async function loadMembers() {
  const snap = await getDocs(membersRef);

  let html = "";

  snap.forEach(d => {
    const data = d.data();

    html += `
      <tr>
        <td>${data.fullName}</td>
        <td>${data.email || "-"}</td>
        <td>${data.phone}</td>
        <td>${data.nid}</td>
        <td>
          <button onclick="deleteMember('${d.id}')">Delete</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("membersTable").innerHTML = html;
}

loadMembers();

/* =========================
   OPEN / CLOSE FORM
========================= */
window.openForm = function () {
  document.getElementById("formModal").style.display = "flex";
};

window.closeForm = function () {
  document.getElementById("formModal").style.display = "none";

  document.getElementById("fullName").value = "";
  document.getElementById("email").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("nid").value = "";
};

/* =========================
   SAVE MEMBER (STRICT UNIQUE CHECK)
========================= */
window.saveMember = async function () {

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const nid = document.getElementById("nid").value.trim();

  if (!fullName || !phone || !nid) {
    alert("Full Name, Phone, and National ID are required!");
    return;
  }

  /* CHECK NATIONAL ID */
  const nidQuery = query(membersRef, where("nid", "==", nid));
  const nidSnap = await getDocs(nidQuery);

  if (!nidSnap.empty) {
    alert("❌ National ID already registered!");
    return;
  }

  /* CHECK PHONE */
  const phoneQuery = query(membersRef, where("phone", "==", phone));
  const phoneSnap = await getDocs(phoneQuery);

  if (!phoneSnap.empty) {
    alert("❌ Phone number already registered!");
    return;
  }

  /* SAVE */
  await addDoc(membersRef, {
    fullName,
    email,
    phone,
    nid,
    createdAt: new Date()
  });

  alert("✅ Member registered successfully!");

  closeForm();
  loadMembers();
};

/* =========================
   DELETE MEMBER
========================= */
window.deleteMember = async function (id) {
  await deleteDoc(doc(db, "members", id));
  loadMembers();
};

/* =========================
   SIDEBAR TOGGLE
========================= */
window.toggleSidebar = function () {
  document.getElementById("sidebar").classList.toggle("collapsed");
};
