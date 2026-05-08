import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const membersRef = collection(db, "members");
const savingsRef = collection(db, "savings");

let allMembers = [];

/* =========================
   LOAD MEMBERS + SAVINGS TOTAL
========================= */
async function loadMembers() {

  const membersSnap = await getDocs(membersRef);
  const savingsSnap = await getDocs(savingsRef);

  let savingsMap = {};

  savingsSnap.forEach(s => {
    const data = s.data();
    savingsMap[data.memberId] = (savingsMap[data.memberId] || 0) + Number(data.amount);
  });

  allMembers = [];

  membersSnap.forEach(m => {
    allMembers.push({
      id: m.id,
      ...m.data(),
      savings: savingsMap[m.id] || 0
    });
  });

  render(allMembers);
}

loadMembers();

/* =========================
   RENDER TABLE
========================= */
function render(list) {

  let html = "";

  list.forEach(m => {

    html += `
      <tr>
        <td onclick="viewProfile('${m.id}')">${m.fullName}</td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>
        <td>${m.savings} ETB</td>
        <td>
          <span class="status ${m.savings > 0 ? 'active' : 'inactive'}">
            ${m.savings > 0 ? 'Active' : 'New'}
          </span>
        </td>
        <td>
          <button onclick="deleteMember('${m.id}')">Delete</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("membersTable").innerHTML = html;
}

/* =========================
   SEARCH
========================= */
window.searchMembers = function () {

  const val = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allMembers.filter(m =>
    m.fullName.toLowerCase().includes(val) ||
    m.phone.includes(val) ||
    m.nid.includes(val)
  );

  render(filtered);
};

/* =========================
   SAVE MEMBER (VALIDATION)
========================= */
window.saveMember = async function () {

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const nid = document.getElementById("nid").value.trim();

  if (!fullName || !phone || !nid) {
    alert("Required fields missing");
    return;
  }

  if (!/^[0-9]{9}$/.test(phone)) {
    alert("Phone must be 9 digits");
    return;
  }

  if (!/^[0-9]{16}$/.test(nid)) {
    alert("NID must be 16 digits");
    return;
  }

  const nidCheck = await getDocs(query(membersRef, where("nid", "==", nid)));
  if (!nidCheck.empty) return alert("NID already exists");

  const phoneCheck = await getDocs(query(membersRef, where("phone", "==", phone)));
  if (!phoneCheck.empty) return alert("Phone already exists");

  await addDoc(membersRef, {
    fullName,
    email,
    phone,
    nid,
    createdAt: new Date()
  });

  closeForm();
  loadMembers();
};

/* =========================
   DELETE
========================= */
window.deleteMember = async function (id) {
  if (!confirm("Delete this member?")) return;

  await deleteDoc(doc(db, "members", id));
  loadMembers();
};

/* =========================
   PROFILE VIEW
========================= */
window.viewProfile = function (id) {

  const member = allMembers.find(m => m.id === id);

  document.getElementById("profileData").innerHTML = `
    <p><b>Name:</b> ${member.fullName}</p>
    <p><b>Phone:</b> ${member.phone}</p>
    <p><b>NID:</b> ${member.nid}</p>
    <p><b>Total Savings:</b> ${member.savings} ETB</p>
  `;

  document.getElementById("profileModal").style.display = "flex";
};

window.closeProfile = function () {
  document.getElementById("profileModal").style.display = "none";
};

/* =========================
   MODAL CONTROL
========================= */
window.openForm = () => document.getElementById("formModal").style.display = "flex";
window.closeForm = () => document.getElementById("formModal").style.display = "none";
