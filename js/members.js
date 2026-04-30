import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   ADD MEMBER
========================= */
window.addMember = async function () {

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const nid = document.getElementById("nid").value;

  if (!name || !phone || !nid) {
    alert("Fill all fields");
    return;
  }

  await addDoc(collection(db, "members"), {
    name,
    phone,
    nationalId: nid,
    createdAt: new Date()
  });

  alert("Member added successfully");

  loadMembers();
};

/* =========================
   LOAD MEMBERS
========================= */
async function loadMembers() {

  const snap = await getDocs(collection(db, "members"));

  const table = document.getElementById("memberTable");
  table.innerHTML = "";

  snap.forEach(d => {
    const m = d.data();

    table.innerHTML += `
      <tr>
        <td>${m.name}</td>
        <td>${m.phone}</td>
        <td>${m.nationalId}</td>
        <td>
          <button onclick="deleteMember('${d.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* =========================
   DELETE MEMBER
========================= */
window.deleteMember = async function (id) {
  await deleteDoc(doc(db, "members", id));
  loadMembers();
};

loadMembers();
