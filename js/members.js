import {
  db,
  storage,
  auth
} from "./firebase.js";

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
   TABLE BODY
========================= */
const table = document.getElementById("membersTable");

/* =========================
   LOAD MEMBERS
========================= */
async function loadMembers() {

  table.innerHTML = "";

  try {

    const snapshot = await getDocs(
      collection(db, "members")
    );

    console.log("TOTAL MEMBERS:", snapshot.size);

    /* NO MEMBERS */
    if (snapshot.empty) {

      table.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center;padding:20px;">
            No members found
          </td>
        </tr>
      `;

      return;
    }

    /* LOOP MEMBERS */
    snapshot.forEach((doc) => {

      const m = doc.data();

      table.innerHTML += `

        <tr>

          <!-- PHOTO -->
          <td>
            <img
              src="${m.photoUrl || 'https://via.placeholder.com/50'}"
              class="member-photo"
            >
          </td>

          <!-- NAME -->
          <td>${m.name || "-"}</td>

          <!-- PHONE -->
          <td>${m.phone || "-"}</td>

          <!-- NID -->
          <td>${m.nid || "-"}</td>

          <!-- SAVINGS -->
          <td>${m.savings || 0} ETB</td>

          <!-- LOAN TOTAL -->
          <td>${m.loanTotal || 0} ETB</td>

          <!-- REMAINING -->
          <td>${m.loanRemaining || 0} ETB</td>

          <!-- STATUS -->
          <td>
            <span class="badge active">
              ${m.status || "active"}
            </span>
          </td>

          <!-- CREATED DATE -->
          <td>
            ${
              m.createdAt
              ? new Date(
                  m.createdAt.seconds * 1000
                ).toLocaleDateString()
              : "-"
            }
          </td>

          <!-- CREATED BY -->
          <td>${m.createdBy || "-"}</td>

        </tr>

      `;
    });

  } catch (error) {

    console.error("ERROR LOADING MEMBERS:", error);

    table.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center;color:red;padding:20px;">
          Failed to load members
        </td>
      </tr>
    `;
  }
}

/* =========================
   INITIAL LOAD
========================= */
loadMembers();

/* =========================
   ADD MEMBER
========================= */
document
.getElementById("memberForm")
.addEventListener("submit", async (e) => {

  e.preventDefault();

  /* =========================
     FORM VALUES
  ========================= */
  const name =
    document.getElementById("name").value.trim();

  const phone =
    document.getElementById("phone").value.trim();

  const nid =
    document.getElementById("nid").value.trim();

  const photo =
    document.getElementById("photo").files[0];

  /* =========================
     VALIDATION
  ========================= */

  /* PHONE MUST BE 9 DIGITS */
  const phoneRegex = /^[0-9]{9}$/;

  if (!phoneRegex.test(phone)) {

    alert("Phone number must be exactly 9 digits");

    return;
  }

  /* NID MUST BE 16 DIGITS */
  const nidRegex = /^[0-9]{16}$/;

  if (!nidRegex.test(nid)) {

    alert("NID must be exactly 16 digits");

    return;
  }

  try {

    /* =========================
       CHECK DUPLICATE PHONE
    ========================= */
    const phoneQuery = query(
      collection(db, "members"),
      where("phone", "==", phone)
    );

    const phoneSnapshot =
      await getDocs(phoneQuery);

    if (!phoneSnapshot.empty) {

      alert("Phone number already exists");

      return;
    }

    /* =========================
       CHECK DUPLICATE NID
    ========================= */
    const nidQuery = query(
      collection(db, "members"),
      where("nid", "==", nid)
    );

    const nidSnapshot =
      await getDocs(nidQuery);

    if (!nidSnapshot.empty) {

      alert("NID already exists");

      return;
    }

    /* =========================
       UPLOAD PHOTO
    ========================= */
    let photoUrl = "";

    if (photo) {

      const photoRef = ref(
        storage,
        "members/" +
        Date.now() +
        "_" +
        photo.name
      );

      await uploadBytes(photoRef, photo);

      photoUrl =
        await getDownloadURL(photoRef);
    }

    /* CURRENT USER */
    const user = auth.currentUser;

    /* =========================
       SAVE MEMBER
    ========================= */
    await addDoc(
      collection(db, "members"),
      {

        name,
        phone,
        nid,
        photoUrl,

        /* FINANCIAL */
        savings: 0,

        loanTotal: 0,

        loanRemaining: 0,

        /* STATUS */
        status: "active",

        isDeleted: false,

        /* TRACKING */
        createdAt: serverTimestamp(),

        createdBy:
          user ? user.uid : "unknown",

        lastUpdatedAt: serverTimestamp(),

        lastUpdatedBy:
          user ? user.uid : "unknown"

      }
    );

    /* SUCCESS */
    alert("Member added successfully!");

    /* RESET FORM */
    document
      .getElementById("memberForm")
      .reset();

    /* CLOSE MODAL */
    document
      .getElementById("memberModal")
      .style.display = "none";

    /* RELOAD MEMBERS */
    loadMembers();

  } catch (error) {

    console.error(
      "ERROR ADDING MEMBER:",
      error
    );

    alert("Failed to add member");
  }

});

/* =========================
   SEARCH MEMBER
========================= */
document
.getElementById("searchInput")
.addEventListener("keyup", function () {

  const value =
    this.value.toLowerCase();

  const rows =
    document.querySelectorAll(
      "#membersTable tr"
    );

  rows.forEach((row) => {

    row.style.display =
      row.innerText
        .toLowerCase()
        .includes(value)

      ? ""

      : "none";

  });

});
