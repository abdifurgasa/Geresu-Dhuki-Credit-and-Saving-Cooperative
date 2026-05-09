
import { jsPDF } from "jspdf";

export function exportPDF(reportData) {

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("SACCO Financial Report", 10, 10);

  doc.setFontSize(12);

  doc.text(`Members: ${reportData.members}`, 10, 30);
  doc.text(`Savings: ${reportData.savings} ETB`, 10, 40);
  doc.text(`Loans: ${reportData.loans} ETB`, 10, 50);
  doc.text(`Repayments: ${reportData.repayments} ETB`, 10, 60);

  doc.save("sacco-report.pdf");
}pdf
