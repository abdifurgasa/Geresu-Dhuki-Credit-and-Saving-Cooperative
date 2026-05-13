import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("membersList");

  async function loadMembers() {

    try {

      const snapshot = await getDocs(collection(db, "members"));

      container.innerHTML = "";

      if (snapshot.empty) {
        container.innerHTML = "<p>No members found</p>";
        return;
      }

      snapshot.forEach((doc) => {

        const m = doc.data();

        container.innerHTML += `
          <div class="member-card">

            <img src="${m.photoUrl}" alt="photo" width="80" height="80">

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
          <hr>
        `;

      });

    } catch (error) {
      console.error("Error loading members:", error);
      container.innerHTML = "Failed to load members.";
    }

  }

  loadMembers();

});
