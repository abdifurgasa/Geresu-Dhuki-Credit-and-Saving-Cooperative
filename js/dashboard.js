import { db, auth } from "./firebase.js";
import {
  doc, getDoc,
  collection, getDocs,
  query, where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   MAIN DASHBOARD
========================= */
async function loadDashboard() {

  const uid = auth.currentUser.uid;

  const userSnap =
    await getDoc(doc(db, "users", uid));

  const role = userSnap.data().role;

  if (role === "admin") {
    loadAdmin();
  } else {
    loadMember(uid);
  }
}

/* =========================
   ADMIN DASHBOARD
========================= */
async function loadAdmin() {

  const membersSnap =
    await getDocs(collection(db, "members"));

  const savingsSnap =
    await getDocs(collection(db, "savings"));

  const loansSnap =
    await getDocs(collection(db, "loans"));

  let savings = 0;
  savingsSnap.forEach(d => savings += d.data().amount);

  let loans = 0;
  loansSnap.forEach(d => loans += d.data().amount);

  document.getElementById("members").innerText =
    membersSnap.size;

  document.getElementById("savings").innerText =
    savings + " ETB";

  document.getElementById("loans").innerText =
    loans + " ETB";

  document.getElementById("profit").innerText =
    (savings - loans) + " ETB";
}

/* =========================
   MEMBER DASHBOARD
========================= */
async function loadMember(uid) {

  const savingsQ =
    query(collection(db, "savings"),
      where("uid", "==", uid));

  const loansQ =
    query(collection(db, "loans"),
      where("uid", "==", uid));

  const savingsSnap =
    await getDocs(savingsQ);

  const loansSnap =
    await getDocs(loansQ);

  let savings = 0;
  savingsSnap.forEach(d => savings += d.data().amount);

  let loans = 0;
  loansSnap.forEach(d => loans += d.data().amount);

  document.getElementById("members").innerText =
    "My Account";

  document.getElementById("savings").innerText =
    savings + " ETB";

  document.getElementById("loans").innerText =
    loans + " ETB";

  document.getElementById("profit").innerText =
    (savings - loans) + " ETB";
}

loadDashboard();
