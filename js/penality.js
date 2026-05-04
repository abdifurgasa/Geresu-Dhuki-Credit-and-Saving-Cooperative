import { db } from "./firebase.js";
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const RATE = 0.01;

export async function checkOverdues(){

  const snap = await getDocs(collection(db,"loans"));
  const today = new Date();

  snap.forEach(async d=>{
    const l = d.data();
    if(l.status==="completed") return;

    const last = new Date(l.lastPaymentDate);
    const due = new Date(last);
    due.setDate(due.getDate()+30);

    if(today>due){
      let days = Math.floor((today-due)/(1000*60*60*24));
      let penalty = l.balance * RATE * days;

      await updateDoc(doc(db,"loans",d.id),{
        penalty,
        overdueDays:days
      });
    }
  });
}
