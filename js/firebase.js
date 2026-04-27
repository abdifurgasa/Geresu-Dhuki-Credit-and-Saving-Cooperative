import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCS-3e_WqGHNycDgvlXVkInaynTnvnplYE",
  authDomain: "geresu-dhuki-sacco.firebaseapp.com",
  projectId: "geresu-dhuki-sacco",
  storageBucket: "geresu-dhuki-sacco.firebasestorage.app",
  messagingSenderId: "944934938425",
  appId: "1:944934938425:web:caef23f2f3bb34c843eae8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
onSnapshot(collection(db,"members"),snap=>{
  document.getElementById("rMembers").innerText = snap.size;
});

onSnapshot(collection(db,"transactions"),snap=>{
  let s=0;
  snap.forEach(d=>{
    let t=d.data();
    if(t.type==="Saving") s+=t.amount;
  });
  document.getElementById("rSavings").innerText = s;
});

onSnapshot(collection(db,"loans"),snap=>{
  let total=0;
  let profit=0;

  snap.forEach(d=>{
    let l=d.data();
    total+=l.total||0;
    profit+=(l.total-l.principal)||0;
  });

  document.getElementById("rLoans").innerText = total;
  document.getElementById("rProfit").innerText = profit;
});
