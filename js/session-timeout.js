import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   CONFIG
========================= */
const TIMEOUT = 5 * 60 * 1000; 
// 👉 5 minutes (change to 15 * 60 * 1000 for production)

/* =========================
   TIMER
========================= */
let timer;

/* =========================
   RESET TIMER
========================= */
function resetTimer() {

  clearTimeout(timer);

  timer = setTimeout(() => {

    autoLogout();

  }, TIMEOUT);
}

/* =========================
   AUTO LOGOUT
========================= */
async function autoLogout() {

  alert("Session expired. Please login again.");

  try {

    await signOut(auth);

  } catch (e) {
    console.log(e);
  }

  localStorage.clear();

  window.location.href = "index.html";
}

/* =========================
   ACTIVITY EVENTS
========================= */
function setupActivityListeners() {

  ["click", "mousemove", "keypress", "scroll", "touchstart"]

    .forEach(event => {

      window.addEventListener(event, resetTimer);

    });
}

/* =========================
   INIT SESSION SYSTEM
========================= */
function initSession() {

  resetTimer();

  setupActivityListeners();
}

/* =========================
   START
========================= */
initSession();
