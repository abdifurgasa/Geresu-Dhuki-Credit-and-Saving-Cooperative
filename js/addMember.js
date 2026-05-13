import { db, storage, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

document.getElementById("memberForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const nid = document.getElementById("nid").value;
  const photo = document.getElementById("photo").files[0];

  try {

    // 🚨 VALIDATION (IMPORTANT)
    if (!photo) {
      alert("Please select a photo");
      return;
    }

    // 🔥 UPLOAD IMAGE
    const photoRef = ref(
      storage,
      "members/" + Date.now() + "_" + photo.name
    );

    await uploadBytes(photoRef, photo);

    const photoUrl = await getDownloadURL(photoRef);

    // 👮 SAFE USER CHECK
    const user = auth.currentUser;

    const memberData = {

      name,
      phone,
      nid,
      photoUrl,

      savings: 0,
      loanTotal: 0,
      loanRemaining: 0,

      status: "active",
      isDeleted: false,

      createdAt: serverTimestamp(),
      createdBy: user ? user.uid : "system",

      lastUpdatedAt: serverTimestamp(),
      lastUpdatedBy: user ? user.uid : "system"
    };

    // ☁️ SAVE TO FIRESTORE
    await addDoc(collection(db, "members"), memberData);

    console.log("MEMBER SAVED:", memberData);

    alert("Member added successfully!");

    document.getElementById("memberForm").reset();

  } catch (error) {
    console.error("ERROR ADDING MEMBER:", error);
    alert(error.message);
  }

});
