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

/* =========================================================
   AUTH SAFE STATE
========================================================= */

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
});

/* =========================================================
   ELEMENTS
========================================================= */

const memberForm = document.getElementById("memberForm");
const membersTable = document.getElementById("membersTable");

const searchInput = document.getElementById("searchMember");
const searchResults = document.getElementById("searchResults");
const selectedMember = document.getElementById("selectedMember");

const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");

const modal = document.getElementById("memberModal");

/* =========================================================
   MODAL
========================================================= */

function openModal() {
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}

/* =========================================================
   PHOTO PREVIEW
========================================================= */

if (photoInput) {
  photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      photoPreview.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* =========================================================
   SAVE MEMBER (FIXED + SAFE)
========================================================= */

if (memberForm) {
  memberForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const nid = document.getElementById("nid").value.trim();

      const photo = photoInput.files[0];

      /* VALIDATION */
      if (!name || !phone || !nid) {
        alert("Please fill all fields");
        return;
      }

      if (!photo) {
        alert("Please select photo");
        return;
      }

      /* DUPLICATE CHECK (PHONE) */
      const phoneQ = query(collection(db, "members"), where("phone", "==", phone));
      const phoneSnap = await getDocs(phoneQ);

      if (!phoneSnap.empty) {
        alert("Phone already exists");
        return;
      }

      /* DUPLICATE CHECK (NID) */
      const nidQ = query(collection(db, "members"), where("nid", "==", nid));
      const nidSnap = await getDocs(nidQ);

      if (!nidSnap.empty) {
        alert("NID already exists");
        return;
      }

      /* UPLOAD PHOTO (SAFE) */
      let photoUrl = "";

      try {
        const fileName = Date.now() + "_" + photo.name;
        const storageRef = ref(storage, "members/" + fileName);

        await uploadBytes(storageRef, photo);
        photoUrl = await getDownloadURL(storageRef);

      } catch (err) {
        console.error("Upload error:", err);
        alert("Photo upload failed");
        return;
      }

      /* SAVE MEMBER */
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
        createdBy: currentUser?.email || "admin"
      });

      alert("✅ Member saved successfully");

      memberForm.reset();
      photoPreview.src = "https://dummyimage.com/120x120/cccccc/000000&text=Photo";

      closeModal();

      loadMembers();

    } catch (error) {
      console.error("SAVE ERROR:", error);
      alert("❌ Failed to save member: " + error.message);
    }
  });
}

/* =========================================================
   LOAD MEMBERS
========================================================= */

async function loadMembers() {
  if (!membersTable) return;

  membersTable.innerHTML = "";

  const snapshot = await getDocs(collection(db, "members"));

  snapshot.forEach((doc) => {
    const m = doc.data();

    const date = m.createdAt
      ? new Date(m.createdAt.seconds * 1000).toLocaleDateString()
      : "-";

    membersTable.innerHTML += `
      <tr>
        <td><img src="${m.photoUrl}" class="member-photo"/></td>
        <td>${m.name}</td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>
        <td>${m.savings} ETB</td>
        <td>${m.loanTotal} ETB</td>
        <td>${m.loanRemaining} ETB</td>
        <td><span class="badge active">${m.status}</span></td>
        <td>${date}</td>
        <td>${m.createdBy}</td>
      </tr>
    `;
  });
}

loadMembers();

/* =========================================================
   SEARCH
========================================================= */

if (searchInput) {
  searchInput.addEventListener("input", async () => {
    const value = searchInput.value.toLowerCase();

    searchResults.innerHTML = "";
    if (!value) return;

    const snapshot = await getDocs(collection(db, "members"));

    snapshot.forEach((doc) => {
      const m = doc.data();

      if (
        m.name.toLowerCase().includes(value) ||
        m.phone.includes(value) ||
        m.nid.includes(value)
      ) {
        const div = document.createElement("div");
        div.className = "search-item";

        div.innerHTML = `
          <strong>${m.name}</strong>
          <small>${m.phone}</small>
        `;

        div.onclick = () => {
          selectedMember.innerHTML = `
            👤 ${m.name}<br>
            📱 ${m.phone}<br>
            🆔 ${m.nid}<br>
            💰 Savings: ${m.savings} ETB
          `;

          searchResults.innerHTML = "";
          searchInput.value = m.name;
        };

        searchResults.appendChild(div);
      }
    });
  });
}
