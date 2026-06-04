// js/i18n.js - Complete Multi-language Support

// Translations for all languages
const translations = {
    // English
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
        
        // Dashboard
        'dashboard.title': 'Financial Dashboard',
        'dashboard.welcome': 'Welcome',
        'dashboard.totalSavings': 'Total Savings',
        'dashboard.totalLoans': 'Total Loans',
        'dashboard.totalWithdrawals': 'Total Withdrawals',
        'dashboard.totalMembers': 'Total Members',
        'dashboard.quickActions': 'Quick Actions',
        'dashboard.addMember': 'Add Member',
        'dashboard.recordSavings': 'Record Savings',
        'dashboard.createLoan': 'Create Loan',
        'dashboard.processWithdrawal': 'Process Withdrawal',
        'dashboard.noData': 'No data found! Start by adding members or load sample data.',
        'dashboard.savingsOverview': 'Savings Overview',
        'dashboard.quickStats': 'Quick Stats',
        'dashboard.summary': 'Summary',
        'dashboard.members': 'Members',
        'dashboard.savings': 'Savings',
        'dashboard.loans': 'Loans',
        'dashboard.withdrawals': 'Withdrawals',
        'dashboard.netPosition': 'Net Position',
        'dashboard.loading': 'Loading...',
        'dashboard.activeMembers': 'active members',
        'dashboard.addMembersToStart': 'Add members to start',
        
        // Common
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.add': 'Add',
        'common.search': 'Search',
        'common.export': 'Export',
        'common.loading': 'Loading...',
        'common.noData': 'No data found',
        'common.success': 'Success',
        'common.error': 'Error',
        'common.confirm': 'Are you sure?',
        'common.actions': 'Actions',
        'common.status': 'Status',
        'common.date': 'Date',
        'common.amount': 'Amount',
        'common.logout': 'Logout',
        
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
        'loans.duration': 'Duration',
        'loans.months': 'months',
        'loans.remaining': 'Remaining Balance',
        'loans.monthlyPayment': 'Monthly Payment',
        'loans.status': 'Status',
        'loans.approved': 'Approved',
        'loans.pending': 'Pending',
        'loans.rejected': 'Rejected',
        
        // Repayments
        'repayments.title': 'Repayment Management',
        'repayments.makePayment': 'Make Payment',
        'repayments.paymentAmount': 'Payment Amount',
        'repayments.previousBalance': 'Previous Balance',
        'repayments.newBalance': 'New Balance',
        'repayments.paymentMethod': 'Payment Method',
        
        // Withdrawals
        'withdrawals.title': 'Withdrawal Management',
        'withdrawals.process': 'Process Withdrawal',
        'withdrawals.amount': 'Withdrawal Amount',
        'withdrawals.reason': 'Reason for Withdrawal',
        
        // Reports
        'reports.title': 'Financial Reports',
        'reports.transactionHistory': 'Transaction History',
        
        // Settings
        'settings.title': 'System Settings',
        'settings.language': 'Language',
        
        // Auth
        'auth.login': 'Login',
        'auth.logout': 'Logout',
        'auth.email': 'Email Address',
        'auth.password': 'Password',
        'auth.forgotPassword': 'Forgot Password?',
        'auth.welcome': 'Welcome to SACCO Banking'
    },
    
    // Afaan Oromo
    om: {
        'nav.dashboard': 'Deepphoo',
        'nav.members': 'Miseensonni',
        'nav.savings': 'Kadhaa',
        'nav.loans': 'Liqii',
        'nav.repayments': 'Kaffaltii',
        'nav.withdrawals': 'Baatii',
        'nav.reports': 'Gabaasa',
        'nav.users': 'Fayyadamtoota',
        'nav.settings': 'Qindaa\'ina',
        
        'dashboard.title': 'Deepphoo Fiinaansii',
        'dashboard.welcome': 'Anaadhufu',
        'dashboard.totalSavings': 'Kadhaa Guutuu',
        'dashboard.totalLoans': 'Liqii Guutuu',
        'dashboard.totalWithdrawals': 'Baatii Guutuu',
        'dashboard.totalMembers': 'Miseensonni Guutuu',
        'dashboard.quickActions': 'Gochaawwan Dafaa',
        'dashboard.addMember': 'Miseensa Dabali',
        'dashboard.recordSavings': 'Kadhaa Galmeessi',
        'dashboard.createLoan': 'Liqii Uumi',
        'dashboard.processWithdrawal': 'Baatii Hojjadhu',
        'dashboard.savingsOverview': 'Yaadannoo Kadhaa',
        'dashboard.quickStats': 'Gabatee Dafaa',
        'dashboard.summary': 'Gabaaba',
        'dashboard.members': 'Miseensonni',
        'dashboard.savings': 'Kadhaa',
        'dashboard.loans': 'Liqii',
        'dashboard.withdrawals': 'Baatii',
        'dashboard.netPosition': 'Haala Qabeenyaa',
        'dashboard.loading': 'Fe\'aa...',
        
        'common.save': 'Kadhaa',
        'common.cancel': 'Haqi',
        'common.delete': 'Balleessi',
        'common.edit': 'Gulaali',
        'common.add': 'Dabali',
        'common.search': 'Barbaadi',
        'common.loading': 'Fe\'aa...',
        'common.success': 'Milkaa\'ina',
        'common.error': 'Dogoggora',
        'common.logout': 'Baani',
        
        'members.title': 'Bulchiinsa Miseensotaa',
        'members.addNew': 'Miseensa Haaraa Dabali',
        'members.fullName': 'Maqaa Guutuu',
        'members.email': 'Iimeelii',
        'members.phone': 'Lakkoofsa Bilbilaa',
        
        'loans.title': 'Bulchiinsa Liqii',
        'loans.applyNew': 'Liqii Haaraa Kadhataa',
        'loans.amount': 'Hamta Liqii',
        
        'auth.login': 'Seeni',
        'auth.logout': 'Baani',
        'auth.email': 'Teessoo Iimeelii',
        'auth.password': 'Jechicha Darba',
        'auth.welcome': 'SACCO Baankiiitti Bagamtan'
    },
    
    // Amharic
    am: {
        'nav.dashboard': 'ዳሽቦርድ',
        'nav.members': 'አባላት',
        'nav.savings': 'ቁጠባ',
        'nav.loans': 'ብድር',
        'nav.repayments': 'ክፍያ',
        'nav.withdrawals': 'መውጫ',
        'nav.reports': 'ሪፖርቶች',
        'nav.users': 'ተጠቃሚዎች',
        'nav.settings': 'ቅንብሮች',
        
        'dashboard.title': 'የፋይናንስ ዳሽቦርድ',
        'dashboard.welcome': 'እንኳን ደህና መጡ',
        'dashboard.totalSavings': 'ጠቅላላ ቁጠባ',
        'dashboard.totalLoans': 'ጠቅላላ ብድር',
        'dashboard.totalWithdrawals': 'ጠቅላላ መውጫ',
        'dashboard.totalMembers': 'ጠቅላላ አባላት',
        'dashboard.quickActions': 'ፈጣን እርምጃዎች',
        'dashboard.addMember': 'አባል ጨምር',
        'dashboard.recordSavings': 'ቁጠባ መዝግብ',
        'dashboard.createLoan': 'ብድር ፍጠር',
        'dashboard.processWithdrawal': 'መውጫ አካሂድ',
        'dashboard.savingsOverview': 'የቁጠባ አጠቃላይ እይታ',
        'dashboard.quickStats': 'ፈጣን ስታቲስቲክስ',
        'dashboard.summary': 'ማጠቃለያ',
        'dashboard.members': 'አባላት',
        'dashboard.savings': 'ቁጠባ',
        'dashboard.loans': 'ብድር',
        'dashboard.withdrawals': 'መውጫ',
        'dashboard.netPosition': 'የተጣራ ቦታ',
        'dashboard.loading': 'በመጫን ላይ...',
        
        'common.save': 'አስቀምጥ',
        'common.cancel': 'ሰርዝ',
        'common.delete': 'ሰርዝ',
        'common.edit': 'አርትዕ',
        'common.add': 'ጨምር',
        'common.search': 'ፈልግ',
        'common.loading': 'በመጫን ላይ...',
        'common.success': 'ተሳክቷል',
        'common.error': 'ስህተት',
        'common.logout': 'ውጣ',
        
        'members.title': 'የአባላት አስተዳደር',
        'members.addNew': 'አዲስ አባል ጨምር',
        'members.fullName': 'ሙሉ ስም',
        'members.email': 'ኢሜይል',
        'members.phone': 'ስልክ ቁጥር',
        
        'loans.title': 'የብድር አስተዳደር',
        'loans.applyNew': 'አዲስ ብድር አመልክት',
        'loans.amount': 'የብድር መጠን',
        
        'auth.login': 'ግባ',
        'auth.logout': 'ውጣ',
        'auth.email': 'ኢሜይል አድራሻ',
        'auth.password': 'የይለፍ ቃል',
        'auth.welcome': 'እንኳን ወደ SACCO ባንክ በደህና መጡ'
    }
};

// Current language
let currentLanguage = localStorage.getItem('sacco_language') || 'en';

// Translation function
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
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.hasAttribute('placeholder')) {
                element.placeholder = translation;
            } else if (element.hasAttribute('value')) {
                // Don't override input values
                if (!element.value || element.value === element.getAttribute('data-original-value')) {
                    element.value = translation;
                }
            }
        } else {
            element.textContent = translation;
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
    
    // Add language switcher event listener
    const languageSwitcher = document.getElementById('languageSwitcher');
    if (languageSwitcher) {
        languageSwitcher.value = currentLanguage;
        languageSwitcher.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }
}
