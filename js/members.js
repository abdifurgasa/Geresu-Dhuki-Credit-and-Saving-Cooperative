import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   MEMBER LIST CONTAINER
========================= */
const container = document.getElementById("membersList");

/* =========================
   LOAD MEMBERS FUNCTION
========================= */
async function loadMembers() {

  try {

    console.log("Loading members...");

    const snapshot = await getDocs(collection(db, "members"));

    console.log("TOTAL MEMBERS:", snapshot.size);

    container.innerHTML = "";

    // ❗ IF EMPTY DATABASE
    if (snapshot.empty) {
      container.innerHTML = `
        <div style="padding:20px; color:red;">
          <h3>No members found</h3>
          <p>Check Firestore collection: <b>members</b></p>
        </div>
      `;
      return;
    }

    // ✅ LOOP MEMBERS
    snapshot.forEach((doc) => {

      const m = doc.data();

      console.log("Member:", doc.id, m);

      container.innerHTML += `
        <div class="member-card" style="
          border:1px solid #ddd;
          padding:10px;
          margin:10px;
          border-radius:8px;
          display:flex;
          gap:10px;
          align-items:center;
        ">

          <img src="${m.photoUrl}" 
               width="70" 
               height="70"
               style="border-radius:50%; object-fit:cover;">

          <div>
            <h3>${m.name}</h3>
            <p>📞 ${m.phone}</p>
            <p>🆔 ${m.nid}</p>
            <p>💰 Savings: ${m.savings} ETB</p>

            <a href="member-profile.html?id=${doc.id}">
              View Profile
            </a>
          </div>

        </div>
      `;
    });

  } catch (error) {

    console.error("ERROR loading members:", error);

    container.innerHTML = `
      <div style="color:red; padding:20px;">
        <h3>Firebase Error</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

/* =========================
   INIT
========================= */
loadMembers();
