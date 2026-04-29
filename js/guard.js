import { auth } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // ✅ ROLE CHECK
  const role = localStorage.getItem("role");

  if (!role) {
    alert("No role found");
    window.location.href = "index.html";
  }

});
