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

/* =========================
   ELEMENTS
========================= */
const memberForm = document.getElementById("memberForm");
const membersTable = document.getElementById("membersTable");
const searchInput = document.getElementById("searchMember");
const searchResults = document.getElementById("searchResults");
const selectedMember = document.getElementById("selectedMember");
const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");
const modal = document.getElementById("memberModal");

/* =========================
   PHOTO PREVIEW
========================= */
photoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    photoPreview.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

/* =========================
   IMAGE COMPRESS (IMPORTANT FIX)
========================= */
function compressImage(file, maxWidth = 800) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = maxWidth / img.width;

        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg", 0.7); // 🔥 compress 70%
      };
    };

    reader.readAsDataURL(file);
  });
}

/* =========================
   SAVE MEMBER
========================= */
memberForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const nid = document.getElementById("nid").value.trim();
    const photo = photoInput.files[0];

    if (!photo) return alert("Select photo");

    if (phone.length !== 9)
      return alert("Phone must be 9 digits");

    if (nid.length !== 16)
      return alert("NID must be 16 digits");

    /* DUPLICATE CHECK */
    const phoneSnap = await getDocs(
      query(collection(db, "members"), where("phone", "==", phone))
    );
    if (!phoneSnap.empty) return alert("Phone already exists");

    const nidSnap = await getDocs(
      query(collection(db, "members"), where("nid", "==", nid))
    );
    if (!nidSnap.empty) return alert("NID already exists");

    /* 🔥 COMPRESS IMAGE (IMPORTANT FIX) */
    const compressedFile = await compressImage(photo);

    const fileName = Date.now() + ".jpg";
    const storageRef = ref(storage, "members/" + fileName);

    await uploadBytes(storageRef, compressedFile);
    const photoUrl = await getDownloadURL(storageRef);

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

      createdAt: serverTimestamp(),
      createdBy: user ? user.uid : "admin"
    });

    alert("✅ Member saved successfully");

    memberForm.reset();
    photoPreview.src =
      "https://via.placeholder.com/120x120?text=Photo";

    modal.style.display = "none";

    loadMembers();

  } catch (error) {
    console.error(error);
    alert("❌ Save failed: " + error.message);
  }
});

/* =========================
   LOAD MEMBERS
========================= */
async function loadMembers() {
  membersTable.innerHTML = "";

  const snapshot = await getDocs(collection(db, "members"));

  snapshot.forEach((doc) => {
    const m = doc.data();

    membersTable.innerHTML += `
      <tr>
        <td><img src="${m.photoUrl}" class="member-photo"></td>
        <td>${m.name}</td>
        <td>${m.phone}</td>
        <td>${m.nid}</td>
        <td>${m.savings}</td>
        <td>${m.loanTotal}</td>
        <td>${m.loanRemaining}</td>
        <td>${m.status}</td>
        <td>-</td>
        <td>${m.createdBy}</td>
      </tr>
    `;
  });
}

loadMembers();

/* =========================
   SEARCH (CLEAN UI)
========================= */
searchInput.addEventListener("input", async () => {
  const val = searchInput.value.toLowerCase();
  searchResults.innerHTML = "";

  if (!val) return;

  const snapshot = await getDocs(collection(db, "members"));

  snapshot.forEach((doc) => {
    const m = doc.data();

    if (
      m.name.toLowerCase().includes(val) ||
      m.phone.includes(val) ||
      m.nid.includes(val)
    ) {
      const div = document.createElement("div");
      div.className = "search-item";

      div.innerHTML = `
        <strong>${m.name}</strong>
        <small>${m.phone}</small>
      `;

      div.onclick = () => {
        selectedMember.innerHTML = `
          👤 ${m.name}<br>
          📱 ${m.phone}<br>
          🆔 ${m.nid}<br>
          💰 Savings: ${m.savings}
        `;

        searchResults.innerHTML = "";
      };

      searchResults.appendChild(div);
    }
  });
});
