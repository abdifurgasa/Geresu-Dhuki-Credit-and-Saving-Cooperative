import { db, storage, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

/* =====================================================
   ELEMENTS
===================================================== */

const memberForm =
  document.getElementById("memberForm");

const membersTable =
  document.getElementById("membersTable");

const searchInput =
  document.getElementById("searchMember");

const searchResults =
  document.getElementById("searchResults");

const selectedMember =
  document.getElementById("selectedMember");

const photoInput =
  document.getElementById("photo");

const photoPreview =
  document.getElementById("photoPreview");

const modal =
  document.getElementById("memberModal");

/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal(){

  modal.style.display = "none";
}

/* =====================================================
   PHOTO PREVIEW
===================================================== */

photoInput.addEventListener(
  "change",
  (e)=>{

  const file = e.target.files[0];

  if(!file) return;

  const reader = new FileReader();

  reader.onload = (event)=>{

    photoPreview.src =
      event.target.result;
  };

  reader.readAsDataURL(file);
});

/* =====================================================
   LOAD MEMBERS
===================================================== */

async function loadMembers(){

  try{

    membersTable.innerHTML = "";

    const snapshot =
      await getDocs(
        collection(db,"members")
      );

    if(snapshot.empty){

      membersTable.innerHTML = `
        <tr>
          <td colspan="10">
            No members found
          </td>
        </tr>
      `;

      return;
    }

    snapshot.forEach((doc)=>{

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
            >
          </td>

          <td>${m.name}</td>

          <td>${m.phone}</td>

          <td>${m.nid}</td>

          <td>${m.savings || 0}</td>

          <td>${m.loanTotal || 0}</td>

          <td>${m.loanRemaining || 0}</td>

          <td>
            <span class="badge active">
              ${m.status}
            </span>
          </td>

          <td>${createdDate}</td>

          <td>${m.createdBy || "-"}</td>

        </tr>
      `;
    });

  }

  catch(error){

    console.error(
      "Load members error:",
      error
    );
  }
}

loadMembers();

/* =====================================================
   SAVE MEMBER
===================================================== */

memberForm.addEventListener(
  "submit",
  async(e)=>{

  e.preventDefault();

  try{

    /* =========================
       GET VALUES
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

    if(!photo){

      alert("Select photo");

      return;
    }

    if(phone.length !== 9){

      alert(
        "Phone must be 9 digits"
      );

      return;
    }

    if(nid.length !== 16){

      alert(
        "NID must be 16 digits"
      );

      return;
    }

    /* =========================
       DUPLICATE PHONE
    ========================= */

    const phoneQuery = query(
      collection(db,"members"),
      where("phone","==",phone)
    );

    const phoneSnap =
      await getDocs(phoneQuery);

    if(!phoneSnap.empty){

      alert(
        "Phone already exists"
      );

      return;
    }

    /* =========================
       DUPLICATE NID
    ========================= */

    const nidQuery = query(
      collection(db,"members"),
      where("nid","==",nid)
    );

    const nidSnap =
      await getDocs(nidQuery);

    if(!nidSnap.empty){

      alert(
        "NID already exists"
      );

      return;
    }

    /* =========================
       UPLOAD PHOTO
    ========================= */

    const fileName =
      Date.now() + "_" + photo.name;

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
       CURRENT USER
    ========================= */

    const user =
      auth.currentUser;

    /* =========================
       SAVE TO FIRESTORE
    ========================= */

    await addDoc(
      collection(db,"members"),
      {

        name,
        phone,
        nid,
        photoUrl,

        savings:0,

        loanTotal:0,

        loanRemaining:0,

        status:"active",

        isDeleted:false,

        createdAt:
          serverTimestamp(),

        createdBy:
          user
          ? user.uid
          : "admin",

        lastUpdatedAt:
          serverTimestamp(),

        lastUpdatedBy:
          user
          ? user.uid
          : "admin"
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
      "https://via.placeholder.com/120x120?text=Photo";

    closeModal();

    loadMembers();

  }

  catch(error){

    console.error(
      "Save member error:",
      error
    );

    alert(
      "❌ Failed to save member"
    );
  }
});

/* =====================================================
   SEARCH MEMBER
===================================================== */

searchInput.addEventListener(
  "input",
  async()=>{

  const value =
    searchInput.value
    .toLowerCase();

  searchResults.innerHTML = "";

  if(!value){

    return;
  }

  const snapshot =
    await getDocs(
      collection(db,"members")
    );

  snapshot.forEach((doc)=>{

    const m = doc.data();

    const found =

      m.name
      .toLowerCase()
      .includes(value)

      ||

      m.phone
      .includes(value)

      ||

      m.nid
      .includes(value);

    if(found){

      const div =
        document.createElement("div");

      div.className =
        "search-item";

      div.innerHTML = `

        <strong>${m.name}</strong>

        <small>
          📱 ${m.phone}
        </small>

      `;

      div.onclick = ()=>{

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
});
