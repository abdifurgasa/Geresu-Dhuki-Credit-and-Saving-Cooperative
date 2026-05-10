import { db, auth } from "./firebase.js";

import {
  addDoc,
  collection,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   AUDIT LOGGER
========================= */
export async function logAction(action, details) {

  await addDoc(collection(db, "auditLogs"), {

    user: auth.currentUser.email,

    uid: auth.currentUser.uid,

    action,

    details,

    timestamp: Timestamp.now()
  });
}
