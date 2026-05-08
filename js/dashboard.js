import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   LOAD DASHBOARD DATA
========================= */
async function loadDashboard() {
  try {
    const ref = doc(db, "stats", "dashboard");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();

      document.getElementById("members").innerText = data.members || 0;
      document.getElementById("savings").innerText = (data.savings || 0) + " ETB";
      document.getElementById("loans").innerText = (data.loans || 0) + " ETB";
      document.getElementById("profit").innerText = (data.profit || 0) + " ETB";
    }
  } catch (err) {
    console.error(err);
  }
}

loadDashboard();

/* =========================
   SIDEBAR COLLAPSE
========================= */
window.toggleSidebar = function () {
  document.querySelector(".sidebar").classList.toggle("collapsed");
};
