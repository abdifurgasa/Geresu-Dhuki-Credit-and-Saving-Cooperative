// ======================================================
// GERESU DHUKI SACCO — MEMBERS MODULE
// FILE: js/members.js
// ======================================================

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

// ======================================================
// ELEMENTS
// ======================================================

const memberForm = document.getElementById("memberForm");

const membersTable = document.getElementById("membersTable");

const searchInput = document.getElementById("searchMember");

const searchResults = document.getElementById("searchResults");

const selectedBox = document.getElementById("selectedMember");

// ======================================================
// LOAD MEMBERS
// ======================================================

async function loadMembers() {

  try {

    const snapshot = await getDocs(collection(db, "members"));

    membersTable.innerHTML = "";

    if (snapshot.empty) {

      membersTable.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center;padding:30px;color:red;">
            No members found
          </td>
        </tr>
      `;

      return;
    }

    snapshot.forEach((doc) => {

      const m = doc.data();

      const createdDate = m.createdAt
        ? new Date(
            m.createdAt.seconds * 1000
          ).toLocaleDateString()
        : "-";

      membersTable.innerHTML += `

        <tr>

          <td>
            <img
              src="${m.photoUrl}"
              class="member-photo"
            >
          </td>

          <td>${m.name}</td>

          <td>${m.phone}</td>

          <td>${m.nid}</td>

          <td>
            ${Number(m.savings || 0).toLocaleString()}
          </td>

          <td>
            ${Number(m.loanTotal || 0).toLocaleString()}
          </td>

          <td>
            ${Number(m.loanRemaining || 0).toLocaleString()}
          </td>

          <td>
            <span class="badge active">
              ${m.status || "active"}
            </span>
          </td>

          <td>${createdDate}</td>

          <td>
            ${m.createdBy || "-"}
          </td>

        </tr>

      `;
    });

  } catch (error) {

    console.error(error);

    membersTable.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center;color:red;padding:30px;">
          Failed to load members
        </td>
      </tr>
    `;
  }
}

// ======================================================
// ADD MEMBER
// ======================================================

memberForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const name = document
    .getElementById("name")
    .value.trim();

  const phone = document
    .getElementById("phone")
    .value.trim();

  const nid = document
    .getElementById("nid")
    .value.trim();

  const photo = document
    .getElementById("photo")
    .files[0];

  // ======================================================
  // VALIDATIONS
  // ======================================================

  if (phone.length !== 9) {

    alert("Phone must be 9 digits");

    return;
  }

  if (nid.length !== 16) {

    alert("NID must be 16 digits");

    return;
  }

  try {

    // ======================================================
    // CHECK DUPLICATE PHONE
    // ======================================================

    const phoneQuery = query(
      collection(db, "members"),
      where("phone", "==", phone)
    );

    const phoneSnap = await getDocs(phoneQuery);

    if (!phoneSnap.empty) {

      alert("Phone already exists");

      return;
    }

    // ======================================================
    // CHECK DUPLICATE NID
    // ======================================================

    const nidQuery = query(
      collection(db, "members"),
      where("nid", "==", nid)
    );

    const nidSnap = await getDocs(nidQuery);

    if (!nidSnap.empty) {

      alert("NID already exists");

      return;
    }

    // ======================================================
    // UPLOAD PHOTO
    // ======================================================

    const photoRef = ref(
      storage,
      "members/" + Date.now() + "_" + photo.name
    );

    await uploadBytes(photoRef, photo);

    const photoUrl = await getDownloadURL(photoRef);

    // ======================================================
    // CURRENT USER
    // ======================================================

    const user = auth.currentUser;

    // ======================================================
    // SAVE TO FIRESTORE
    // ======================================================

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

      createdBy: user
        ? user.email
        : "Admin",

      lastUpdatedAt: serverTimestamp(),

      lastUpdatedBy: user
        ? user.email
        : "Admin"
    });

    // ======================================================
    // SUCCESS
    // ======================================================

    alert("Member added successfully");

    memberForm.reset();

    document.getElementById(
      "memberModal"
    ).style.display = "none";

    loadMembers();

  } catch (error) {

    console.error(error);

    alert("Failed to add member");
  }
});

// ======================================================
// SEARCH MEMBERS
// ======================================================

async function searchMembers(keyword) {

  searchResults.innerHTML = "";

  if (!keyword) {

    searchResults.innerHTML = "";

    return;
  }

  try {

    const snapshot = await getDocs(
      collection(db, "members")
    );

    const members = [];

    snapshot.forEach((doc) => {

      members.push({
        id: doc.id,
        ...doc.data()
      });
    });

    const filtered = members.filter((m) => {

      return (
        m.name
          ?.toLowerCase()
          .includes(keyword.toLowerCase())

        ||

        m.phone
          ?.includes(keyword)

        ||

        m.nid
          ?.includes(keyword)
      );
    });

    if (filtered.length === 0) {

      searchResults.innerHTML = `
        <div class="search-item">
          No member found
        </div>
      `;

      return;
    }

    filtered.forEach((m) => {

      const div = document.createElement("div");

      div.className = "search-item";

      div.innerHTML = `

        <strong>
          👤 ${m.name}
        </strong>

        <small>
          📱 ${m.phone}
        </small>

        <small>
          🆔 ${m.nid}
        </small>

      `;

      // ======================================================
      // SELECT MEMBER
      // ======================================================

      div.onclick = () => {

        selectedBox.innerHTML = `

          👤 ${m.name}<br>

          📱 ${m.phone}<br>

          🆔 ${m.nid}<br>

          💰 Savings:
          ${Number(
            m.savings || 0
          ).toLocaleString()}<br>

          💵 Loan:
          ${Number(
            m.loanTotal || 0
          ).toLocaleString()}<br>

          🏦 Remaining:
          ${Number(
            m.loanRemaining || 0
          ).toLocaleString()}

        `;

        searchResults.innerHTML = "";

        searchInput.value = m.name;
      };

      searchResults.appendChild(div);
    });

  } catch (error) {

    console.error(error);
  }
}

// ======================================================
// SEARCH EVENT
// ======================================================

searchInput.addEventListener("input", (e) => {

  searchMembers(e.target.value);
});

// ======================================================
// INITIAL LOAD
// ======================================================

loadMembers();
