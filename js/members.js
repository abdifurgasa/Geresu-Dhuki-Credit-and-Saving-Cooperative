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

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =====================================================
   ELEMENTS
===================================================== */

const memberForm = document.getElementById("memberForm");
const membersTable = document.getElementById("membersTable");

const searchInput = document.getElementById("searchMember");
const searchResults = document.getElementById("searchResults");
const selectedMember = document.getElementById("selectedMember");

const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");

const modal = document.getElementById("memberModal");

/* =====================================================
   AUTH STATE (IMPORTANT FIX)
===================================================== */

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {
  modal.style.display = "none";
}

/* =====================================================
   PHOTO PREVIEW
===================================================== */

photoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    photoPreview.src = event.target.result;
    photoPreview.style.display = "block";
  };

  reader.readAsDataURL(file);
});

/* =====================================================
   LOAD MEMBERS
===================================================== */

async function loadMembers() {
  try {
    membersTable.innerHTML = "";

    const snapshot = await getDocs(collection(db, "members"));

    if (snapshot.empty) {
      membersTable.innerHTML = `
        <tr>
          <td colspan="10">No members found</td>
        </tr>
      `;
      return;
    }

    snapshot.forEach((doc) => {
      const m = doc.data();

      const createdDate = m.createdAt?.toDate
        ? m.createdAt.toDate().toLocaleDateString()
        : "-";

      membersTable.innerHTML += `
        <tr>
          <td>
            <img src="${m.photoUrl}" class="member-photo">
          </td>
          <td>${m.name}</td>
          <td>${m.phone}</td>
          <td>${m.nid}</td>
          <td>${m.savings || 0}</td>
          <td>${m.loanTotal || 0}</td>
          <td>${m.loanRemaining || 0}</td>
          <td>${m.status}</td>
          <td>${createdDate}</td>
          <td>${m.createdBy || "-"}</td>
        </tr>
      `;
    });

  } catch (error) {
    console.error("Load error:", error);
  }
}

loadMembers();

/* =====================================================
   SAVE MEMBER (FIXED FULL ENGINE)
===================================================== */

memberForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {

    if (!currentUser) {
      alert("Please login first");
      return;
    }

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const nid = document.getElementById("nid").value.trim();
    const photo = photoInput.files[0];

    /* VALIDATION */
    if (!photo) return alert("Select photo");
    if (phone.length !== 9) return alert("Phone must be 9 digits");
    if (nid.length !== 16) return alert("NID must be 16 digits");

    /* DUPLICATE PHONE */
    const phoneSnap = await getDocs(
      query(collection(db, "members"), where("phone", "==", phone))
    );

    if (!phoneSnap.empty) return alert("Phone already exists");

    /* DUPLICATE NID */
    const nidSnap = await getDocs(
      query(collection(db, "members"), where("nid", "==", nid))
    );

    if (!nidSnap.empty) return alert("NID already exists");

    /* UPLOAD PHOTO */
    const fileName = Date.now() + "_" + photo.name;

    const storageRef = ref(storage, "members/" + fileName);

    await uploadBytes(storageRef, photo);

    const photoUrl = await getDownloadURL(storageRef);

    /* SAVE FIRESTORE */
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
      createdBy: currentUser.uid,

      lastUpdatedAt: serverTimestamp(),
      lastUpdatedBy: currentUser.uid
    });

    alert("Member saved successfully");

    memberForm.reset();

    photoPreview.style.display = "none";

    modal.style.display = "none";

    loadMembers();

  } catch (error) {
    console.error("SAVE ERROR:", error);
    alert(error.message);
  }
});

/* =====================================================
   SEARCH SYSTEM
===================================================== */

searchInput.addEventListener("input", async () => {

  const value = searchInput.value.toLowerCase();

  searchResults.innerHTML = "";

  if (!value) return;

  const snapshot = await getDocs(collection(db, "members"));

  snapshot.forEach((doc) => {

    const m = doc.data();

    const match =
      m.name.toLowerCase().includes(value) ||
      m.phone.includes(value) ||
      m.nid.includes(value);

    if (match) {

      const div = document.createElement("div");
      div.className = "search-item";

      div.innerHTML = `
        <strong>${m.name}</strong>
        <small>📱 ${m.phone}</small>
      `;

      div.onclick = () => {

        selectedMember.innerHTML = `
          👤 ${m.name}<br>
          📱 ${m.phone}<br>
          🆔 ${m.nid}<br>
          💰 Savings: ${m.savings || 0}
        `;

        searchInput.value = m.name;
        searchResults.innerHTML = "";
      };

      searchResults.appendChild(div);
    }
  });
});
