// js/withdrawals.js
import { db, collection, getDocs, addDoc, updateDoc, doc, Timestamp } from './firebase.js';
import { formatCurrency, formatDate, showError, showSuccess, getCurrentMonthYear } from './utils.js';

let allWithdrawals = [];
let allMembers = [];

// Load withdrawals
export async function loadWithdrawals() {
    const tbody = document.getElementById('withdrawalsList');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading withdrawals...<\/td><\/tr>';
    
    try {
        const withdrawalsSnapshot = await getDocs(collection(db, "withdrawals"));
        allWithdrawals = [];
        
        // Load members for lookup
        const membersSnapshot = await getDocs(collection(db, "members"));
        const membersMap = new Map();
        membersSnapshot.forEach(doc => {
            membersMap.set(doc.id, doc.data());
        });
        
        if (withdrawalsSnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="7">No withdrawals found<\/td><\/tr>';
            updateWithdrawalStats();
            return;
        }
        
        let index = 1;
        for (const docSnap of withdrawalsSnapshot.docs) {
            const withdrawal = docSnap.data();
            const member = membersMap.get(withdrawal.memberId);
            const memberName = member ? member.fullName : (withdrawal.memberName || 'Unknown');
            
            allWithdrawals.push({ id: docSnap.id, ...withdrawal, memberName });
            
            const row = `
                <tr>
                    <td>${index++}</td>
                    <td>${docSnap.id.slice(0, 8)}</td>
                    <td>${memberName}</td>
                    <td>${member ? member.phone : withdrawal.phone || 'N/A'}</td>
                    <td>${formatCurrency(withdrawal.amount)}</td>
                    <td>${formatDate(withdrawal.createdAt)}</td>
                    <td><span class="status ${withdrawal.status || 'approved'}">${withdrawal.status || 'Approved'}</span></td>
                    <td>
                        <button class="btn-edit" onclick="window.viewWithdrawalReceipt('${docSnap.id}')">
                            <i class="fas fa-receipt"></i> Receipt
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        }
        
        updateWithdrawalStats();
        setupWithdrawalSearch();
        
    } catch (error) {
        console.error("Error loading withdrawals:", error);
        showError('Failed to load withdrawals');
    }
}

// Update statistics
function updateWithdrawalStats() {
    const totalWithdrawalsElement = document.getElementById('totalWithdrawals');
    const monthlyWithdrawalsElement = document.getElementById('monthlyWithdrawals');
    const avgWithdrawalElement = document.getElementById('avgWithdrawal');
    
    if (!totalWithdrawalsElement) return;
    
    let total = 0;
    let monthlyTotal = 0;
    const { month, year } = getCurrentMonthYear();
    
    for (const withdrawal of allWithdrawals) {
        total += withdrawal.amount;
        if (withdrawal.month === month && withdrawal.year === year) {
            monthlyTotal += withdrawal.amount;
        }
    }
    
    const average = allWithdrawals.length > 0 ? total / allWithdrawals.length : 0;
    
    totalWithdrawalsElement.innerText = formatCurrency(total);
    monthlyWithdrawalsElement.innerText = formatCurrency(monthlyTotal);
    avgWithdrawalElement.innerText = formatCurrency(average);
}

// Setup search
function setupWithdrawalSearch() {
    const searchInput = document.getElementById('searchWithdrawal');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#withdrawalsList tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// Load members for dropdown
export async function loadMembersForWithdrawal() {
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
            option.textContent = `${member.fullName} - Balance: ${formatCurrency(member.savingsBalance || 0)}`;
            select.appendChild(option);
        });
        
        // Show balance when member selected
        select.addEventListener('change', (e) => {
            const selected = e.target.options[e.target.selectedIndex];
            const balance = parseFloat(selected.getAttribute('data-balance')) || 0;
            const balanceSpan = document.getElementById('currentBalance');
            if (balanceSpan) {
                balanceSpan.textContent = formatCurrency(balance);
                balanceSpan.style.color = balance > 0 ? '#28a745' : '#dc3545';
            }
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

// Process withdrawal
export async function processWithdrawal(event) {
    event.preventDefault();
    
    const memberId = document.getElementById('memberId').value;
    const amount = parseFloat(document.getElementById('withdrawalAmount').value);
    const reason = document.getElementById('withdrawalReason')?.value || '';
    const memberPhone = document.getElementById('memberPhone')?.value || '';
    
    if (!memberId) {
        showError('Please select a member');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showError('Please enter a valid withdrawal amount');
        return;
    }
    
    // Get selected member balance
    const selectedOption = document.getElementById('memberId').options[document.getElementById('memberId').selectedIndex];
    const currentBalance = parseFloat(selectedOption.getAttribute('data-balance')) || 0;
    
    if (amount > currentBalance) {
        showError(`Insufficient balance! Available balance: ${formatCurrency(currentBalance)}`);
        return;
    }
    
    // Get member name
    const selectedMember = allMembers.find(m => m.id === memberId);
    const memberName = selectedMember ? selectedMember.fullName : '';
    const newBalance = currentBalance - amount;
    const { month, year } = getCurrentMonthYear();
    
    try {
        // Record withdrawal
        await addDoc(collection(db, "withdrawals"), {
            memberId: memberId,
            memberName: memberName,
            phone: memberPhone,
            amount: amount,
            reason: reason,
            previousBalance: currentBalance,
            newBalance: newBalance,
            status: 'approved',
            month: month,
            year: year,
            createdAt: Timestamp.now()
        });
        
        // Update member's savings balance
        const memberRef = doc(db, "members", memberId);
        await updateDoc(memberRef, { 
            savingsBalance: newBalance,
            updatedAt: Timestamp.now()
        });
        
        showSuccess(`Withdrawal of ${formatCurrency(amount)} processed successfully!`);
        closeWithdrawalModal
