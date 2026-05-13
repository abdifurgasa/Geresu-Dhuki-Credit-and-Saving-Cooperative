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

  // FORM DATA
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const nid = document.getElementById("nid").value;
  const photo = document.getElementById("photo").files[0];

  try {

    // 🔥 1. UPLOAD PHOTO TO FIREBASE STORAGE
    const photoRef = ref(storage, "members/" + Date.now() + "_" + photo.name);

    await uploadBytes(photoRef, photo);

    const photoUrl = await getDownloadURL(photoRef);

    // 👮 CURRENT USER (WHO CREATED MEMBER)
    const user = auth.currentUser;

    // ☁️ 2. SAVE MEMBER TO FIRESTORE
    await addDoc(collection(db, "members"), {

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
      createdBy: user ? user.uid : null,

      lastUpdatedAt: serverTimestamp(),
      lastUpdatedBy: user ? user.uid : null

    });

    // ✅ SUCCESS
    alert("Member added successfully!");

    document.getElementById("memberForm").reset();

  } catch (error) {
    console.error("Error adding member:", error);
    alert("Failed to add member!");
  }

});
