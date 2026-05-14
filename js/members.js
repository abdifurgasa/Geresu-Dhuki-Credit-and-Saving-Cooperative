import { db, storage, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

/* =====================================================
   ELEMENTS
===================================================== */

const memberForm = document.getElementById("memberForm");

const membersTable = document.getElementById("membersTable");

const searchInput = document.getElementById("searchInput");

const searchMember = document.getElementById("searchMember");

const searchResults = document.getElementById("searchResults");

const selectedMember = document.getElementById("selectedMember");

/* =====================================================
   LOAD MEMBERS
===================================================== */

async function loadMembers() {

  try {

    membersTable.innerHTML = `
      <tr>
        <td colspan="10">
          Loading members...
        </td>
      </tr>
    `;

    const snapshot = await getDocs(
      query(
        collection(db, "members"),
        orderBy("createdAt", "desc")
      )
    );

    if (snapshot.empty) {

      membersTable.innerHTML = `
        <tr>
          <td colspan="10">
            No members found
          </td>
        </tr>
      `;

      return;
    }

    membersTable.innerHTML = "";

    snapshot.forEach((doc) => {

      const m = doc.data();

      const createdDate =
        m.createdAt?.toDate?.().toLocaleDateString()
        || "-";

      membersTable.innerHTML += `

        <tr>

          <td>
            <img
              src="${m.photoUrl}"
              class="member-photo"
            >
          </td>

          <td>${m.name || "-"}</td>

          <td>${m.phone || "-"}</td>

          <td>${m.nid || "-"}</td>

          <td>${m.savings || 0}</td>

          <td>${m.loanTotal || 0}</td>

          <td>${m.loanRemaining || 0}</td>

          <td>
            <span class="badge active">
              ${m.status || "active"}
            </span>
          </td>

          <td>${createdDate}</td>

          <td>${m.createdBy || "-"}</td>

        </tr>
      `;
    });

  } catch (error) {

    console.error(error);

    membersTable.innerHTML = `
      <tr>
        <td colspan="10">
          Error loading members
        </td>
      </tr>
    `;
  }
}

/* =====================================================
   ADD MEMBER
===================================================== */

memberForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    const saveBtn =
      memberForm.querySelector(".save-btn");

    saveBtn.disabled = true;

    saveBtn.innerHTML = "Saving...";

    /* =====================
       FORM VALUES
    ===================== */

    const name =
      document.getElementById("name")
      .value
      .trim();

    const phone =
      document.getElementById("phone")
      .value
      .trim();

    const nid =
      document.getElementById("nid")
      .value
      .trim();

    const photo =
      document.getElementById("photo")
      .files[0];

    /* =====================
       VALIDATION
    ===================== */

    if (phone.length !== 9) {

      alert("Phone must be 9 digits");

      saveBtn.disabled = false;
      saveBtn.innerHTML = "Save Member";

      return;
    }

    if (nid.length !== 16) {

      alert("NID must be 16 digits");

      saveBtn.disabled = false;
      saveBtn.innerHTML = "Save Member";

      return;
    }

    if (!photo) {

      alert("Please select photo");

      saveBtn.disabled = false;
      saveBtn.innerHTML = "Save Member";

      return;
    }

    /* =====================
       CHECK PHONE DUPLICATE
    ===================== */

    const phoneQuery = query(
      collection(db, "members"),
      where("phone", "==", phone)
    );

    const phoneSnap = await getDocs(phoneQuery);

    if (!phoneSnap.empty) {

      alert("Phone already exists");

      saveBtn.disabled = false;
      saveBtn.innerHTML = "Save Member";

      return;
    }

    /* =====================
       CHECK NID DUPLICATE
    ===================== */

    const nidQuery = query(
      collection(db, "members"),
      where("nid", "==", nid)
    );

    const nidSnap = await getDocs(nidQuery);

    if (!nidSnap.empty) {

      alert("NID already exists");

      saveBtn.disabled = false;
      saveBtn.innerHTML = "Save Member";

      return;
    }

    /* =====================
       UPLOAD PHOTO
    ===================== */

    const fileName =
      Date.now() + "_" + photo.name;

    const storageRef = ref(
      storage,
      "members/" + fileName
    );

    await uploadBytes(storageRef, photo);

    const photoUrl =
      await getDownloadURL(storageRef);

    /* =====================
       USER
    ===================== */

    const user = auth.currentUser;

    /* =====================
       SAVE TO FIRESTORE
    ===================== */

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
        ? user.email || user.uid
        : "admin",

      lastUpdatedAt: serverTimestamp(),

      lastUpdatedBy: user
        ? user.email || user.uid
        : "admin"
    });

    /* =====================
       SUCCESS
    ===================== */

    alert("Member added successfully");

    memberForm.reset();

    closeModal();

    loadMembers();

    saveBtn.disabled = false;

    saveBtn.innerHTML = "Save Member";

  } catch (error) {

    console.error(error);

    alert(error.message);

    const saveBtn =
      memberForm.querySelector(".save-btn");

    saveBtn.disabled = false;

    saveBtn.innerHTML = "Save Member";
  }
});

/* =====================================================
   SEARCH MEMBER
===================================================== */

let membersCache = [];

async function loadSearchMembers() {

  const snapshot = await getDocs(
    collection(db, "members")
  );

  membersCache = [];

  snapshot.forEach((doc) => {

    membersCache.push({
      id: doc.id,
      ...doc.data()
    });
  });
}

searchMember?.addEventListener("input", () => {

  const value =
    searchMember.value.toLowerCase();

  searchResults.innerHTML = "";

  if (!value) return;

  const filtered = membersCache.filter((m) => {

    return (
      m.name?.toLowerCase().includes(value)
      ||
      m.phone?.includes(value)
      ||
      m.nid?.includes(value)
    );
  });

  filtered.forEach((m) => {

    const div = document.createElement("div");

    div.className = "search-item";

    div.innerHTML = `

      <strong>${m.name}</strong>

      <small>
        ${m.phone}
      </small>

    `;

    div.onclick = () => {

      selectedMember.innerHTML = `

        👤 ${m.name}<br>

        📱 ${m.phone}<br>

        🆔 ${m.nid}<br>

        💰 Savings: ${m.savings || 0}

      `;

      searchResults.innerHTML = "";

      searchMember.value = m.name;
    };

    searchResults.appendChild(div);
  });
});

/* =====================================================
   FILTER TABLE
===================================================== */

searchInput?.addEventListener("input", () => {

  const value =
    searchInput.value.toLowerCase();

  const rows =
    membersTable.querySelectorAll("tr");

  rows.forEach((row) => {

    const text =
      row.innerText.toLowerCase();

    row.style.display =
      text.includes(value)
      ? ""
      : "none";
  });
});

/* =====================================================
   START
===================================================== */

loadMembers();

loadSearchMembers();
