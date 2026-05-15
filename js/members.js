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

/* ======================================================
   ELEMENTS
====================================================== */

const memberForm = document.getElementById("memberForm");
const membersTable = document.getElementById("membersTable");
const searchInput = document.getElementById("searchMember");
const searchResults = document.getElementById("searchResults");
const selectedMember = document.getElementById("selectedMember");
const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");
const modal = document.getElementById("memberModal");

/* ======================================================
   MODAL FUNCTIONS (FIXED)
====================================================== */

function openModal() {
  if (modal) {
    modal.style.display = "flex";
  }
}

function closeModal() {
  if (modal) {
    modal.style.display = "none";
  }
}

/* IMPORTANT */
window.openModal = openModal;
window.closeModal = closeModal;

/* ======================================================
   PHOTO PREVIEW
====================================================== */

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

/* ======================================================
   LOAD MEMBERS
====================================================== */

async function loadMembers() {

  try {

    if (!membersTable) return;

    membersTable.innerHTML = "";

    const snapshot = await getDocs(
      collection(db, "members")
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

    snapshot.forEach((doc) => {

      const m = doc.data();

      const createdDate =
        m.createdAt?.toDate
          ? m.createdAt
              .toDate()
              .toLocaleDateString()
          : "-";

      membersTable.innerHTML += `
        <tr>

          <td>
            <img
              src="${m.photoUrl}"
              class="member-photo"
              style="
                width:50px;
                height:50px;
                object-fit:cover;
                border-radius:50%;
              "
            >
          </td>

          <td>${m.name || "-"}</td>

          <td>${m.phone || "-"}</td>

          <td>${m.nid || "-"}</td>

          <td>${m.savings || 0}</td>

          <td>${m.loanTotal || 0}</td>

          <td>${m.loanRemaining || 0}</td>

          <td>${m.status || "-"}</td>

          <td>${createdDate}</td>

          <td>${m.createdBy || "-"}</td>

        </tr>
      `;
    });

  } catch (error) {

    console.error(
      "Load members error:",
      error
    );

    alert(
      "Failed to load members"
    );
  }
}

/* ======================================================
   SAVE MEMBER
====================================================== */

if (memberForm) {

  memberForm.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      try {

        /* =========================
           FORM VALUES
        ========================= */

        const name =
          document
            .getElementById("name")
            .value
            .trim();

        const phone =
          document
            .getElementById("phone")
            .value
            .trim();

        const nid =
          document
            .getElementById("nid")
            .value
            .trim();

        const photo =
          photoInput.files[0];

        /* =========================
           VALIDATION
        ========================= */

        if (!name) {
          return alert("Enter member name");
        }

        if (!photo) {
          return alert("Select photo");
        }

        if (phone.length !== 9) {
          return alert(
            "Phone must be 9 digits"
          );
        }

        if (nid.length !== 16) {
          return alert(
            "NID must be 16 digits"
          );
        }

        /* =========================
           CHECK LOGIN
        ========================= */

        const user = auth.currentUser;

        if (!user) {
          return alert(
            "Please login first"
          );
        }

        /* =========================
           DUPLICATE PHONE
        ========================= */

        const phoneQuery = query(
          collection(db, "members"),
          where("phone", "==", phone)
        );

        const phoneSnap =
          await getDocs(phoneQuery);

        if (!phoneSnap.empty) {

          return alert(
            "Phone already exists"
          );
        }

        /* =========================
           DUPLICATE NID
        ========================= */

        const nidQuery = query(
          collection(db, "members"),
          where("nid", "==", nid)
        );

        const nidSnap =
          await getDocs(nidQuery);

        if (!nidSnap.empty) {

          return alert(
            "NID already exists"
          );
        }

        /* =========================
           UPLOAD PHOTO
        ========================= */

        const fileName =
          Date.now() +
          "_" +
          photo.name;

        const storageRef = ref(
          storage,
          "members/" + fileName
        );

        await uploadBytes(
          storageRef,
          photo
        );

        const photoUrl =
          await getDownloadURL(
            storageRef
          );

        /* =========================
           SAVE TO FIRESTORE
        ========================= */

        await addDoc(
          collection(db, "members"),
          {
            name,
            phone,
            nid,
            photoUrl,

            savings: 0,

            loanTotal: 0,

            loanRemaining: 0,

            status: "active",

            createdAt:
              serverTimestamp(),

            createdBy:
              user.uid
          }
        );

        /* =========================
           SUCCESS
        ========================= */

        alert(
          "✅ Member saved successfully"
        );

        memberForm.reset();

        photoPreview.src =
          "https://dummyimage.com/120x120/cccccc/000000&text=Photo";

        closeModal();

        loadMembers();

      } catch (err) {

        console.error(
          "Save member error:",
          err
        );

        alert(
          "❌ Failed: " +
          err.message
        );
      }
    }
  );
}

/* ======================================================
   SEARCH MEMBER
====================================================== */

if (searchInput) {

  searchInput.addEventListener(
    "input",
    async () => {

      const value =
        searchInput.value.toLowerCase();

      searchResults.innerHTML = "";

      if (!value) return;

      const snapshot =
        await getDocs(
          collection(db, "members")
        );

      snapshot.forEach((doc) => {

        const m = doc.data();

        const found =

          m.name
            ?.toLowerCase()
            .includes(value)

          ||

          m.phone
            ?.includes(value)

          ||

          m.nid
            ?.includes(value);

        if (found) {

          const div =
            document.createElement("div");

          div.className =
            "search-item";

          div.innerHTML = `
            <strong>
              ${m.name}
            </strong>

            <small>
              📱 ${m.phone}
            </small>
          `;

          div.onclick = () => {

            selectedMember.innerHTML = `
              👤 ${m.name}<br>
              📱 ${m.phone}<br>
              🆔 ${m.nid}<br>
              💰 Savings:
              ${m.savings || 0}
            `;

            searchInput.value =
              m.name;

            searchResults.innerHTML = "";
          };

          searchResults.appendChild(div);
        }
      });
    }
  );
}

/* ======================================================
   INITIAL LOAD
====================================================== */

loadMembers();
