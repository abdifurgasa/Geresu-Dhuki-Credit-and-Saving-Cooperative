import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GET WALLET BALANCE
========================= */
export async function getWallet(memberId) {
  const ref = doc(db, "wallets", memberId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data();
  }

  return {
    memberId,
    balance: 0
  };
}

/* =========================
   CREATE WALLET (IF NOT EXISTS)
========================= */
export async function createWallet(memberId, memberName) {
  await setDoc(doc(db, "wallets", memberId), {
    memberId,
    memberName,
    balance: 0,
    createdAt: serverTimestamp()
  });
}

/* =========================
   DEPOSIT (SAVINGS)
========================= */
export async function deposit(memberId, memberName, amount) {

  const walletRef = doc(db, "wallets", memberId);
  const snap = await getDoc(walletRef);

  if (!snap.exists()) {
    await createWallet(memberId, memberName);
  }

  const current = (snap.data()?.balance || 0);

  await updateDoc(walletRef, {
    balance: current + amount,
    updatedAt: serverTimestamp()
  });

  return current + amount;
}

/* =========================
   REPAYMENT (LOAN PAYMENT)
========================= */
export async function repay(memberId, memberName, amount) {

  const walletRef = doc(db, "wallets", memberId);
  const snap = await getDoc(walletRef);

  if (!snap.exists()) {
    await createWallet(memberId, memberName);
  }

  const current = (snap.data()?.balance || 0);

  let newBalance = current - amount;

  if (newBalance < 0) newBalance = 0;

  await updateDoc(walletRef, {
    balance: newBalance,
    updatedAt: serverTimestamp()
  });

  return newBalance;
}
