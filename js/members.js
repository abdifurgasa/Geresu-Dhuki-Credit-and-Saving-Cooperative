import { db } from "./firebase.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const membersRef = collection(db, "members");

// ADD MEMBER
document.getElementById("addMember").addEventListener("click", async () => {

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;

  await addDoc(membersRef, {
    name,
    phone,
    createdAt: new Date()
  });

  loadMembers();
});

// LOAD MEMBERS
async function loadMembers() {

  const snap = await getDocs(membersRef);
  const list = document.getElementById("memberList");

  list.innerHTML = "";

  snap.forEach(d => {
    list.innerHTML += `
      <div>
        ${d.data().name} - ${d.data().phone}
        <button onclick="deleteMember('${d.id}')">Delete</button>
      </div>
    `;
  });
}

// DELETE
window.deleteMember = async (id) => {
  await deleteDoc(doc(db, "members", id));
  loadMembers();
};

loadMembers();
