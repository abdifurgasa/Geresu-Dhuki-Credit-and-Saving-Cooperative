import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   FIREBASE DASHBOARD DATA
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
  } catch (e) {
    console.error(e);
  }
}

loadDashboard();

/* =========================
   SIDEBAR COLLAPSE (WITH MEMORY)
========================= */
const sidebar = document.getElementById("sidebar");

if (localStorage.getItem("sidebar") === "collapsed") {
  sidebar.classList.add("collapsed");
}

window.toggleSidebar = function () {
  sidebar.classList.toggle("collapsed");

  localStorage.setItem(
    "sidebar",
    sidebar.classList.contains("collapsed") ? "collapsed" : "expanded"
  );
};

/* ACTIVE MENU */
document.querySelectorAll(".nav-item").forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add("active");
  }
});
