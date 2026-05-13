import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD MEMBERS
========================= */

onSnapshot(collection(db, "members"), (snap) => {

  const table = document.getElementById("memberTable");
  table.innerHTML = "";

  snap.forEach(docSnap => {

    const m = docSnap.data();

    table.innerHTML += `
      <tr>
        <td><img src="${m.photo || 'https://via.placeholder.com/50'}" width="40"></td>
        <td>${m.name}</td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>
        <td>${m.savings || 0} ETB</td>
        <td>${m.loans || 0} ETB</td>
        <td>${m.status || "active"}</td>

        <td>
          <button onclick="deleteMember('${docSnap.id}')">Delete</button>
        </td>
      </tr>
    `;
  });

});

/* =========================
   VALIDATION (IMPORTANT FIX)
========================= */

function validate(phone, nid) {

  if (phone.length !== 9) {
    alert("Phone must be 9 digits");
    return false;
  }

  if (nid.length !== 16) {
    alert("NID must be 16 digits");
    return false;
  }

  return true;
}

/* =========================
   CHECK DUPLICATES
========================= */

async function checkDuplicate(phone, nid) {

  const q1 = query(collection(db, "members"), where("phone", "==", phone));
  const q2 = query(collection(db, "members"), where("nid", "==", nid));

  const snap1 = await getDocs(q1);
  const snap2 = await getDocs(q2);

  if (!snap1.empty || !snap2.empty) {
    alert("Phone or NID already exists!");
    return true;
  }

  return false;
}

/* =========================
   ADD MEMBER
========================= */

window.addMember = async function () {

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const nid = document.getElementById("nid").value;

  if (!validate(phone, nid)) return;

  if (await checkDuplicate(phone, nid)) return;

  await addDoc(collection(db, "members"), {

    name,
    phone,
    nid,
    savings: 0,
    loans: 0,
    status: "active",
    createdAt: new Date().toISOString()

  });

  alert("Member added successfully");

  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("nid").value = "";
};

/* =========================
   DELETE MEMBER
========================= */

window.deleteMember = async function (id) {

  if (!confirm("Are you sure to delete this member?")) return;

  await deleteDoc(doc(db, "members", id));

  alert("Member deleted");
};

/* =========================
   FILTER
========================= */

window.filterMembers = function () {

  const value = document.getElementById("search").value.toLowerCase();

  document.querySelectorAll("#memberTable tr").forEach(row => {

    row.style.display =
      row.innerText.toLowerCase().includes(value)
        ? ""
        : "none";
  });
};
