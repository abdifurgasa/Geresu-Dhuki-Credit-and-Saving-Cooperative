// js/i18n.js

// Translations
const translations = {
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.members': 'Members',
        'nav.savings': 'Savings',
        'nav.loans': 'Loans',
        'nav.repayments': 'Repayments',
        'nav.withdrawals': 'Withdrawals',
        'nav.reports': 'Reports',
        'nav.users': 'Users',
        'nav.settings': 'Settings',
        
        // Common
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.add': 'Add',
        'common.search': 'Search',
        'common.filter': 'Filter',
        'common.export': 'Export',
        'common.loading': 'Loading...',
        'common.noData': 'No data found',
        'common.success': 'Success',
        'common.error': 'Error',
        'common.confirm': 'Are you sure?',
        
        // Dashboard
        'dashboard.title': 'Financial Dashboard',
        'dashboard.totalSavings': 'Total Savings',
        'dashboard.totalLoans': 'Total Loans',
        'dashboard.totalWithdrawals': 'Total Withdrawals',
        'dashboard.totalProfit': 'Total Profit',
        'dashboard.quickActions': 'Quick Actions',
        'dashboard.addMember': 'Add Member',
        'dashboard.recordSavings': 'Record Savings',
        'dashboard.createLoan': 'Create Loan',
        'dashboard.processWithdrawal': 'Process Withdrawal',
        
        // Members
        'members.title': 'Member Management',
        'members.addNew': 'Add New Member',
        'members.fullName': 'Full Name',
        'members.email': 'Email',
        'members.phone': 'Phone Number',
        'members.nid': 'National ID',
        'members.status': 'Status',
        'members.active': 'Active',
        'members.inactive': 'Inactive',
        'members.joinDate': 'Join Date',
        'members.savingsBalance': 'Savings Balance',
        
        // Loans
        'loans.title': 'Loan Management',
        'loans.applyNew': 'Apply New Loan',
        'loans.amount': 'Loan Amount',
        'loans.interest': 'Interest Rate',
        'loans.duration': 'Duration (Months)',
        'loans.totalLoan': 'Total Loan',
        'loans.remainingLoan': 'Remaining Balance',
        'loans.monthlyPayment': 'Monthly Payment',
        'loans.type': 'Loan Type',
        'loans.status': 'Status',
        'loans.purpose': 'Purpose',
        
        // Repayments
        'repayments.title': 'Repayment Management',
        'repayments.makePayment': 'Make Payment',
        'repayments.amount': 'Payment Amount',
        'repayments.previousBalance': 'Previous Balance',
        'repayments.newBalance': 'New Balance',
        'repayments.date': 'Payment Date',
        
        // Withdrawals
        'withdrawals.title': 'Withdrawal Management',
        'withdrawals.process': 'Process Withdrawal',
        'withdrawals.amount': 'Withdrawal Amount',
        'withdrawals.reason': 'Reason for Withdrawal',
        'withdrawals.previousBalance': 'Previous Balance',
        'withdrawals.newBalance': 'New Balance',
        
        // Reports
        'reports.title': 'Financial Reports',
        'reports.incomeExpense': 'Income vs Expenses',
        'reports.memberGrowth': 'Member Growth',
        'reports.loanPerformance': 'Loan Performance',
        'reports.transactionHistory': 'Transaction History',
        
        // Users
        'users.title': 'User Management',
        'users.addNew': 'Add New User',
        'users.role': 'Role',
        'users.admin': 'Admin',
        'users.officer': 'Officer',
        'users.viewer': 'Viewer',
        
        // Settings
        'settings.title': 'System Settings',
        'settings.general': 'General Settings',
        'settings.language': 'Language',
        'settings.currency': 'Currency',
        'settings.backup': 'Backup & Restore',
        'settings.security': 'Security Settings',
        
        // Auth
        'auth.login': 'Login',
        'auth.logout': 'Logout',
        'auth.username': 'Username',
        'auth.password': 'Password',
        'auth.forgotPassword': 'Forgot Password?',
        'auth.welcome': 'Welcome',
        
        // Messages
        'msg.loginSuccess': 'Login successful!',
        'msg.logoutSuccess': 'Logout successful!',
        'msg.saveSuccess': 'Saved successfully!',
        'msg.deleteSuccess': 'Deleted successfully!',
        'msg.confirmDelete': 'Are you sure you want to delete this?',
        'msg.insufficientBalance': 'Insufficient balance!',
        'msg.memberAdded': 'Member added successfully!',
        'msg.savingsRecorded': 'Savings recorded successfully!',
        'msg.loanApproved': 'Loan approved successfully!',
        'msg.repaymentRecorded': 'Repayment recorded successfully!',
        'msg.withdrawalProcessed': 'Withdrawal processed successfully!'
    },
    
    om: {
        // Afaan Oromo Translations
        'nav.dashboard': 'Deepphoo',
        'nav.members': 'Miseensonni',
        'nav.savings': 'Kadhaa',
        'nav.loans': 'Liqii',
        'nav.repayments': 'Kaffaltii',
        'nav.withdrawals': 'Baatii',
        'nav.reports': 'Gabaasa',
        'nav.users': 'Fayyadamaa',
        'nav.settings': 'Qindaa\'ina',
        
        'common.save': 'Kadhaa',
        'common.cancel': 'Haqi',
        'common.delete': 'Balleessi',
        'common.edit': 'Gulaali',
        'common.add': 'Dabali',
        'common.search': 'Barbaadi',
        'common.loading': 'Fe\'aa...',
        'common.noData': 'Dhaata hin argamne',
        'common.success': 'Milkaa\'ina',
        'common.error': 'Dogoggora',
        
        'dashboard.title': 'Deepphoo Fiinaansii',
        'dashboard.totalSavings': 'Kadhaa Guutuu',
        'dashboard.totalLoans': 'Liqii Guutuu',
        'dashboard.totalWithdrawals': 'Baatii Guutuu',
        'dashboard.addMember': 'Miseensa Dabali',
        'dashboard.recordSavings': 'Kadhaa Galmeessi',
        
        'members.title': 'Bulchiinsa Miseensotaa',
        'members.addNew': 'Miseensa Haaraa Dabali',
        'members.fullName': 'Maqaa Guutuu',
        'members.phone': 'Lakkoofsa Bilbilaa',
        'members.nid': 'Paaspoorii/Biliksoo',
        
        'loans.title': 'Bulchiinsa Liqii',
        'loans.applyNew': 'Liqii Haaraa Kadhataa',
        'loans.amount': 'Hamta Liqii',
        'loans.interest': 'Haara Wabii',
        
        'auth.login': 'Seeni',
        'auth.logout': 'Baani',
        'auth.username': 'Maqaa Fayyadamaa',
        'auth.password': 'Jechicha Darba',
        'auth.welcome': 'Anaa dhufte',
        
        'msg.saveSuccess': 'Akka barbaadetti kuusame!',
        'msg.deleteSuccess': 'Akkasitti balleessame!'
    },
    
    am: {
        // Amharic Translations
        'nav.dashboard': 'ዳሽቦርድ',
        'nav.members': 'አባላት',
        'nav.savings': 'ቁጠባ',
        'nav.loans': 'ብድር',
        'nav.repayments': 'ክፍያ',
        'nav.withdrawals': 'መውጫ',
        'nav.reports': 'ሪፖርቶች',
        'nav.users': 'ተጠቃሚዎች',
        'nav.settings': 'ቅንብሮች',
        
        'common.save': 'አስቀምጥ',
        'common.cancel': 'ሰርዝ',
        'common.delete': 'ሰርዝ',
        'common.edit': 'አርትዕ',
        'common.add': 'ጨምር',
        'common.search': 'ፈልግ',
        'common.loading': 'በመጫን ላይ...',
        'common.success': 'ተሳክቷል',
        'common.error': 'ስህተት',
        
        'dashboard.title': 'የፋይናንስ ዳሽቦርድ',
        'dashboard.totalSavings': 'ጠቅላላ ቁጠባ',
        'dashboard.totalLoans': 'ጠቅላላ ብድር',
        'dashboard.totalWithdrawals': 'ጠቅላላ መውጫ',
        'dashboard.addMember': 'አባል ጨምር',
        'dashboard.recordSavings': 'ቁጠባ መዝግብ',
        
        'members.title': 'የአባላት አስተዳደር',
        'members.addNew': 'አዲስ አባል ጨምር',
        'members.fullName': 'ሙሉ ስም',
        'members.phone': 'ስልክ ቁጥር',
        'members.nid': 'ብሄራዊ መታወቂያ',
        
        'loans.title': 'የብድር አስተዳደር',
        'loans.applyNew': 'አዲስ ብድር አመልክት',
        'loans.amount': 'የብድር መጠን',
        
        'auth.login': 'ግባ',
        'auth.logout': 'ውጣ',
        'auth.welcome': 'እንኳን ደህና መጡ',
        
        'msg.saveSuccess': 'በሚገባ ተቀምጧል!',
        'msg.deleteSuccess': 'በሚገባ ተሰርዟል!'
    }
};

let currentLanguage = localStorage.getItem('sacco_language') || 'en';

// Translate function
export function t(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key;
}

// Set language
export function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('sacco_language', lang);
        updatePageTranslations();
        return true;
    }
    return false;
}

// Get current language
export function getCurrentLanguage() {
    return currentLanguage;
}

// Update all translatable elements on the page
export function updatePageTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.getAttribute('placeholder')) {
                element.placeholder = t(key);
            }
        } else {
            element.textContent = t(key);
        }
    });
    
    // Update document title
    if (document.querySelector('[data-i18n-title]')) {
        document.title = t(document.querySelector('[data-i18n-title]').getAttribute('data-i18n-title'));
    }
}

// Initialize i18n
export function initI18n() {
    updatePageTranslations();
    
    // Add language switcher if exists
    const languageSwitcher = document.getElementById('languageSwitcher');
    if (languageSwitcher) {
        languageSwitcher.value = currentLanguage;
        languageSwitcher.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }
}
