import { auth } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(auth, (user) => {

  if (!user) {
    // ❌ Not logged in → back to login
    window.location.href = "index.html";
  }

  // ✅ Logged in → stay on dashboard
});
