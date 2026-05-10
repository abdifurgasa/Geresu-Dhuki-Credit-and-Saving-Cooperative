import { db }
from "./firebase.js";

import {

  collection,
  getDocs,
  updateDoc,
  doc

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD USERS
========================= */
async function loadRoles() {

  const table =
    document.getElementById("roleTable");

  table.innerHTML = "";

  const snap =
    await getDocs(
      collection(db, "users")
    );

  snap.forEach((userDoc) => {

    const user =
      userDoc.data();

    table.innerHTML += `

      <tr>

        <td>${user.fullName}</td>

        <td>
          <select onchange="changeRole('${userDoc.id}', this.value)">

            <option value="admin"
              ${user.role === "admin" ? "selected" : ""}>
              Admin
            </option>

            <option value="teller"
              ${user.role === "teller" ? "selected" : ""}>
              Teller
            </option>

            <option value="auditor"
              ${user.role === "auditor" ? "selected" : ""}>
              Auditor
            </option>

          </select>
        </td>

        <td>Role Control</td>

      </tr>

    `;
  });
}

/* =========================
   CHANGE ROLE
========================= */
window.changeRole = async function (id, newRole) {

  try {

    await updateDoc(
      doc(db, "users", id),
      {
        role: newRole
      }
    );

    alert("Role updated successfully");

  }

  catch (err) {

    console.error(err);

    alert("Failed to update role");
  }
};

/* =========================
   INIT
========================= */
loadRoles();
