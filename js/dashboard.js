import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => location.href = "index.html");
});

async function load() {

  const m = await getDocs(collection(db, "members"));
  const s = await getDocs(collection(db, "savings"));
  const l = await getDocs(collection(db, "loans"));

  document.getElementById("totalMembers").innerText = m.size;

  let ts = 0;
  s.forEach(d => ts += d.data().amount || 0);

  let tl = 0;
  l.forEach(d => tl += d.data().amount || 0);

  document.getElementById("totalSavings").innerText = ts;
  document.getElementById("totalLoans").innerText = tl;
}

load();
