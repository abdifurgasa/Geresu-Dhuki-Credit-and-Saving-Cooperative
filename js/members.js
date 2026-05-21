import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let membersCache = [];
let currentPage = 1;
const perPage = 5;

/* =========================
   MODAL
========================= */

window.openModal = () => {
  document.getElementById("memberModal").style.display = "flex";
};

window.closeModal = () => {
  document.getElementById("memberModal").style.display = "none";
};

/* =========================
   SAVE MEMBER
========================= */

document.getElementById("memberForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const nid = document.getElementById("nid").value;

  await addDoc(collection(db, "members"), {
    name,
    phone,
    nid,
    savings: 0,
    loanTotal: 0,
    status: "active",
    createdAt: serverTimestamp(),
    createdBy: auth.currentUser?.email || "admin"
  });

  closeModal();
});

/* =========================
   REAL TIME LOAD
========================= */

onSnapshot(collection(db, "members"), (snapshot) => {

  membersCache = [];

  snapshot.forEach((docSnap) => {
    membersCache.push({ id: docSnap.id, ...docSnap.data() });
  });

  renderTable();
});

/* =========================
   TABLE RENDER
========================= */

function renderTable() {

  const table = document.getElementById("membersTable");
  table.innerHTML = "";

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  const pageItems = membersCache.slice(start, end);

  pageItems.forEach(m => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${m.name}</td>
      <td>${m.phone}</td>
      <td>${m.nid}</td>
      <td>${m.savings} ETB</td>
      <td>${m.loanTotal} ETB</td>

      <td>
        <span class="badge ${m.status}">
          ${m.status}
        </span>
      </td>

      <td>${m.createdBy}</td>

      <td>
        <button onclick="editMember('${m.id}')">✏</button>
        <button onclick="deleteMember('${m.id}')">🗑</button>
      </td>
    `;

    /* CLICK ROW → PROFILE */
    row.onclick = () => {
      alert(`
Member Profile:
Name: ${m.name}
Phone: ${m.phone}
NID: ${m.nid}
Savings: ${m.savings}
Loans: ${m.loanTotal}
`);
    };

    table.appendChild(row);
  });
}

/* =========================
   DELETE
========================= */

window.deleteMember = async (id) => {
  await deleteDoc(doc(db, "members", id));
};

/* =========================
   EDIT (INLINE SIMPLE)
========================= */

window.editMember = async (id) => {

  const newName = prompt("New name?");
  if (!newName) return;

  await updateDoc(doc(db, "members", id), {
    name: newName
  });
};

/* =========================
   PAGINATION
========================= */

window.nextPage = () => {
  if ((currentPage * perPage) < membersCache.length) {
    currentPage++;
    renderTable();
  }
};

window.prevPage = () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
};

/* =========================
   SEARCH
========================= */

document.getElementById("searchInput").addEventListener("input", (e) => {

  const value = e.target.value.toLowerCase();

  const filtered = membersCache.filter(m =>
    m.name.toLowerCase().includes(value) ||
    m.phone.includes(value) ||
    m.nid.includes(value)
  );

  const table = document.getElementById("membersTable");
  table.innerHTML = "";

  filtered.forEach(m => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${m.name}</td>
      <td>${m.phone}</td>
      <td>${m.nid}</td>
      <td>${m.savings} ETB</td>
      <td>${m.loanTotal} ETB</td>
      <td><span class="badge ${m.status}">${m.status}</span></td>
      <td>${m.createdBy}</td>
      <td>⚙</td>
    `;

    table.appendChild(row);
  });

});
