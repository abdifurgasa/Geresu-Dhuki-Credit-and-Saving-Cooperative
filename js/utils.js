// js/utils.js

// Format currency in ETB
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-ET', {
        style: 'currency',
        currency: 'ETB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0);
}

// Format date
export function formatDate(date) {
    if (!date) return 'N/A';
    if (date.toDate) {
        return date.toDate().toLocaleDateString('en-US');
    }
    return new Date(date).toLocaleDateString('en-US');
}

// Format datetime
export function formatDateTime(date) {
    if (!date) return 'N/A';
    if (date.toDate) {
        return date.toDate().toLocaleString('en-US');
    }
    return new Date(date).toLocaleString('en-US');
}

// Show loading state
export function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<tr><td colspan="10" class="loading">${message}</td></tr>`;
    }
}

// Show error message
export function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.innerHTML = message;
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
        setTimeout(() => errorDiv.remove(), 5000);
    } else {
        alert(message);
    }
}

// Show success message
export function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.innerHTML = message;
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(successDiv, mainContent.firstChild);
        setTimeout(() => successDiv.remove(), 3000);
    } else {
        alert(message);
    }
}

// Get current month and year
export function getCurrentMonthYear() {
    const now = new Date();
    return {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        monthName: now.toLocaleString('default', { month: 'long' })
    };
}

// Generate unique ID
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validate email
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number (Ethiopian format)
export function isValidPhone(phone) {
    const re = /^09[0-9]{8}$/;
    return re.test(phone);
}

// Validate Ethiopian national ID
export function isValidNID(nid) {
    const re = /^[0-9]{8,}$/;
    return re.test(nid);
}

// Close modal
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Open modal
export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Setup modal close on outside click
export function setupModalHandlers() {
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
}

// Export to CSV
export function exportToCSV(data, filename) {
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            return `"${(val || '').toString().replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Print report
export function printReport(elementId) {
    const content = document.getElementById(elementId).innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head><title>Print Report</title>
            <link rel="stylesheet" href="css/style.css">
            </head>
            <body>${content}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}
