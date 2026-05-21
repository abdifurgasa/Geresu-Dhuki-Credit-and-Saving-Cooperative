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

/* =========================================================
   MODAL FUNCTIONS
========================================================= */

window.openModal = function () {
  const modal = document.getElementById("memberModal");
  if (modal) modal.style.display = "flex";
};

window.closeModal = function () {
  const modal = document.getElementById("memberModal");
  if (modal) modal.style.display = "none";
};

/* =========================================================
   SAVE MEMBER (NO PHOTO - FIXED)
========================================================= */

if (memberForm) {
  memberForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const nid = document.getElementById("nid").value.trim();

      /* VALIDATION */
      if (!name || !phone || !nid) {
        alert("Please fill all fields");
        return;
      }

      if (phone.length < 9) {
        alert("Invalid phone number");
        return;
      }

      if (nid.length < 10) {
        alert("Invalid NID");
        return;
      }

      /* DUPLICATE PHONE CHECK */
      const phoneQ = query(collection(db, "members"), where("phone", "==", phone));
      const phoneSnap = await getDocs(phoneQ);

      if (!phoneSnap.empty) {
        alert("Phone already exists");
        return;
      }

      /* DUPLICATE NID CHECK */
      const nidQ = query(collection(db, "members"), where("nid", "==", nid));
      const nidSnap = await getDocs(nidQ);

      if (!nidSnap.empty) {
        alert("NID already exists");
        return;
      }

      /* SAVE MEMBER */
      await addDoc(collection(db, "members"), {
        name,
        phone,
        nid,

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
      console.error(error);
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

  try {
    const snapshot = await getDocs(collection(db, "members"));

    snapshot.forEach((doc) => {
      const m = doc.data();

      const date = m.createdAt
        ? new Date(m.createdAt.seconds * 1000).toLocaleDateString()
        : "-";

      membersTable.innerHTML += `
        <tr>
          <td>${m.name}</td>
          <td>${m.phone}</td>
          <td>${m.nid}</td>
          <td>${m.savings} ETB</td>
          <td>${m.loanTotal} ETB</td>
          <td><span class="badge active">${m.status}</span></td>
          <td>${m.createdBy}</td>
          <td>${date}</td>
        </tr>
      `;
    });

  } catch (error) {
    console.error(error);
  }
}

loadMembers();

/* =========================================================
   SEARCH MEMBER (LIVE FILTER)
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
