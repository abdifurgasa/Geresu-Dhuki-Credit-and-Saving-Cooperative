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

const totalMembersEl =
  document.getElementById("totalMembers");

const logoutBtn =
  document.getElementById("logoutBtn");

/* ======================================================
   SIDEBAR
====================================================== */

window.toggleSidebar = function () {

  document.getElementById("sidebar")
    .classList.toggle("collapsed");

  document.getElementById("main")
    .classList.toggle("expanded");
};

/* ======================================================
   MODAL
====================================================== */

window.openMemberModal = function () {

  document.getElementById("memberModal")
    .style.display = "flex";
};

window.closeMemberModal = function () {

  document.getElementById("memberModal")
    .style.display = "none";
};

window.onclick = function (e) {

  const modal =
    document.getElementById("memberModal");

  if (e.target === modal) {

    modal.style.display = "none";
  }
};

/* ======================================================
   AUTH
====================================================== */

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "index.html";
    return;
  }

  loadRole(user);
  loadMembers();
});

/* ======================================================
   ROLE
====================================================== */

async function loadRole(user) {

  const snapshot =
    await getDocs(collection(db, "users"));

  snapshot.forEach((docu) => {

    const data = docu.data();

    if (data.email === user.email) {

      roleBox.innerHTML =
        `👤 ${data.name || user.email}
         <br><small>${data.role || "Staff"}</small>`;
    }
  });
}

/* ======================================================
   ADD MEMBER (VALIDATION + DUPLICATE)
====================================================== */

memberForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    const currentUser = auth.currentUser;

    const memberId =
      document.getElementById("memberId").value.trim();

    const fullName =
      document.getElementById("fullName").value.trim();

    const gender =
      document.getElementById("gender").value;

    const phone =
      document.getElementById("phone").value.trim();

    const address =
      document.getElementById("address").value.trim();

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!/^[0-9]{16}$/.test(memberId)) {

      alert("❌ NID must be exactly 16 digits");
      return;
    }

    if (!/^[0-9]{9}$/.test(phone)) {

      alert("❌ Phone must be exactly 9 digits");
      return;
    }

    /* ======================================================
       DUPLICATE CHECK
    ====================================================== */

    const snapshot =
      await getDocs(collection(db, "members"));

    let duplicateNID = false;
    let duplicatePhone = false;

    snapshot.forEach((docu) => {

      const data = docu.data();

      if (data.memberId === memberId) {
        duplicateNID = true;
      }

      if (data.phone === phone) {
        duplicatePhone = true;
      }
    });

    if (duplicateNID) {
      alert("❌ NID already exists");
      return;
    }

    if (duplicatePhone) {
      alert("❌ Phone number already exists");
      return;
    }

    /* ======================================================
       CREATED BY
    ====================================================== */

    let createdBy = currentUser.email;

    const usersSnap =
      await getDocs(collection(db, "users"));

    usersSnap.forEach((docu) => {

      const u = docu.data();

      if (u.email === currentUser.email) {

        createdBy = u.name || u.email;
      }
    });

    /* ======================================================
       SAVE MEMBER
    ====================================================== */

    await addDoc(collection(db, "members"), {

      memberId,
      fullName,
      gender,
      phone,
      address,
      status: "Active",
      createdBy,
      createdDate: new Date().toLocaleString(),
      createdAt: serverTimestamp()
    });

    alert("✅ Member added successfully");

    memberForm.reset();

    closeMemberModal();

  } catch (error) {

    console.error(error);
    alert(error.message);
  }
});

/* ======================================================
   LOAD MEMBERS
====================================================== */

function loadMembers() {

  const q =
    query(collection(db, "members"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {

    membersTable.innerHTML = "";

    totalMembersEl.textContent = snapshot.size;

    snapshot.forEach((docu) => {

      const d = docu.data();

      const tr = document.createElement("tr");

      tr.innerHTML = `

        <td>${d.memberId}</td>
        <td>${d.fullName}</td>
        <td>${d.gender}</td>
        <td>${d.phone}</td>
        <td>${d.address}</td>

        <td>
          <span class="status-badge ${d.status}">
            ${d.status}
          </span>
        </td>

        <td>${d.createdBy}</td>
        <td>${d.createdDate}</td>

        <td>

          <button onclick="editMember('${docu.id}','${d.fullName}')">
            Edit
          </button>

          <button onclick="toggleStatus('${docu.id}','${d.status}')">
            ${d.status === "Active" ? "Suspend" : "Activate"}
          </button>

          <button onclick="deleteMember('${docu.id}')">
            Delete
          </button>

        </td>
      `;

      membersTable.appendChild(tr);
    });
  });
}

/* ======================================================
   EDIT
====================================================== */

window.editMember = async function (id, name) {

  const newName = prompt("Edit Name", name);

  if (!newName) return;

  await updateDoc(doc(db, "members", id), {
    fullName: newName
  });

  alert("Updated");
};

/* ======================================================
   STATUS
====================================================== */

window.toggleStatus = async function (id, status) {

  const newStatus =
    status === "Active" ? "Suspended" : "Active";

  await updateDoc(doc(db, "members", id), {
    status: newStatus
  });

  alert("Status updated");
};

/* ======================================================
   DELETE
====================================================== */

window.deleteMember = async function (id) {

  if (!confirm("Delete member?")) return;

  await deleteDoc(doc(db, "members", id));

  alert("Deleted");
};

/* ======================================================
   SEARCH
====================================================== */

window.searchMembers = function () {

  const value =
    document.getElementById("searchInput").value.toLowerCase();

  document.querySelectorAll("#membersTable tr")
    .forEach(row => {

      row.style.display =
        row.innerText.toLowerCase().includes(value)
          ? ""
          : "none";
    });
};

/* ======================================================
   CSV EXPORT
====================================================== */

window.exportMembersCSV = function () {

  let csv =
    "NID,Name,Gender,Phone,Address,Status,CreatedBy,Date\n";

  document.querySelectorAll("#membersTable tr")
    .forEach(row => {

      const cols = row.querySelectorAll("td");

      if (cols.length) {

        csv += `
${cols[0].innerText},
${cols[1].innerText},
${cols[2].innerText},
${cols[3].innerText},
${cols[4].innerText},
${cols[5].innerText},
${cols[6].innerText},
${cols[7].innerText}
`;
      }
    });

  const blob = new Blob([csv], { type: "text/csv" });

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "members.csv";
  link.click();
};

/* ======================================================
   LOGOUT
====================================================== */

logoutBtn.addEventListener("click", async () => {

  if (!confirm("Logout?")) return;

  await signOut(auth);

  window.location.href = "index.html";
});
