import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  updateDoc,
  doc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function applyPenalties() {

  const snapshot = await getDocs(
    collection(db, "loans")
  );

  const today = new Date();

  snapshot.forEach(async (loanDoc) => {

    const loan = loanDoc.data();

    if (loan.status !== "active") return;

    const dueDate = new Date(loan.nextDueDate);

    if (today > dueDate) {

      const penalty = Number(loan.penalty || 0) + 100;

      const remaining = Number(loan.remaining || 0) + 100;

      await updateDoc(doc(db, "loans", loanDoc.id), {

        penalty,
        remaining

      });
    }
  });
}

applyPenalties();
