import { db } from "./firebase.js";
import {
  collection, addDoc, getDocs, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ================= EMI ================= */
function EMI(P, r, n){
  r = r/100/12;
  return Math.round((P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1));
}

/* ================= SCHEDULE ================= */
function createSchedule(P, rate, months, emi){
  let balance = P;
  const r = rate/100/12;
  const arr = [];

  for(let i=1;i<=months;i++){
    let interest = balance*r;
    let principal = emi - interest;

    balance -= principal;
    if(balance<0) balance=0;

    let d = new Date();
    d.setMonth(d.getMonth()+i);

    arr.push({
      installment:i,
      dueDate:d.toISOString(),
      emi,
      principal:Math.round(principal),
      interest:Math.round(interest),
      paid:false
    });
  }
  return arr;
}

/* ================= ADD LOAN ================= */
window.addLoan = async function(){

  const name = memberName.value;
  const P = parseFloat(amount.value);
  const rate = parseFloat(rateInput.value);
  const n = parseInt(months.value);

  const emi = EMI(P, rate, n);
  const schedule = createSchedule(P, rate, n, emi);

  await addDoc(collection(db,"loans"),{
    memberName:name,
    principal:P,
    rate,
    months:n,
    emi,
    balance:P,
    penalty:0,
    schedule,
    status:"ongoing",
    lastPaymentDate:new Date().toISOString()
  });

  alert("Loan created");
  loadLoans();
};

/* ================= LOAD LOANS ================= */
const loanTable = document.getElementById("loanTable");

async function loadLoans(){
  const snap = await getDocs(collection(db,"loans"));
  loanTable.innerHTML="";

  snap.forEach(docSnap=>{
    const l = docSnap.data();

    loanTable.innerHTML+=`
      <tr>
        <td>${l.memberName}</td>
        <td>${l.balance}</td>
        <td>${l.emi}</td>
        <td class="amount red">${l.penalty||0}</td>
        <td>${l.status}</td>
        <td><button onclick='viewSchedule(${JSON.stringify(l.schedule)})'>View</button></td>
      </tr>
    `;
  });
}

window.viewSchedule = function(schedule){
  const t = document.getElementById("scheduleTable");
  t.innerHTML="";

  schedule.forEach(s=>{
    t.innerHTML+=`
      <tr>
        <td>${s.installment}</td>
        <td>${new Date(s.dueDate).toLocaleDateString()}</td>
        <td>${s.emi}</td>
        <td>${s.principal}</td>
        <td>${s.interest}</td>
        <td>${s.paid?"✔":"Pending"}</td>
      </tr>
    `;
  });
};

loadLoans();
