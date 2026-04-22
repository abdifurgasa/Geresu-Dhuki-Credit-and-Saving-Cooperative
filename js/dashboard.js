import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "index.html");
});

// load stats
async function loadDashboard() {

  const members = await getDocs(collection(db, "members"));
  const savings = await getDocs(collection(db, "savings"));
  const loans = await getDocs(collection(db, "loans"));

  document.getElementById("totalMembers").innerText = members.size;

  let totalSavings = 0;
  savings.forEach(doc => totalSavings += doc.data().amount || 0);
  document.getElementById("totalSavings").innerText = totalSavings + " ETB";

  let totalLoans = 0;
  loans.forEach(doc => totalLoans += doc.data().amount || 0);
  document.getElementById("totalLoans").innerText = totalLoans + " ETB";
}

loadDashboard();
