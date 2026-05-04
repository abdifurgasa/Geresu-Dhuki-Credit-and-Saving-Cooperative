import { db } from "./firebase.js";
import {
  collection, getDocs, addDoc, doc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ================= UPDATE SCHEDULE ================= */
function updateSchedule(schedule, amount){
  for(let s of schedule){
    if(!s.paid && amount >= s.emi){
      s.paid = true;
      amount -= s.emi;
    }
  }
  return schedule;
}

/* ================= PAY ================= */
window.makeRepayment = async function(){

  const id = loanSelect.value;
  const amount = parseFloat(document.getElementById("amount").value);

  const ref = doc(db,"loans",id);
  const snap = await getDoc(ref);
  const loan = snap.data();

  let total = loan.balance + (loan.penalty||0);

  if(amount>total){
    alert("Too much");
    return;
  }

  /* penalty first */
  let penaltyPaid = Math.min(amount, loan.penalty||0);
  let remaining = amount - penaltyPaid;

  let newPenalty = loan.penalty - penaltyPaid;
  let newBalance = loan.balance - remaining;

  if(newBalance<0) newBalance=0;

  let updatedSchedule = updateSchedule(loan.schedule, amount);

  await updateDoc(ref,{
    balance:newBalance,
    penalty:newPenalty,
    schedule:updatedSchedule,
    lastPaymentDate:new Date().toISOString(),
    status:newBalance===0?"completed":"ongoing"
  });

  await addDoc(collection(db,"repayments"),{
    loanId:id,
    memberName:loan.memberName,
    amount,
    date:new Date().toISOString()
  });

  alert("Paid");
};
