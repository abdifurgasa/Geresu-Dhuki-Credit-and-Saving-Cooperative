import { db } from "./firebase.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   CHECK USER ROLE
========================= */
export async function getUserRole(uid){

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if(!snap.exists()) return null;

  return snap.data().role;
}

/* =========================
   UI PERMISSION CONTROL
========================= */
export function applyRoleUI(role){

  if(role === "member"){
    document.querySelectorAll(".admin-only").forEach(el=>{
      el.style.display = "none";
    });
  }

  if(role === "cashier"){
    document.querySelectorAll(".admin-only").forEach(el=>{
      el.style.display = "none";
    });
  }

}
