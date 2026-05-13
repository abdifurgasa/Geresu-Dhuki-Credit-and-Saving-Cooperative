import { db } from "./firebase.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// GET ID FROM URL
const urlParams = new URLSearchParams(window.location.search);
const memberId = urlParams.get("id");

const container = document.getElementById("profile");

async function loadProfile() {

  try {

    if (!memberId) {
      container.innerHTML = "No member ID found!";
      return;
    }

    const ref = doc(db, "members", memberId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      container.innerHTML = "Member not found!";
      return;
    }

    const m = snap.data();

    container.innerHTML = `
      <div class="profile-card">

        <img src="${m.photoUrl}" width="120" height="120">

        <h2>${m.name}</h2>

        <p>📞 Phone: ${m.phone}</p>
        <p>🆔 NID: ${m.nid}</p>

        <hr>

        <h3>💰 Financial Info</h3>
        <p>Savings: ${m.savings} ETB</p>
        <p>Loan Total: ${m.loanTotal} ETB</p>
        <p>Loan Remaining: ${m.loanRemaining} ETB</p>

        <hr>

        <h3>📊 Account Status</h3>
        <p>Status: ${m.status}</p>
        <p>Created At: ${m.createdAt?.toDate?.() || "N/A"}</p>
        <p>Created By: ${m.createdBy || "Unknown"}</p>

        <p>Last Updated By: ${m.lastUpdatedBy || "N/A"}</p>

      </div>
    `;

  } catch (error) {
    console.error("Error loading profile:", error);
    container.innerHTML = "Error loading profile.";
  }

}

loadProfile();
