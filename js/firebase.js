/* =========================
   FIREBASE CONFIG
========================= */

// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    getDoc,
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    orderBy, 
    limit,
    Timestamp,
    writeBatch,
    increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

 const firebaseConfig = {
  apiKey: "AIzaSyCS-3e_WqGHNycDgvlXVkInaynTnvnplYE",
  authDomain: "geresu-dhuki-sacco.firebaseapp.com",
  projectId: "geresu-dhuki-sacco",
  storageBucket: "geresu-dhuki-sacco.appspot.com",
  messagingSenderId: "944934938425",
  appId: "1:944934938425:web:caef23f2f3bb34c843eae8"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Collection references
const collections = {
    users: "users",
    members: "members",
    savings: "savings",
    loans: "loans",
    repayments: "repayments",
    withdrawals: "withdrawals",
    settings: "settings",
    activities: "activities"
};

// Export all Firebase services
export { 
    db, 
    auth, 
    storage,
    collections,
    collection, 
    getDocs,
    getDoc,
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    orderBy, 
    limit,
    Timestamp,
    writeBatch,
    increment,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
};
// Users Collection
users/{userId}
{
    uid: "firebase_auth_uid",
    fullName: "John Doe",
    email: "john@sacco.com",
    role: "admin|officer|viewer",
    status: "active|inactive",
    createdAt: timestamp
}

// Members Collection
members/{memberId}
{
    fullName: "Abebe Kebede",
    email: "abebe@sacco.com",
    phone: "0912345678",
    nid: "12345678",
    savingsBalance: 50000,
    status: "active",
    joinDate: timestamp,
    createdBy: "userId",
    createdAt: timestamp
}

// Savings Collection
savings/{savingId}
{
    memberId: "memberId",
    memberName: "Abebe Kebede",
    amount: 5000,
    previousBalance: 45000,
    newBalance: 50000,
    paymentMethod: "cash",
    month: 1,
    year: 2024,
    createdBy: "userId",
    createdAt: timestamp
}

// Loans Collection
loans/{loanId}
{
    memberId: "memberId",
    memberName: "Abebe Kebede",
    principal: 50000,
    interest: 6000,
    totalLoan: 56000,
    remainingLoan: 56000,
    duration: 12,
    monthlyPayment: 4666.67,
    interestRate: 12,
    status: "approved|pending|rejected",
    createdBy: "userId",
    createdAt: timestamp
}

// Repayments Collection
repayments/{repaymentId}
{
    loanId: "loanId",
    memberId: "memberId",
    memberName: "Abebe Kebede",
    amount: 4666.67,
    previousBalance: 56000,
    remainingBalance: 51333.33,
    paymentMethod: "cash",
    month: 1,
    year: 2024,
    createdBy: "userId",
    createdAt: timestamp
}

// Withdrawals Collection
withdrawals/{withdrawalId}
{
    memberId: "memberId",
    memberName: "Abebe Kebede",
    amount: 10000,
    reason: "Emergency",
    previousBalance: 50000,
    newBalance: 40000,
    status: "approved",
    createdBy: "userId",
    createdAt: timestamp
}
