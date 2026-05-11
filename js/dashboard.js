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
   AUTH STATE
========================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "index.html";
    return;
  }

  /* =========================
     GET ROLE FROM FIRESTORE
  ========================= */

  const userRef = doc(db, "users", user.uid);

  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {

    alert("User role not found");
    return;
  }

  const userData = userSnap.data();

  const role = userData.role;

  /* SAVE */
  localStorage.setItem("role", role);

  /* ROLE DISPLAY */

  const roleBox =
    document.getElementById("roleBox");

  if (role === "admin") {

    roleBox.innerHTML = "👑 Admin";

    loadAdminDashboard();

  } else {

    roleBox.innerHTML = "👤 Member";

    loadMemberDashboard(user.uid);

    /* HIDE ADMIN MENUS */

    document.querySelectorAll(".admin-only")
      .forEach(el => {

        el.style.display = "none";
      });
  }
});

/* =========================
   ADMIN DASHBOARD
========================= */

function loadAdminDashboard() {

  let totalMembers = 0;
  let totalSavings = 0;
  let totalLoans = 0;
  let totalRepayments = 0;

  /* MEMBERS */

  onSnapshot(
    collection(db, "members"),

    (snapshot) => {

      totalMembers = snapshot.size;

      document.getElementById("members")
        .innerText = totalMembers;
    }
  );

  /* SAVINGS */

  onSnapshot(
    collection(db, "savings"),

    (snapshot) => {

      totalSavings = 0;

      snapshot.forEach(doc => {

        totalSavings += Number(
          doc.data().amount || 0
        );
      });

      document.getElementById("savings")
        .innerText =

        totalSavings.toLocaleString()
        + " ETB";
    }
  );

  /* LOANS */

  onSnapshot(
    collection(db, "loans"),

    (snapshot) => {

      totalLoans = 0;

      snapshot.forEach(doc => {

        totalLoans += Number(
          doc.data().totalAmount || 0
        );
      });

      document.getElementById("loans")
        .innerText =

        totalLoans.toLocaleString()
        + " ETB";
    }
  );

  /* REPAYMENTS */

  onSnapshot(
    collection(db, "repayments"),

    (snapshot) => {

      totalRepayments = 0;

      snapshot.forEach(doc => {

        totalRepayments += Number(
          doc.data().amount || 0
        );
      });

      document.getElementById("profit")
        .innerText =

        totalRepayments.toLocaleString()
        + " ETB";
    }
  );
}

/* =========================
   MEMBER DASHBOARD
========================= */

function loadMemberDashboard(uid) {

  /* PRIVATE MEMBERS */

  document.getElementById("members")
    .innerText = "Private";

  /* MEMBER SAVINGS */

  onSnapshot(

    query(
      collection(db, "savings"),
      where("memberId", "==", uid)
    ),

    (snapshot) => {

      let total = 0;

      snapshot.forEach(doc => {

        total += Number(
          doc.data().amount || 0
        );
      });

      document.getElementById("savings")
        .innerText =

        total.toLocaleString()
        + " ETB";
    }
  );

  /* MEMBER LOANS */

  onSnapshot(

    query(
      collection(db, "loans"),
      where("memberId", "==", uid)
    ),

    (snapshot) => {

      let total = 0;

      snapshot.forEach(doc => {

        total += Number(
          doc.data().totalAmount || 0
        );
      });

      document.getElementById("loans")
        .innerText =

        total.toLocaleString()
        + " ETB";
    }
  );

  /* MEMBER REPAYMENTS */

  onSnapshot(

    query(
      collection(db, "repayments"),
      where("memberId", "==", uid)
    ),

    (snapshot) => {

      let total = 0;

      snapshot.forEach(doc => {

        total += Number(
          doc.data().amount || 0
        );
      });

      document.getElementById("profit")
        .innerText =

        total.toLocaleString()
        + " ETB";
    }
  );
}

/* =========================
   LOGOUT
========================= */

window.logoutUser = async function () {

  await signOut(auth);

  localStorage.clear();

  window.location.href = "index.html";
};
/* =========================
   SESSION TIMEOUT
========================= */

let sessionTimeout;

/* =========================
   RESET TIMER
========================= */

function resetSessionTimer() {

  clearTimeout(sessionTimeout);

  sessionTimeout = setTimeout(

    async () => {

      alert(
        "Session expired. Please login again."
      );

      await signOut(auth);

      localStorage.clear();

      window.location.href =
        "index.html";

    },

    1000 * 60 * 30
  );
}

/* =========================
   USER ACTIVITY
========================= */

document.addEventListener(
  "DOMContentLoaded",
  resetSessionTimer
);

document.onmousemove =
  resetSessionTimer;

document.onkeypress =
  resetSessionTimer;

document.onclick =
  resetSessionTimer;

document.onscroll =
  resetSessionTimer;
