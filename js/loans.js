window.createLoan = async function () {

  if (!selectedMember) {
    alert("Select member first");
    return;
  }

  const principal = Number(
    document.getElementById("loanAmount").value
  );

  const interest = Number(
    document.getElementById("interest").value
  );

  const durationMonths = Number(
    document.getElementById("durationMonths").value
  );

  if (
    principal <= 0 ||
    interest < 0 ||
    durationMonths <= 0
  ) {
    alert("Invalid loan data");
    return;
  }

  const interestAmount = principal * (interest / 100);

  const totalAmount = principal + interestAmount;

  const monthlyPayment = totalAmount / durationMonths;

  const nextDueDate = new Date();

  nextDueDate.setMonth(nextDueDate.getMonth() + 1);

  await addDoc(collection(db, "loans"), {

    memberId: selectedMember.id,
    memberName: selectedMember.name,

    principal,
    interest,
    durationMonths,

    totalAmount,
    monthlyPayment,

    paid: 0,
    remaining: totalAmount,

    penalty: 0,

    nextDueDate: nextDueDate.toISOString(),

    status: "active",

    createdAt: serverTimestamp()

  });

  await addDoc(collection(db, "transactions"), {

    type: "loan",
    memberId: selectedMember.id,
    memberName: selectedMember.name,
    amount: principal,
    status: "completed",
    createdBy: auth.currentUser?.email,
    date: new Date().toISOString(),
    createdAt: serverTimestamp()

  });

  alert("Loan created successfully");
};
