import { db, storage, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const table = document.getElementById("membersTable");

/* =========================
   LOAD MEMBERS TABLE
========================= */
async function loadMembers() {

  const snapshot = await getDocs(collection(db, "members"));

  table.innerHTML = "";

  snapshot.forEach((doc) => {

    const m = doc.data();

    table.innerHTML += `
      <tr>
        <td><img src="${m.photoUrl}" width="50"></td>
        <td>${m.name}</td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>
        <td>${m.savings}</td>
        <td>${m.loanTotal}</td>
        <td>${m.status}</td>
      </tr>
    `;
  });

}

/* =========================
   ADD MEMBER
========================= */
document.getElementById("memberForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const nid = document.getElementById("nid").value;
  const photo = document.getElementById("photo").files[0];

  const photoRef = ref(storage, "members/" + Date.now() + photo.name);
  await uploadBytes(photoRef, photo);

  const photoUrl = await getDownloadURL(photoRef);

  const user = auth.currentUser;

  await addDoc(collection(db, "members"), {
    name,
    phone,
    nid,
    photoUrl,

    savings: 0,
    loanTotal: 0,
    loanRemaining: 0,

    status: "active",
    isDeleted: false,

    createdAt: serverTimestamp(),
    createdBy: user?.uid || "system",

    lastUpdatedAt: serverTimestamp(),
    lastUpdatedBy: user?.uid || "system"
  });

  alert("Member added!");

  closeModal();
  loadMembers();
});

/* INIT */
loadMembers();
