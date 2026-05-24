import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ======================================================
   ELEMENTS
====================================================== */

const membersTable =
  document.getElementById("membersTable");

const memberForm =
  document.getElementById("memberForm");

const roleBox =
  document.getElementById("roleBox");

const logoutBtn =
  document.getElementById("logoutBtn");

const totalMembersEl =
  document.getElementById("totalMembers");

/* ======================================================
   SIDEBAR TOGGLE
====================================================== */

window.toggleSidebar = function () {

  document
    .getElementById("sidebar")
    .classList.toggle("collapsed");

  document
    .getElementById("main")
    .classList.toggle("expanded");
};

/* ======================================================
   AUTH STATE
====================================================== */

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href =
      "index.html";

    return;
  }

  await loadRole(user);

  loadMembers();
});

/* ======================================================
   LOAD ROLE
====================================================== */

async function loadRole(user) {

  try {

    const snapshot =
      await getDocs(
        collection(db, "users")
      );

    let found = false;

    snapshot.forEach((document) => {

      const data =
        document.data();

      if (data.email === user.email) {

        found = true;

        roleBox.innerHTML = `
          👤 ${data.name || "User"}
          <br>
          <small>${data.role || "Staff"}</small>
        `;

        // HIDE ADMIN MODULES
        if (data.role !== "Admin") {

          document
            .querySelectorAll(".admin-only")
            .forEach((el) => {

              el.style.display = "none";

            });
        }
      }
    });

    if (!found) {

      roleBox.innerHTML = `
        👤 ${user.email}
        <br>
        <small>Staff</small>
      `;
    }

  } catch (error) {

    console.error(error);
  }
}

/* ======================================================
   ADD MEMBER
====================================================== */

memberForm.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    try {

      const currentUser =
        auth.currentUser;

      // FORM VALUES
      const memberId =
        document
          .getElementById("memberId")
          .value
          .trim();

      const fullName =
        document
          .getElementById("fullName")
          .value
          .trim();

      const gender =
        document
          .getElementById("gender")
          .value;

      const phone =
        document
          .getElementById("phone")
          .value
          .trim();

      const address =
        document
          .getElementById("address")
          .value
          .trim();

      /* ======================================================
         VALIDATION
      ====================================================== */

      // PHONE ONLY NUMBERS
      const phoneRegex =
        /^[0-9]+$/;

      if (!phoneRegex.test(phone)) {

        showToast(
          "Phone must contain only numbers"
        );

        return;
      }

      // PHONE EXACTLY 9 DIGITS
      if (phone.length !== 9) {

        showToast(
          "Phone number must be exactly 9 digits"
        );

        return;
      }

      // NID ONLY NUMBERS
      const nidRegex =
        /^[0-9]+$/;

      if (!nidRegex.test(memberId)) {

        showToast(
          "NID must contain only numbers"
        );

        return;
      }

      // NID EXACTLY 16 DIGITS
      if (memberId.length !== 16) {

        showToast(
          "NID must be exactly 16 digits"
        );

        return;
      }

      /* ======================================================
         CHECK DUPLICATES
      ====================================================== */

      const membersSnapshot =
        await getDocs(
          collection(db, "members")
        );

      let duplicatePhone =
        false;

      let duplicateNID =
        false;

      membersSnapshot.forEach((document) => {

        const data =
          document.data();

        // DUPLICATE PHONE
        if (data.phone === phone) {

          duplicatePhone = true;
        }

        // DUPLICATE NID
        if (
          data.memberId ===
          memberId
        ) {

          duplicateNID = true;
        }
      });

      if (duplicatePhone) {

        showToast(
          "Phone number already exists"
        );

        return;
      }

      if (duplicateNID) {

        showToast(
          "NID already exists"
        );

        return;
      }

      /* ======================================================
         FIND USER NAME
      ====================================================== */

      let createdBy =
        currentUser.email;

      const usersSnapshot =
        await getDocs(
          collection(db, "users")
        );

      usersSnapshot.forEach((document) => {

        const userData =
          document.data();

        if (
          userData.email ===
          currentUser.email
        ) {

          createdBy =
            userData.name ||
            currentUser.email;
        }
      });

      /* ======================================================
         MEMBER DATA
      ====================================================== */

      const memberData = {

        memberId: memberId,

        fullName: fullName,

        gender: gender,

        phone: phone,

        address: address,

        status: "Active",

        createdBy: createdBy,

        createdDate:
          new Date().toLocaleString(),

        createdAt:
          serverTimestamp()
      };

      /* ======================================================
         SAVE TO FIREBASE
      ====================================================== */

      await addDoc(
        collection(db, "members"),
        memberData
      );

      showToast(
        "Member added successfully"
      );

      memberForm.reset();

    } catch (error) {

      console.error(error);

      alert(error.message);
    }
  }
);

/* ======================================================
   LOAD MEMBERS
====================================================== */

function loadMembers() {

  const q = query(
    collection(db, "members"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {

    membersTable.innerHTML = "";

    totalMembersEl.textContent =
      snapshot.size;

    snapshot.forEach((document) => {

      const data =
        document.data();

      const tr =
        document.createElement("tr");

      tr.innerHTML = `

        <td>
          ${data.memberId || "-"}
        </td>

        <td>
          ${data.fullName || "-"}
        </td>

        <td>
          ${data.gender || "-"}
        </td>

        <td>
          ${data.phone || "-"}
        </td>

        <td>
          ${data.address || "-"}
        </td>

        <td>

          <span class="
            status-badge
            ${data.status}
          ">

            ${data.status}

          </span>

        </td>

        <td>
          ${data.createdBy || "-"}
        </td>

        <td>
          ${data.createdDate || "-"}
        </td>

        <td>

          <div class="action-buttons">

            <!-- EDIT -->
            <button
              class="edit-btn"
              onclick="editMember(
                '${document.id}',
                '${data.fullName}',
                '${data.phone}',
                '${data.address}'
              )"
            >
              Edit
            </button>

            <!-- STATUS -->
            <button
              class="suspend-btn"
              onclick="toggleStatus(
                '${document.id}',
                '${data.status}'
              )"
            >
              ${
                data.status === "Active"
                  ? "Suspend"
                  : "Activate"
              }
            </button>

            <!-- DELETE -->
            <button
              class="delete-btn"
              onclick="deleteMember(
                '${document.id}'
              )"
            >
              Delete
            </button>

          </div>

        </td>
      `;

      membersTable.appendChild(tr);
    });
  });
}

/* ======================================================
   EDIT MEMBER
====================================================== */

window.editMember = async function (
  id,
  fullName,
  phone,
  address
) {

  try {

    const newName =
      prompt(
        "Edit Full Name",
        fullName
      );

    if (!newName) return;

    const newPhone =
      prompt(
        "Edit Phone Number",
        phone
      );

    if (!newPhone) return;

    // PHONE VALIDATION
    const phoneRegex =
      /^[0-9]+$/;

    if (!phoneRegex.test(newPhone)) {

      showToast(
        "Phone must contain only numbers"
      );

      return;
    }

    if (newPhone.length !== 9) {

      showToast(
        "Phone number must be exactly 9 digits"
      );

      return;
    }

    const newAddress =
      prompt(
        "Edit Address",
        address
      );

    await updateDoc(
      doc(db, "members", id),
      {

        fullName: newName,

        phone: newPhone,

        address: newAddress
      }
    );

    showToast(
      "Member updated successfully"
    );

  } catch (error) {

    console.error(error);
  }
};

/* ======================================================
   TOGGLE STATUS
====================================================== */

window.toggleStatus =
  async function (
    id,
    currentStatus
  ) {

  try {

    const newStatus =
      currentStatus === "Active"
        ? "Suspended"
        : "Active";

    await updateDoc(
      doc(db, "members", id),
      {

        status: newStatus
      }
    );

    showToast(
      `Member ${newStatus}`
    );

  } catch (error) {

    console.error(error);
  }
};

/* ======================================================
   DELETE MEMBER
====================================================== */

window.deleteMember =
  async function (id) {

  const confirmDelete =
    confirm(
      "Delete this member?"
    );

  if (!confirmDelete) return;

  try {

    await deleteDoc(
      doc(db, "members", id)
    );

    showToast(
      "Member deleted successfully"
    );

  } catch (error) {

    console.error(error);
  }
};

/* ======================================================
   SEARCH MEMBERS
====================================================== */

window.searchMembers =
  function () {

  const input =
    document.getElementById(
      "searchInput"
    );

  const filter =
    input.value.toLowerCase();

  const rows =
    membersTable.querySelectorAll(
      "tr"
    );

  rows.forEach((row) => {

    const text =
      row.innerText.toLowerCase();

    row.style.display =
      text.includes(filter)
        ? ""
        : "none";
  });
};

/* ======================================================
   EXPORT CSV
====================================================== */

window.exportMembersCSV =
  function () {

  let csv =
`NID,Full Name,Gender,Phone,Address,Status,Created By,Created Date\n`;

  const rows =
    membersTable.querySelectorAll(
      "tr"
    );

  rows.forEach((row) => {

    const cols =
      row.querySelectorAll("td");

    if (cols.length > 0) {

      csv +=
`${cols[0].innerText},
${cols[1].innerText},
${cols[2].innerText},
${cols[3].innerText},
${cols[4].innerText},
${cols[5].innerText},
${cols[6].innerText},
${cols[7].innerText}\n`;
    }
  });

  const blob =
    new Blob([csv], {
      type: "text/csv"
    });

  const link =
    document.createElement("a");

  link.href =
    URL.createObjectURL(blob);

  link.download =
    "members.csv";

  link.click();

  showToast(
    "CSV exported successfully"
  );
};

/* ======================================================
   TOAST
====================================================== */

function showToast(message) {

  const toast =
    document.createElement("div");

  toast.className =
    "toast";

  toast.innerText =
    message;

  document.body.appendChild(
    toast
  );

  setTimeout(() => {

    toast.remove();

  }, 3000);
}

/* ======================================================
   LOGOUT
====================================================== */

logoutBtn.addEventListener(
  "click",
  async () => {

    const confirmLogout =
      confirm(
        "Logout from system?"
      );

    if (!confirmLogout) return;

    try {

      await signOut(auth);

      window.location.href =
        "index.html";

    } catch (error) {

      console.error(error);
    }
  }
);

/* ======================================================
   READY
====================================================== */

console.log(
  "GERESU DHUKI SACCO Members Module Loaded"
);
