import { db, auth } from "./firebase.js";

import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   GLOBAL STATE
========================= */

let currentRole = null;
let uid = null;

/* =========================
   DASHBOARD LISTENERS (CLEAN CONTROL)
========================= */

let unsubscribers = [];

/* =========================
   AUTH STATE (STABLE VERSION)
========================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  uid = user.uid;

  const userSnap = await getDoc(doc(db, "users", uid));

  if (!userSnap.exists()) {
    alert("User role not found");
    return;
  }

  currentRole = userSnap.data().role;

  document.getElementById("roleBox").innerText =
    currentRole === "admin" ? "👑 Admin" : "👤 Member";

  if (currentRole === "admin") {
    loadAdminDashboard();
  } else {
    loadMemberDashboard(uid);
    hideAdminMenus();
  }

  startSessionTimer();
});

/* =========================
   CLEAN OLD LISTENERS
========================= */

function clearListeners() {
  unsubscribers.forEach(unsub => unsub());
  unsubscribers = [];
}

/* =========================
   HIDE ADMIN UI
========================= */

function hideAdminMenus() {

  document.querySelectorAll(".admin-only")
    .forEach(el => el.style.display = "none");
}

/* =========================
   ADMIN DASHBOARD
========================= */

function loadAdminDashboard() {

  clearListeners();

  /* MEMBERS */
  const unsub1 = onSnapshot(collection(db, "members"), snap => {
    document.getElementById("members").innerText = snap.size;
  });

  /* SAVINGS */
  const unsub2 = onSnapshot(collection(db, "savings"), snap => {

    let total = 0;

    snap.forEach(d => total += Number(d.data().amount || 0));

    document.getElementById("savings").innerText =
      total.toLocaleString() + " ETB";
  });

  /* LOANS */
  const unsub3 = onSnapshot(collection(db, "loans"), snap => {

    let total = 0;

    snap.forEach(d => total += Number(d.data().totalAmount || 0));

    document.getElementById("loans").innerText =
      total.toLocaleString() + " ETB";
  });

  /* REPAYMENTS */
  const unsub4 = onSnapshot(collection(db, "repayments"), snap => {

    let total = 0;

    snap.forEach(d => total += Number(d.data().amount || 0));

    document.getElementById("profit").innerText =
      total.toLocaleString() + " ETB";
  });

  unsubscribers.push(unsub1, unsub2, unsub3, unsub4);
}

/* =========================
   MEMBER DASHBOARD
========================= */

function loadMemberDashboard(uid) {

  clearListeners();

  const unsub1 = onSnapshot(
    query(collection(db, "savings"), where("memberId", "==", uid)),
    snap => {

      let total = 0;

      snap.forEach(d => total += Number(d.data().amount || 0));

      document.getElementById("savings").innerText =
        total.toLocaleString() + " ETB";
    }
  );

  const unsub2 = onSnapshot(
    query(collection(db, "loans"), where("memberId", "==", uid)),
    snap => {

      let total = 0;

      snap.forEach(d => total += Number(d.data().totalAmount || 0));

      document.getElementById("loans").innerText =
        total.toLocaleString() + " ETB";
    }
  );

  const unsub3 = onSnapshot(
    query(collection(db, "repayments"), where("memberId", "==", uid)),
    snap => {

      let total = 0;

      snap.forEach(d => total += Number(d.data().amount || 0));

      document.getElementById("profit").innerText =
        total.toLocaleString() + " ETB";
    }
  );

  unsubscribers.push(unsub1, unsub2, unsub3);
}

/* =========================
   LOGOUT
========================= */

window.logoutUser = async function () {

  await signOut(auth);

  clearListeners();

  localStorage.clear();

  window.location.href = "index.html";
};

/* =========================
   SESSION TIMEOUT (SAFE VERSION)
========================= */

let sessionTimeout;

function startSessionTimer() {

  if (sessionTimeout) clearTimeout(sessionTimeout);

  sessionTimeout = setTimeout(async () => {

    alert("Session expired. Please login again.");

    await signOut(auth);

    clearListeners();

    localStorage.clear();

    window.location.href = "index.html";

  }, 1000 * 60 * 30);
          }
