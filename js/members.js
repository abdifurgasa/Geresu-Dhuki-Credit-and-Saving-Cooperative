import { db, storage, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

/* =========================
   ELEMENTS
========================= */
const memberForm = document.getElementById("memberForm");
const membersTable = document.getElementById("membersTable");
const searchInput = document.getElementById("searchMember");
const searchResults = document.getElementById("searchResults");
const selectedMember = document.getElementById("selectedMember");
const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");
const modal = document.getElementById("memberModal");

/* =========================
   PHOTO PREVIEW FIX
========================= */
photoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    photoPreview.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

/* =========================
   SAVE MEMBER (FIXED)
========================= */
memberForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const nid = document.getElementById("nid").value.trim();
    const photo = photoInput.files[0];

    if (!photo) return alert("Select photo");

    if (phone.length !== 9) return alert("Phone must be 9 digits");
    if (nid.length !== 16) return alert("NID must be 16 digits");

    // duplicate phone
    const phoneSnap = await getDocs(
      query(collection(db, "members"), where("phone", "==", phone))
    );
    if (!phoneSnap.empty) return alert("Phone already exists");

    // duplicate nid
    const nidSnap = await getDocs(
      query(collection(db, "members"), where("nid", "==", nid))
    );
    if (!nidSnap.empty) return alert("NID already exists");

    // upload photo
    const fileName = Date.now() + "_" + photo.name;
    const storageRef = ref(storage, "members/" + fileName);

    await uploadBytes(storageRef, photo);
    const photoUrl = await getDownloadURL(storageRef);

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
      createdAt: serverTimestamp(),
      createdBy: user ? user.uid : "admin"
    });

    alert("✅ Member saved successfully");

    memberForm.reset();
    photoPreview.src =
      "https://dummyimage.com/120x120/cccccc/000000&text=Photo";

    modal.style.display = "none";

    loadMembers();

  } catch (err) {
    console.error(err);
    alert("❌ Failed: " + err.message);
  }
});

/* =========================
   LOAD MEMBERS
========================= */
async function loadMembers() {
  membersTable.innerHTML = "";

  const snapshot = await getDocs(collection(db, "members"));

  snapshot.forEach((doc) => {
    const m = doc.data();

    membersTable.innerHTML += `
      <tr>
        <td><img src="${m.photoUrl}" class="member-photo"></td>
        <td>${m.name}</td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>
        <td>${m.savings}</td>
        <td>${m.loanTotal}</td>
        <td>${m.loanRemaining}</td>
        <td>${m.status}</td>
        <td>-</td>
        <td>${m.createdBy}</td>
      </tr>
    `;
  });
}

loadMembers();
