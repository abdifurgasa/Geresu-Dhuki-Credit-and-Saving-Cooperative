import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GET WALLET
========================= */

export async function getWallet(memberId) {

  const ref = doc(db, "wallets", memberId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      memberId,
      balance: 0
    };
  }

  return snap.data();
}

/* =========================
   CREATE WALLET
========================= */

export async function createWallet(memberId, memberName) {

  const ref = doc(db, "wallets", memberId);

  await setDoc(ref, {
    memberId,
    memberName,
    balance: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

/* =========================
   SAFE ENSURE WALLET
========================= */

async function ensureWallet(memberId, memberName) {

  const ref = doc(db, "wallets", memberId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await createWallet(memberId, memberName);
    return 0;
  }

  return snap.data().balance || 0;
}

/* =========================
   DEPOSIT (SAVINGS)
========================= */

export async function deposit(memberId, memberName, amount) {

  const ref = doc(db, "wallets", memberId);

  const current = await ensureWallet(memberId, memberName);

  const newBalance = current + amount;

  await updateDoc(ref, {
    balance: newBalance,
    updatedAt: serverTimestamp()
  });

  return newBalance;
}

/* =========================
   REPAYMENT (LOAN PAYMENT)
========================= */

export async function repay(memberId, memberName, amount) {

  const ref = doc(db, "wallets", memberId);

  const current = await ensureWallet(memberId, memberName);

  let newBalance = current - amount;

  if (newBalance < 0) newBalance = 0;

  await updateDoc(ref, {
    balance: newBalance,
    updatedAt: serverTimestamp()
  });

  return newBalance;
}

/* =========================
   LOAN DISBURSEMENT
========================= */

export async function loanCredit(memberId, memberName, amount) {

  const ref = doc(db, "wallets", memberId);

  const current = await ensureWallet(memberId, memberName);

  const newBalance = current + amount;

  await updateDoc(ref, {
    balance: newBalance,
    updatedAt: serverTimestamp()
  });

  return newBalance;
}
