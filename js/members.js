import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

/* expose for HTML buttons */
window.openModal = openModal;
window.closeModal = closeModal;

/* =========================================================
   SAVE MEMBER (NO PHOTO VERSION - STABLE)
========================================================= */

if (memberForm) {

  memberForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {

      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const nid = document.getElementById("nid").value.trim();

      /* ================= VALIDATION ================= */

      if (!name || !phone || !nid) {
        alert("Please fill all fields");
        return;
      }

      /* ================= DUPLICATE CHECK PHONE ================= */

      const phoneQ = query(
        collection(db, "members"),
        where("phone", "==", phone)
      );

      const phoneSnap = await getDocs(phoneQ);

      if (!phoneSnap.empty) {
        alert("Phone already exists");
        return;
      }

      /* ================= DUPLICATE CHECK NID ================= */

      const nidQ = query(
        collection(db, "members"),
        where("nid", "==", nid)
      );

      const nidSnap = await getDocs(nidQ);

      if (!nidSnap.empty) {
        alert("NID already exists");
        return;
      }

      /* ================= SAVE MEMBER ================= */

      await addDoc(collection(db, "members"), {

        name,
        phone,
        nid,

        /* SAFE DEFAULT IMAGE (NO STORAGE) */
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,

        savings: 0,
        loanTotal: 0,
        loanRemaining: 0,

        status: "active",

        createdAt: serverTimestamp(),
        createdBy: currentUser?.email || "admin"

      });

      alert("✅ Member saved successfully");

      memberForm.reset();

      closeModal();

      loadMembers();

    } catch (error) {
      console.error("SAVE ERROR:", error);
      alert("❌ Failed: " + error.message);
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

        <td>
          <img src="${m.photoUrl}" class="member-photo"/>
        </td>

        <td>${m.name}</td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>
        <td>${m.savings} ETB</td>
        <td>${m.loanTotal} ETB</td>
        <td>${m.status}</td>
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
