export function calculateLoan(principal, rate, months) {

  // Simple interest model
  const interest = (principal * rate * months) / 100;

  const total = principal + interest;

  const monthly = total / months;

  return {
    principal,
    interest,
    total,
    monthly
  };
}
