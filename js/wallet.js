import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let selectedMember = null;

/* =========================
   SEARCH MEMBER
========================= */
window.searchWalletMember = async function () {

  const keyword = document.getElementById("memberSearch").value.toLowerCase();

  const results = document.getElementById("searchResults");
  results.innerHTML = "";

  const snap = await getDocs(collection(db, "members"));

  snap.forEach(docSnap => {

    const m = docSnap.data();

    if (
      m.name.toLowerCase().includes(keyword) ||
      m.phone?.includes(keyword)
    ) {

      const div = document.createElement("div");
      div.className = "result-item";

      div.innerHTML = `<b>${m.name}</b><br>${m.phone}`;

      div.onclick = () => loadWallet(docSnap.id, m);

      results.appendChild(div);
    }
  });
};

/* =========================
   LOAD WALLET
========================= */
async function loadWallet(memberId, member) {

  selectedMember = { memberId, ...member };

  document.getElementById("selectedMember").innerHTML =
    `👤 ${member.name}`;

  const walletRef = doc(db, "wallets", memberId);
  const walletSnap = await getDoc(walletRef);

  if (walletSnap.exists()) {

    const w = walletSnap.data();

    document.getElementById("walletSavings").innerText =
      w.savingsBalance || 0;

    document.getElementById("walletLoans").innerText =
      w.loanBalance || 0;

    document.getElementById("walletNet").innerText =
      w.netBalance || 0;

  } else {

    document.getElementById("walletSavings").innerText = 0;
    document.getElementById("walletLoans").innerText = 0;
    document.getElementById("walletNet").innerText = 0;
  }

  loadHistory(memberId);
}

/* =========================
   WALLET HISTORY
========================= */
function loadHistory(memberId) {

  const table = document.getElementById("walletHistory");

  const q = query(
    collection(db, "transactions"),
    where("memberId", "==", memberId)
  );

  onSnapshot(q, (snap) => {

    table.innerHTML = "";

    snap.forEach(docSnap => {

      const t = docSnap.data();

      table.innerHTML += `
        <tr>
          <td>${t.type}</td>
          <td>${t.amount}</td>
          <td>${new Date(t.date).toLocaleString()}</td>
        </tr>
      `;
    });

  });
}
