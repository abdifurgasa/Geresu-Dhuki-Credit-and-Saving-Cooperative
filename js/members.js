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

  if (!name) return alert("Enter member name");

  try {
    await addDoc(collection(db, "members"), {
      name: name,
      createdAt: new Date()
    });

    document.getElementById("name").value = "";
  } catch (err) {
    console.error(err);
  }
};

/* =========================
   LOAD MEMBERS (REAL TIME)
========================= */
function loadMembers() {
  const list = document.getElementById("list");

  onSnapshot(collection(db, "members"), (snap) => {
    list.innerHTML = "";

    snap.forEach((docSnap) => {
      let data = docSnap.data();

      list.innerHTML += `
        <div class="member-item">
          <span>${data.name}</span>

          <button onclick="deleteMember('${docSnap.id}')">
            Delete
          </button>
        </div>
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
