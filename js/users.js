import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD USERS
========================= */

async function loadUsers() {

  const table = document.getElementById("usersTable");

  const snap = await getDocs(collection(db, "users"));

  table.innerHTML = "";

  snap.forEach((docSnap) => {

    const u = docSnap.data();

    table.innerHTML += `
      <tr>
        <td>${u.name || "-"}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>

        <td>
          <select onchange="changeRole('${docSnap.id}', this.value)">
            <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
            <option value="teller" ${u.role === "teller" ? "selected" : ""}>Teller</option>
            <option value="member" ${u.role === "member" ? "selected" : ""}>Member</option>
          </select>
        </td>

        <td>
          <button class="btn danger"
                  onclick="deleteUser('${docSnap.id}')">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}

loadUsers();

/* =========================
   CHANGE ROLE
========================= */

window.changeRole = async function (uid, newRole) {

  await updateDoc(doc(db, "users", uid), {
    role: newRole
  });

  alert("Role updated");
};

/* =========================
   DELETE USER
========================= */

window.deleteUser = async function (uid) {

  if (!confirm("Delete this user?")) return;

  await deleteDoc(doc(db, "users", uid));

  alert("User deleted");

  loadUsers();
};
