import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   ROLE CONTROL
========================= */

const role = localStorage.getItem("role");

if (role !== "admin" && role !== "teller") {
  alert("Access denied");
  window.location.href = "dashboard.html";
}
