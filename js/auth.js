import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.login = async function(){

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try{

    const userCred = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCred.user.uid;

    const userRef = doc(db, "users", uid);

    const snap = await getDoc(userRef);

    if(!snap.exists()){
      alert("User role missing");
      return;
    }

    const data = snap.data();

    localStorage.setItem("role", data.role);
    localStorage.setItem("uid", uid);
    localStorage.setItem("name", data.fullName || "User");

    await updateDoc(userRef, {
      lastLogin: new Date().toISOString()
    });

    window.location.href = "dashboard.html";

  }catch(err){

    console.error(err);
    alert("Login failed");
  }
};

window.logoutUser = async function(){

  await signOut(auth);

  localStorage.clear();

  window.location.href = "index.html";
};

onAuthStateChanged(auth, user => {

  const currentPage = window.location.pathname;

  if(!user && !currentPage.includes("index.html")){
    window.location.href = "index.html";
  }
});
