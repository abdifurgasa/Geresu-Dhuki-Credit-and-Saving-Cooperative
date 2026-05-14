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

const table = document.getElementById("membersTable");
const searchInput = document.getElementById("searchMember");
const resultsBox = document.getElementById("searchResults");
const selectedBox = document.getElementById("selectedMember");

let members = [];

/* =========================
   LOAD MEMBERS TABLE
========================= */
async function loadMembers() {

  const snap = await getDocs(collection(db, "members"));

  members = [];

  table.innerHTML = "";

  snap.forEach(doc => {

    const m = doc.data();
    members.push({ id: doc.id, ...m });

    table.innerHTML += `
      <tr>
        <td><img src="${m.photoUrl}" width="40" height="40" style="border-radius:50%"></td>
        <td>${m.name}</td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>
        <td>${m.savings}</td>
        <td>${m.loanTotal}</td>
        <td>${m.loanRemaining}</td>
        <td>${m.status}</td>
        <td>${m.createdAt?.toDate().toLocaleDateString()}</td>
        <td>${m.createdBy}</td>
      </tr>
    `;
  });
}

loadMembers();

/* =========================
   SEARCH
========================= */
searchInput.addEventListener("input", (e) => {

  const val = e.target.value.toLowerCase();

  resultsBox.innerHTML = "";

  if (!val) return;

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(val) ||
    m.phone.includes(val) ||
    m.nid.includes(val)
  );

  filtered.forEach(m => {

    const div = document.createElement("div");

    div.className = "result-item";

    div.innerHTML = `
      👤 ${m.name}<br>
      📱 ${m.phone}
    `;

    div.onclick = () => {

      selectedBox.innerHTML = `
        👤 ${m.name}<br>
        📱 ${m.phone}<br>
        🆔 ${m.nid}<br>
        💰 Savings: ${m.savings}
      `;

      resultsBox.innerHTML = "";
      searchInput.value = "";
    };

    resultsBox.appendChild(div);
  });
});

/* =========================
   DUPLICATE CHECK
========================= */
async function checkDuplicate(phone, nid) {

  const snap = await getDocs(collection(db, "members"));

  let exists = false;

  snap.forEach(doc => {
    const d = doc.data();

    if (d.phone === phone || d.nid === nid) {
      exists = true;
    }
  });

  return exists;
}

/* =========================
   SAVE MEMBER
========================= */
document.getElementById("memberForm").addEventListener("submit", async (e) => {

  e.preventDefault();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const nid = document.getElementById("nid").value;
  const photo = document.getElementById("photo").files[0];

  if (phone.length !== 9) return alert("Phone must be 9 digits");
  if (nid.length !== 16) return alert("NID must be 16 digits");

  if (await checkDuplicate(phone, nid)) {
    return alert("Phone or NID already exists!");
  }

  const photoRef = ref(storage, "members/" + Date.now() + photo.name);
  await uploadBytes(photoRef, photo);
  const photoUrl = await getDownloadURL(photoRef);

  const user = auth.currentUser;

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
    createdBy: user?.uid || "system",

    lastUpdatedAt: serverTimestamp(),
    lastUpdatedBy: user?.uid || "system"

  });

  alert("Member added successfully!");

  document.getElementById("memberForm").reset();

  closeModal();
  loadMembers();
});
