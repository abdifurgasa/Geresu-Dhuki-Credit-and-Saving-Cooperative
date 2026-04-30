import { db } from "./firebase.js";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   OVERDUE + PENALTY ENGINE
========================= */
export function startOverdueEngine() {

  onSnapshot(collection(db, "loans"), snap => {

    const today = new Date().toISOString().split("T")[0];

    snap.forEach(async loanDoc => {

      const loan = loanDoc.data();
      const ref = doc(db, "loans", loanDoc.id);

      if (loan.status !== "active") return;

      if (loan.dueDate && loan.dueDate < today) {

        if (loan.lastPenaltyApplied === today) return;

        const balance = loan.balance || 0;
        const penaltyRate = loan.penaltyRate || 5;

        const penalty = (balance * penaltyRate) / 100;
        const newBalance = balance + penalty;

        await updateDoc(ref, {
          balance: newBalance,
          penalty: (loan.penalty || 0) + penalty,
          lastPenaltyApplied: today
        });

        await addDoc(collection(db, "transactions"), {
          type: "Penalty",
          member: loan.member,
          amount: penalty,
          description: "Overdue penalty applied",
          date: today
        });

      }

    });

  });

}
