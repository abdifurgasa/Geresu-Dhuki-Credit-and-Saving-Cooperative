import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   ADD MEMBER
========================= */
window.addMember = async function () {

  let name = document.getElementById("name").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let role = document.getElementById("role").value || "member";

  if (!name) return alert("Enter member name");

  try {
    await addDoc(collection(db, "members"), {
      name,
      phone,
      role,
      createdAt: new Date().toISOString()
    });

    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";

  } catch (err) {
    console.error(err);
  }
};

/* =========================
   LOAD MEMBERS (REAL TIME)
========================= */
function loadMembers() {

  const list = document.getElementById("memberTable");

  onSnapshot(collection(db, "members"), (snap) => {

    list.innerHTML = "";

    snap.forEach((docSnap) => {

      let d = docSnap.data();

      list.innerHTML += `
        <tr>
          <td>${d.name}</td>
          <td>${d.phone || "-"}</td>
          <td>${d.role}</td>
          <td>${d.createdAt?.split("T")[0] || "-"}</td>

          <td>
            <button onclick="deleteMember('${docSnap.id}')">
              Delete
            </button>
          </td>
        </tr>
      `;
    });

  });
}

/* =========================
   DELETE MEMBER
========================= */
window.deleteMember = async function (id) {
  try {
    await deleteDoc(doc(db, "members", id));
  } catch (err) {
    console.error(err);
  }
};

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadMembers();
});
import { requireRole } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  requireRole("admin");
});
