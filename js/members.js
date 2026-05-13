import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD MEMBERS
========================= */

onSnapshot(collection(db, "members"), snap => {

  const table = document.getElementById("memberTable");
  table.innerHTML = "";

  snap.forEach(docSnap => {

    const m = docSnap.data();

    table.innerHTML += `
      <tr>
        <td><img src="${m.photo}" width="40"/></td>
        <td>${m.name}</td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>
        <td>${m.savings || 0}</td>
        <td>${m.loans || 0}</td>
        <td>${m.repayment || 0}</td>
        <td>${m.remaining || 0}</td>
        <td>${m.status || "active"}</td>
        <td>
          <button onclick="viewLogs('${docSnap.id}')">Logs</button>
        </td>
      </tr>
    `;
  });

});

/* =========================
   ADD MEMBER (FIXED + VALIDATION)
========================= */

window.addMember = async function () {

  const user = auth.currentUser;

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const nid = document.getElementById("nid").value;
  const photo = document.getElementById("photo").value;

  /* VALIDATION */
  if (phone.length !== 9) {
    return alert("Phone must be 9 digits");
  }

  if (nid.length !== 16) {
    return alert("NID must be 16 digits");
  }

  await addDoc(collection(db, "members"), {

    name,
    phone,
    nid,
    photo,

    savings: 0,
    loans: 0,
    repayment: 0,
    remaining: 0,
    status: "active",

    /* ⭐ WHO CREATED MEMBER */
    createdBy: user?.email || "unknown",
    createdById: user?.uid || null,

    createdAt: new Date().toISOString()

  });

  alert("Member added successfully");

};

/* =========================
   VIEW MEMBER LOGS
========================= */

window.viewLogs = async function (memberId) {

  const logsDiv = document.getElementById("memberLogs");

  logsDiv.innerHTML = `
    <h4>Logs for Member ID: ${memberId}</h4>
    <p>✔ Created by admin<br>
    ✔ Updated savings/loan history appears here (future upgrade)</p>
  `;
};
