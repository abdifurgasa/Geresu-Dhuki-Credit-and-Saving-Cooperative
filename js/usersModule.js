import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const table = document.getElementById("usersTable");

export async function createUserAccount(
  name,
  email,
  password,
  role
) {

  try {

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    await addDoc(collection(db, "users"), {

      uid: userCredential.user.uid,
      name,
      email,
      role,
      status: "Active",
      createdAt: serverTimestamp()

    });

    showToast("User created successfully");

  } catch (error) {

    console.error(error);

    alert(error.message);
  }
}

export function loadUsers() {

  onSnapshot(collection(db, "users"), (snapshot) => {

    table.innerHTML = "";

    snapshot.forEach((document) => {

      const data = document.data();

      const tr = document.createElement("tr");

      tr.innerHTML = `

        <td>${data.name || "-"}</td>

}
