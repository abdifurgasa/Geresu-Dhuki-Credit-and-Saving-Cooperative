// js/loans.js
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, Timestamp } from './firebase.js';
import { formatCurrency, formatDate, showError, showSuccess, getCurrentMonthYear } from './utils.js';
import { t } from './i18n.js';

// State
let allLoans = [];
let allMembers = [];
let currentLoanId = null;

// Load all loans
export async function loadLoans() {
    const tbody = document.getElementById('loansList');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="10" class="loading">Loading loans...<\/td><\/tr>';
    
    try {
        const loansSnapshot = await getDocs(query(collection(db, "loans"), orderBy("createdAt", "desc")));
        allLoans = [];
        
        // Load members for lookup
        const membersSnapshot = await getDocs(collection(db, "members"));
        const membersMap = new Map();
        membersSnapshot.forEach(doc => {
            membersMap.set(doc.id, doc.data());
        });
        
        if (loansSnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="10">No loans found. Apply for a loan!<\/td><\/tr>';
            updateLoanStats();
            return;
        }
        
        let index = 1;
        for (const docSnap of loansSnapshot.docs) {
            const loan = docSnap.data();
            const member = membersMap.get(loan.memberId);
            const memberName = member ? member.fullName : (loan.memberName || 'Unknown');
            const monthlyPayment = loan.amount / loan.term;
            const remainingBalance = loan.remainingBalance || loan.amount;
            const paidAmount = loan.amount - remainingBalance;
            const paidPercent = loan.amount > 0 ? (paidAmount / loan.amount * 100).toFixed(1) : 0;
            
            allLoans.push({ id: docSnap.id, ...loan, memberName });
            
            const row = `
                <tr>
                    <td>${index++}</td>
                    <td>${loan.loanId ? loan.loanId.slice(0, 8) : docSnap.id.slice(0, 8)}</td>
                    <td><strong>${memberName}</strong></td>
                    <td>${member ? member.phone : loan.phone || 'N/A'}</td>
                    <td>${formatCurrency(loan.amount)}</td>
                    <td>${loan.interestRate || 12}%</td>
                    <td>${loan.term} months</td>
                    <td>${formatCurrency(monthlyPayment)}</td>
                    <td>${formatCurrency(remainingBalance)}</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${paidPercent}%"></div>
                            <span>${paidPercent}% paid</span>
                        </div>
                    </td>
                    <td><span class="status ${loan.status || 'approved'}">${loan.status || 'Approved'}</span></td>
                    <td>
                        <button class="btn-edit" onclick="window.makeRepayment('${docSnap.id}', '${memberName}', ${remainingBalance}, ${monthlyPayment})">
                            <i class="fas fa-money-bill-wave"></i> Pay
                        </button>
                        <button class="btn-edit" onclick="window.viewLoanDetails('${docSnap.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        }
        
        updateLoanStats();
        setupLoanSearch();
        
    } catch (error) {
        console.error("Error loading loans:", error);
        showError('Failed to load loans');
        tbody.innerHTML = '<tr><td colspan="10">Error loading loans<\/td><\/tr>';
    }
}

// Update loan statistics
async function updateLoanStats() {
    const totalLoansElement = document.getElementById('totalLoansAmount');
    const activeLoansElement = document.getElementById('activeLoansCount');
    const totalRepaidElement = document.getElementById('totalRepaidAmount');
    const outstandingElement = document.getElementById('outstandingAmount');
    
    if (!totalLoansElement) return;
    
    let totalLoans = 0;
    let activeLoans = 0;
    let totalRepaid = 0;
    let outstanding = 0;
    
    for (const loan of allLoans) {
        totalLoans += loan.amount;
        const remaining = loan.remainingBalance || loan.amount;
        const repaid = loan.amount - remaining;
        
        if (remaining > 0) activeLoans++;
        totalRepaid += repaid;
        outstanding += remaining;
    }
    
    totalLoansElement.innerText = formatCurrency(totalLoans);
    activeLoansElement.innerText = activeLoans;
    totalRepaidElement.innerText = formatCurrency(totalRepaid);
    outstandingElement.innerText = formatCurrency(outstanding);
}

// Setup search functionality
function setupLoanSearch() {
    const searchInput = document.getElementById('searchLoan');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#loansList tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// Load members for dropdown
export async function loadMembersForLoan() {
    try {
        const querySnapshot = await getDocs(collection(db, "members"));
        allMembers = [];
        const select = document.getElementById('memberId');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select Member</option>';
        
        querySnapshot.forEach((doc) => {
            const member = doc.data();
            allMembers.push({ id: doc.id, ...member });
            const option = document.createElement('option');
            option.value = doc.id;
            option.setAttribute('data-balance', member.savingsBalance || 0);
            option.setAttribute('data-phone', member.phone || '');
            option.textContent = `${member.fullName} - ${member.email} (Balance: ${formatCurrency(member.savingsBalance || 0)})`;
            select.appendChild(option);
        });
        
        // Auto-fill phone when member selected
        select.addEventListener('change', (e) => {
            const selected = e.target.options[e.target.selectedIndex];
            const phoneInput = document.getElementById('memberPhone');
            if (phoneInput) {
                phoneInput.value = selected.getAttribute('data-phone') || '';
            }
        });
        
    } catch (error) {
        console.error("Error loading members:", error);
        showError('Failed to load members');
    }
}

// Apply for loan
export async function applyForLoan(event) {
    event.preventDefault();
    
    const memberId = document.getElementById('memberId').value;
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const term = parseInt(document.getElementById('loanTerm').value);
    const interestRate = parseFloat(document.getElementById('interestRate')?.value || 12);
    const purpose = document.getElementById('loanPurpose')?.value || '';
    const memberPhone = document.getElementById('memberPhone')?.value || '';
    
    if (!memberId) {
        showError('Please select a member');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showError('Please enter a valid loan amount');
        return;
    }
    
    if (amount < 1000) {
        showError('Minimum loan amount is 1,000 ETB');
        return;
    }
    
    if (amount > 500000) {
        showError('Maximum loan amount is 500,000 ETB');
        return;
    }
    
    const { month, year } = getCurrentMonthYear();
    const totalInterest = amount * (interestRate / 100);
    const totalLoan = amount + totalInterest;
    const monthlyPayment = totalLoan / term;
    
    // Get member name
    const selectedMember = allMembers.find(m => m.id === memberId);
    const memberName = selectedMember ? selectedMember.fullName : '';
    
    const loanData = {
        memberId: memberId,
        memberName: memberName,
        phone: memberPhone,
        amount: amount,
        principal: amount,
        interest: totalInterest,
        totalLoan: totalLoan,
        remainingBalance: totalLoan,
        term: term,
        interestRate: interestRate,
        monthlyPayment: monthlyPayment,
        purpose: purpose,
        status: 'approved', // Auto-approve for demo
        month: month,
        year: year,
        loanId: 'LN' + Date.now().toString().slice(-8),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    };
    
    try {
        await addDoc(collection(db, "loans"), loanData);
        showSuccess(`Loan of ${formatCurrency(amount)} approved successfully!`);
        closeLoanModal();
        document.getElementById('loanForm')?.reset();
        loadLoans();
        updateDashboardStats();
    } catch (error) {
        console.error("Error applying for loan:", error);
        showError('Error applying for loan: ' + error.message);
    }
}

// Make repayment
export async function makeRepayment(loanId, memberName, remainingBalance, monthlyPayment) {
    currentLoanId = loanId;
    const amountInput = document.getElementById('repaymentAmount');
    const remainingSpan = document.getElementById('selectedRemaining');
    const memberSpan = document.getElementById('selectedMember');
    const suggestedSpan = document.getElementById('suggestedAmount');
    
    if (amountInput) {
        amountInput.value = '';
        amountInput.max = remainingBalance;
        amountInput.placeholder = `Enter amount (Max: ${formatCurrency(remainingBalance)})`;
        
        // Suggest monthly payment amount
        if (suggestedSpan) {
            suggestedSpan.innerHTML = `Suggested: ${formatCurrency(monthlyPayment)}`;
        }
    }
    
    if (remainingSpan) remainingSpan.textContent = formatCurrency(remainingBalance);
    if (memberSpan) memberSpan.textContent = memberName;
    
    openRepaymentModal();
}

// Process repayment
export async function processRepayment(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('repaymentAmount').value);
    const paymentMethod = document.getElementById('repaymentMethod')?.value || 'cash';
    const note = document.getElementById('repaymentNote')?.value || '';
    const { month, year } = getCurrentMonthYear();
    
    if (isNaN(amount) || amount <= 0) {
        showError('Please enter a valid repayment amount');
        return;
    }
    
    try {
        // Get current loan
        const loanRef = doc(db, "loans", currentLoanId);
        const loanDoc = await getDocs(query(collection(db, "loans"), where("__name__", "==", currentLoanId)));
        let currentBalance = 0;
        let memberId = null;
        let memberName = '';
        
        loanDoc.forEach(doc => {
            currentBalance = doc.data().remainingBalance;
            memberId = doc.data().memberId;
            memberName = doc.data().memberName;
        });
        
        if (amount > currentBalance) {
            showError(`Payment amount cannot exceed remaining balance of ${formatCurrency(currentBalance)}`);
            return;
        }
        
        const newBalance = currentBalance - amount;
        
        // Record repayment
        await addDoc(collection(db, "repayments"), {
            loanId: currentLoanId,
            memberId: memberId,
            memberName: memberName,
            amount: amount,
            previousBalance: currentBalance,
            remainingBalance: newBalance,
            paymentMethod: paymentMethod,
            note: note,
            month: month,
            year: year,
            createdAt: Timestamp.now()
        });
        
        // Update loan
        await updateDoc(loanRef, { 
            remainingBalance: newBalance,
            updatedAt: Timestamp.now()
        });
        
        showSuccess(`Repayment of ${formatCurrency(amount)} recorded successfully!`);
        closeRepaymentModal();
        document.getElementById('repaymentForm')?.reset();
        loadLoans();
        updateDashboardStats();
        
        // Show receipt
        showReceipt(memberName, amount, newBalance, paymentMethod);
        
    } catch (error) {
        console.error("Error processing repayment:", error);
        showError('Error processing repayment: ' + error.message);
    }
}

// Show receipt
function showReceipt(memberName, amount, newBalance, paymentMethod) {
    const receiptContent = document.getElementById('receiptContent');
    if (receiptContent) {
        receiptContent.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-piggy-bank" style="font-size: 48px; color: #1a3c34;"></i>
                <h3>SACCO Banking System</h3>
                <p>Payment Receipt</p>
                <hr>
                <p><strong>Receipt No:</strong> RCP-${Date.now().toString().slice(-8)}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Member:</strong> ${memberName}</p>
                <p><strong>Amount Paid:</strong> ${formatCurrency(amount)}</p>
                <p><strong>Remaining Balance:</strong> ${formatCurrency(newBalance)}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                <hr>
                <p>Thank you for your payment!</p>
            </div>
        `;
        openReceiptModal();
    }
}

// View loan details
export async function viewLoanDetails(loanId) {
    const loan = allLoans.find(l => l.id === loanId);
    if (!loan) return;
    
    const detailsDiv = document.getElementById('loanDetails');
    if (detailsDiv) {
        const paidAmount = loan.amount - (loan.remainingBalance || loan.amount);
        const paidPercent = (paidAmount / loan.amount * 100).toFixed(1);
        
        detailsDiv.innerHTML = `
            <div class="loan-detail-card">
                <h3>Loan Information</h3>
                <p><strong>Loan ID:</strong> ${loan.loanId || loan.id.slice(0, 8)}</p>
                <p><strong>Member:</strong> ${loan.memberName}</p>
                <p><strong>Phone:</strong> ${loan.phone || 'N/A'}</p>
                <p><strong>Principal:</strong> ${formatCurrency(loan.amount)}</p>
                <p><strong>Interest (${loan.interestRate}%):</strong> ${formatCurrency(loan.interest || loan.amount * loan.interestRate / 100)}</p>
                <p><strong>Total Loan:</strong> ${formatCurrency(loan.totalLoan || loan.amount)}</p>
                <p><strong>Paid:</strong> ${formatCurrency(paidAmount)} (${paidPercent}%)</p>
                <p><strong>Remaining:</strong> ${formatCurrency(loan.remainingBalance || loan.amount)}</p>
                <p><strong>Term:</strong> ${loan.term} months</p>
                <p><strong>Monthly Payment:</strong> ${formatCurrency(loan.monthlyPayment || loan.amount / loan.term)}</p>
                <p><strong>Purpose:</strong> ${loan.purpose || 'Not specified'}</p>
                <p><strong>Status:</strong> <span class="status ${loan.status}">${loan.status}</span></p>
                <p><strong>Applied:</strong> ${formatDate(loan.createdAt)}</p>
            </div>
        `;
        openDetailsModal();
    }
}

// Update dashboard statistics
async function updateDashboardStats() {
    // This will refresh the dashboard if we're on dashboard page
    if (typeof window.loadDashboardData === 'function') {
        window.loadDashboardData();
    }
}

// Modal functions
function closeLoanModal() {
    const modal = document.getElementById('loanModal');
    if (modal) modal.style.display = 'none';
    document.getElementById('loanForm')?.reset();
}

function openRepaymentModal() {
    const modal = document.getElementById('repaymentModal');
    if (modal) modal.style.display = 'flex';
}

function closeRepaymentModal() {
    const modal = document.getElementById('repaymentModal');
    if (modal) modal.style.display = 'none';
    document.getElementById('repaymentForm')?.reset();
}

function openReceiptModal() {
    const modal = document.getElementById('receiptModal');
    if (modal) modal.style.display = 'flex';
}

function openDetailsModal() {
    const modal = document.getElementById('loanDetailsModal');
    if (modal) modal.style.display = 'flex';
}

// Export functions to window for onclick handlers
window.makeRepayment = makeRepayment;
window.viewLoanDetails = viewLoanDetails;
window.closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
};

// Initialize loans page
export function initLoansPage() {
    loadLoans();
    
    // Setup form submit handlers
    const loanForm = document.getElementById('loanForm');
    if (loanForm) {
        loanForm.addEventListener('submit', applyForLoan);
    }
    
    const repaymentForm = document.getElementById('repaymentForm');
    if (repaymentForm) {
        repaymentForm.addEventListener('submit', processRepayment);
    }
    
    // Setup modal close handlers
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
}
