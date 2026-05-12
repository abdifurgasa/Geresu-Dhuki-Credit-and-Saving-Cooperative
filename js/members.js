import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   ELEMENTS
========================= */

const table = document.getElementById("memberTable");
const searchBox = document.getElementById("searchBox");
const modal = document.getElementById("modal");

/* =========================
   STATE
========================= */

let editId = null;

/* =========================
   OPEN / CLOSE MODAL
========================= */

window.openModal = function () {
  modal.style.display = "flex";
  clearForm();
  editId = null;
};

window.closeModal = function () {
  modal.style.display = "none";
  clearForm();
};

function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("nid").value = "";
  document.getElementById("photo").value = "";
}

/* =========================
   UPLOAD PHOTO (SIMPLIFIED)
========================= */

async function uploadPhoto(file) {

  if (!file) return "";

  // TEMP: convert to base64 (for now)
  return new Promise(resolve => {

    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);

    reader.readAsDataURL(file);
  });
}

/* =========================
   SAVE MEMBER
========================= */

window.saveMember = async function () {

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const nid = document.getElementById("nid").value.trim();
  const photo = document.getElementById("photo").files[0];

  if (!name || !phone || !nid) {
    alert("Fill all fields");
    return;
  }

  const photoURL = await uploadPhoto(photo);

  if (editId) {

    await updateDoc(doc(db, "members", editId), {
      name,
      phone,
      nid,
      photoURL
    });

    alert("Member updated");

  } else {

    await addDoc(collection(db, "members"), {
      name,
      phone,
      nid,
      photoURL,
      status: "active",
      createdAt: serverTimestamp(),

      totalSavings: 0,
      totalLoans: 0,
      remainingLoans: 0
    });

    alert("Member added");
  }

  closeModal();
};

/* =========================
   REAL FINANCIAL CALCULATION
========================= */

async function calculateMemberFinance(memberId) {

  const savingsSnap = await getDocs(collection(db, "savings"));
  const loansSnap = await getDocs(collection(db, "loans"));

  let savings = 0;
  let loans = 0;
  let remaining = 0;

  savingsSnap.forEach(d => {
    const s = d.data();
    if (s.memberId === memberId) {
      savings += Number(s.amount || 0);
    }
  });

  loansSnap.forEach(d => {
    const l = d.data();
    if (l.memberId === memberId) {
      loans += Number(l.totalAmount || 0);
      remaining += Number(l.remaining || 0);
    }
  });

  return { savings, loans, remaining };
}

/* =========================
   LOAD MEMBERS TABLE
========================= */

function loadMembers() {

  onSnapshot(collection(db, "members"), async (snap) => {

    table.innerHTML = "";

    for (const d of snap.docs) {

      const m = d.data();

      const finance = await calculateMemberFinance(d.id);

      table.innerHTML += `
        <tr>

          <td>
            <img src="${m.photoURL || ''}"
                 width="40"
                 height="40"
                 style="border-radius:50%;object-fit:cover;">
            ${m.name}
          </td>

          <td>${m.phone}</td>
          <td>${m.nid}</td>

          <td>${finance.savings} ETB</td>
          <td>${finance.loans} ETB</td>
          <td>${finance.remaining} ETB</td>

          <td>
            <span class="status ${m.status}">
              ${m.status}
            </span>
          </td>

        </tr>
      `;
    }
  });
}

/* =========================
   SEARCH
========================= */

searchBox.addEventListener("input", async function () {

  const value = this.value.toLowerCase();

  const snap = await getDocs(collection(db, "members"));

  table.innerHTML = "";

  snap.forEach(d => {

    const m = d.data();

    if (
      m.name.toLowerCase().includes(value) ||
      m.phone.includes(value) ||
      m.nid.includes(value)
    ) {

      table.innerHTML += `
        <tr>

          <td>
            <img src="${m.photoURL || ''}"
                 width="40"
                 height="40"
                 style="border-radius:50%;">
            ${m.name}
          </td>

          <td>${m.phone}</td>
          <td>${m.nid}</td>

          <td>--</td>
          <td>--</td>
          <td>--</td>

          <td>${m.status}</td>

        </tr>
      `;
    }
  });
});

/* =========================
   INIT
========================= */

loadMembers();
