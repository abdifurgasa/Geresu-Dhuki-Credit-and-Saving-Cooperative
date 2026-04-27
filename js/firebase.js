import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCS-3e_WqGHNycDgvlXVkInaynTnvnplYE",
  authDomain: "geresu-dhuki-sacco.firebaseapp.com",
  projectId: "geresu-dhuki-sacco",
  storageBucket: "geresu-dhuki-sacco.firebasestorage.app",
  messagingSenderId: "944934938425",
  appId: "1:944934938425:web:caef23f2f3bb34c843eae8"
};

// INIT FIREBASE
const app = initializeApp(firebaseConfig);

// SERVICES
export const auth = getAuth(app);
export const db = getFirestore(app);

//
// 🔥 REAL-TIME MEMBERS COUNT (SAFE VERSION)
//
export function listenMembersCount(elementId = "rMembers") {
  const el = document.getElementById(elementId);

  if (!el) {
    console.warn("Element not found:", elementId);
    return;
  }

  onSnapshot(collection(db, "members"), (snap) => {
    el.innerText = snap.size;
  });
}
