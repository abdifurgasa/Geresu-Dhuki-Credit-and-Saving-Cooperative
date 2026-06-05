import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==================== GLOBALS ====================
let perfChart = null;
let loanChart = null;
let useFirebase = true;  // set to false if Firebase fails

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Mock data (fallback)
const mockSavings = [320000, 580000, 890000, 1230000, 1620000, 2110000, 2690000, 3320000, 4010000, 4620000, 5120000, 5487350];
const mockLoans = [148000, 310000, 498000, 752000, 1030000, 1370000, 1760000, 2185000, 2570000, 2890000, 3110000, 3289670];
const mockRepayments = [86000, 104000, 156000, 198000, 244000, 282000, 315000, 345000, 380000, 410000, 445000, 472000];
const mockTotals = { members: 2847, savings: 5487350, loans: 3289670, withdrawals: 1245800, profit: 2197680 };

// ==================== YOUR TRANSLATIONS ====================
const translations = {
  en: {
    dashboard: "Dashboard",
    members: "Members",
    member: "Member",
    savings: "Savings",
    loans: "Loans",
    repayments: "Repayments",
    withdrawals: "Withdrawals",
    reports: "Reports",
    users: "Users",
    settings: "Settings",
    logout: "Logout",
    financialDashboard: "Financial Dashboard",
    overview: "Dashboard Overview",
    welcome: "Welcome to Geresu Dhuki SACCO Banking System",
    quickActions: "Quick Actions",
    addMember: "Add Member",
    addSaving: "Add Saving",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter full name",
    phone: "Phone Number",
    nid: "NID Number",
    status: "Status",
    actions: "Actions",
    active: "Active",
    saveMember: "Save Member",
    transactions: "Transactions",
    duplicateError: "Phone or NID already exists",
    phoneError: "Phone number must be exactly 9 digits",
    nidError: "NID must be exactly 16 digits",
    createdDate: "Created Date",
    createdBy: "Created By",
    depositSavings: "Deposit Savings",
    depositAmount: "Deposit Amount",
    previousSaving: "Previous Saving",
    createLoan: "Create Loans",
    remainingLoan: "Remaining Loan",
    netProfit: "Net Profit",
    totalMembers: "Total Members",
    totalSavings: "Total Savings",
    totalLoans: "Total Loans",
    withdrawalsTitle: "Withdrawals",
    processWithdrawals: "Process withdrawals",
    registerMember: "Register new member",
    recordSavings: "Record member savings",
    loansTitle: "Loans",
    performanceOverview: "Performance Overview",
    loansVsRepayments: "Loans vs Repayments"
  },
  am: {
    dashboard: "ዳሽቦርድ",
    members: "አባላት",
    member: "አባል",
    savings: "ቁጠባ",
    loans: "ብድር",
    repayments: "ክፍያ",
    withdrawals: "መውጣት",
    reports: "ሪፖርት",
    users: "ተጠቃሚዎች",
    settings: "ቅንብሮች",
    logout: "ውጣ",
    financialDashboard: "የፋይናንስ ዳሽቦርድ",
    overview: "አጠቃላይ እይታ",
    welcome: "እንኳን ወደ ገረሱ ዱኪ SACCO ባንክ ሲስተም በደህና መጡ",
    quickActions: "ፈጣን እርምጃዎች",
    addMember: "አባል ጨምር",
    addSaving: "ቁጠባ ጨምር",
    fullName: "ሙሉ ስም",
    fullNamePlaceholder: "ሙሉ ስም ያስገቡ",
    phone: "ስልክ ቁጥር",
    nid: "መታወቂያ ቁጥር", 
    status: "ሁኔታ",
    actions: "ድርጊቶች",
    active: "ንቁ",
    saveMember: "አባል አስቀምጥ",
    transactions: "ግብይቶች",
    duplicateError: "ስልክ ወይም NID አስቀድሞ አለ",
    phoneError: "ስልክ ቁጥር 9 ዲጂት መሆን አለበት",
    nidError: "NID 16 ዲጂት መሆን አለበት",
    createdDate: "የተመዘገበበት ቀን",
    createdBy: "የመዘገበ ሰዉ",
    depositSavings: "ቁጠባ አክል",
    depositAmount: "የቁጠባ መጠን",
    previousSaving: "የቀድሞ ቁጠባ",
    createLoan: "ብድር ፈጥር",
    remainingLoan: "ቀሪ ብድር",
    netProfit: "ንጹህ ትርፍ",
    totalMembers: "ጠቅላላ አባላት",
    totalSavings: "ጠቅላላ ቁጠባ",
    totalLoans: "ጠቅላላ ብድር",
    withdrawalsTitle: "መውጣት",
    processWithdrawals: "የመውጣት ሂደት",
    registerMember: "አዲስ አባል መዝግብ",
    recordSavings: "የቁጠባ መዝገብ",
    loansTitle: "ብድር",
    performanceOverview: "የአፈጻጸም እይታ",
    loansVsRepayments: "ብድር እና ክፍያ"
  },
  om: {
    dashboard: "Daashboordii",
    members: "Miseensota",
    member: "Miseensa",
    savings: "Qusannaa",
    loans: "Liqii",
    repayments: "Deebii",
    withdrawals: "Baasii",
    reports: "Gabaasa",
    users: "Fayyadamtoota",
    settings: "Sirreessituu",
    logout: "Ba’i",
    financialDashboard: "Daashboordii Faayinaansii",
    overview: "Ilaalcha Waliigalaa",
    welcome: "Baga Gara Sirna Baankii SACCO Geresu Dhuki Nagaan Dhuftan",
    quickActions: "Gocha Saffisaa",
    addMember: "Miseensa Dabali",
    addSaving: "Qusannaa Dabali",
    fullName: "Maqaa Guutuu",
    fullNamePlaceholder: "Maqaa guutuu galchi",
    phone: "Lakkoofsa Bilbilaa",
    nid: "Lakkoofsa NID",
    status: "Haala",
    actions: "Gochaawwan",
    active: "Hojii Irra Jira",
    saveMember: "Kuusi Miseensa",
    transactions: "Sochiiwwan",
    duplicateError: "Bilbila ykn NID duraan jira",
    phoneError: "Bilbilli lakkoofsa 9 qabaachuu qaba",
    nidError: "NID lakkoofsa 16 qabaachuu qaba",
    createdDate: "Guyyaa Galmaa'e",
    createdBy: "Kan Galmeesse",
    depositSavings: "Qusannaa Galchi",
    depositAmount: "Hanga Qusannaa",
    previousSaving: "Qusannaa Duraanii",
    createLoan: "Liqii Uumi",
    remainingLoan: "Haftee Liqii",
    netProfit: "Bu'aa Qulqulluu",
    totalMembers: "Miseensota Waliigalaa",
    totalSavings: "Qusannaa Waliigalaa",
    totalLoans: "Liqii Waliigalaa",
    withdrawalsTitle: "Baasii",
    processWithdrawals: "Baasii Raawwadhu",
    registerMember: "Miseensa Haaraa Galmeessi",
    recordSavings: "Qusannaa Galchi",
    loansTitle: "Liqii",
    performanceOverview: "Raawwii Hojii",
    loansVsRepayments: "Liqii fi Deebii Liqii"
  }
};

// ==================== LANGUAGE HANDLING ====================
function changeLanguage(lang) {
  localStorage.setItem("lang", lang);
  applyLanguage(lang);
}

function applyLanguage(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  const select = document.getElementById("languageSelect");
  if (select) select.value = lang;
}

// ==================== HELPER ====================
function formatMoney(amount) {
  return Number(amount).toLocaleString() + ' ETB';
}

// ==================== UPDATE STAT CARDS ====================
function updateStatCards(data) {
  document.getElementById('totalMembers').innerText = data.members;
  document.getElementById('totalSavings').innerText = formatMoney(data.savings);
  document.getElementById('totalLoans').innerText = formatMoney(data.loans);
  document.getElementById('totalWithdrawals').innerText = formatMoney(data.withdrawals);
  document.getElementById('netProfit').innerText = formatMoney(data.profit);
}

// ==================== FETCH FROM FIRESTORE ====================
async function fetchFirestoreData() {
  try {
    const membersSnap = await getDocs(collection(db, "members"));
    const savingsSnap = await getDocs(collection(db, "savings"));
    const loansSnap = await getDocs(collection(db, "loans"));
    const withdrawalsSnap = await getDocs(collection(db, "withdrawals"));
    const repaymentsSnap = await getDocs(collection(db, "repayments"));
    const monthlySnap = await getDocs(collection(db, "monthlyStats"));

    let totalSavings = 0, totalLoans = 0, totalWithdrawals = 0, totalRepayments = 0;
    savingsSnap.forEach(doc => totalSavings += Number(doc.data().amount || 0));
    loansSnap.forEach(doc => totalLoans += Number(doc.data().amount || 0));
    withdrawalsSnap.forEach(doc => totalWithdrawals += Number(doc.data().amount || 0));
    repaymentsSnap.forEach(doc => totalRepayments += Number(doc.data().amount || 0));
    const netProfit = totalRepayments - totalWithdrawals;
    const totalMembers = membersSnap.size;

    let savingsMonthly = new Array(12).fill(0);
    let loansMonthly = new Array(12).fill(0);
    let repaymentsMonthly = new Array(12).fill(0);
    monthlySnap.forEach(doc => {
      const d = doc.data();
      const idx = (d.month || 1) - 1;
      if (idx >= 0 && idx < 12) {
        savingsMonthly[idx] = Number(d.savings || 0);
        loansMonthly[idx] = Number(d.loans || 0);
        repaymentsMonthly[idx] = Number(d.repayments || 0);
      }
    });

    return {
      totals: { members: totalMembers, savings: totalSavings, loans: totalLoans, withdrawals: totalWithdrawals, profit: netProfit },
      monthly: { savings: savingsMonthly, loans: loansMonthly, repayments: repaymentsMonthly }
    };
  } catch (error) {
    console.warn("Firebase error, using mock data:", error);
    return null;
  }
}

// ==================== LOAD DATA (FIREBASE OR MOCK) ====================
async function loadDashboardData() {
  let data = null;
  if (useFirebase) data = await fetchFirestoreData();
  if (!data) {
    data = {
      totals: mockTotals,
      monthly: { savings: mockSavings, loans: mockLoans, repayments: mockRepayments }
    };
  }
  updateStatCards(data.totals);
  updateCharts(data.monthly);
}

// ==================== UPDATE CHARTS ====================
function updateCharts(monthly) {
  if (perfChart) {
    perfChart.data.datasets[0].data = monthly.savings;
    perfChart.data.datasets[1].data = monthly.loans;
    perfChart.update();
  }
  if (loanChart) {
    loanChart.data.datasets[0].data = monthly.loans;
    loanChart.data.datasets[1].data = monthly.repayments;
    loanChart.update();
  }
}

// ==================== INIT CHARTS ====================
function initCharts() {
  const ctx1 = document.getElementById('performanceChart').getContext('2d');
  const ctx2 = document.getElementById('loanChart').getContext('2d');
  
  if (perfChart) perfChart.destroy();
  if (loanChart) loanChart.destroy();
  
  perfChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        { label: 'Savings (ETB)', data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.05)', tension: 0.3, fill: true, pointRadius: 3 },
        { label: 'Loans (ETB)', data: [], borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.02)', tension: 0.3, fill: false }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toLocaleString()} ETB` } } } }
  });
  
  loanChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label: 'Loans Issued', data: [], backgroundColor: '#06b6d4', borderRadius: 8 },
        { label: 'Repayments', data: [], backgroundColor: '#8b5cf6', borderRadius: 8 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// ==================== SIDEBAR TOGGLE ====================
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggleBtn');
  if (!toggleBtn) return;
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const icon = toggleBtn.querySelector('i');
    if (sidebar.classList.contains('collapsed')) {
      icon.classList.remove('fa-chevron-left');
      icon.classList.add('fa-chevron-right');
    } else {
      icon.classList.remove('fa-chevron-right');
      icon.classList.add('fa-chevron-left');
    }
  });
}

// ==================== INITIALIZE EVERYTHING ====================
document.addEventListener('DOMContentLoaded', async () => {
  initSidebar();
  initCharts();
  
  // Language setup
  const lang = localStorage.getItem("lang") || "en";
  applyLanguage(lang);
  const langSelect = document.getElementById("languageSelect");
  if (langSelect) {
    langSelect.value = lang;
    langSelect.addEventListener("change", (e) => changeLanguage(e.target.value));
  }
  
  await loadDashboardData();
});
import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Redirect to login if not authenticated
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});
import { db, auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Redirect if not logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

// ... rest of your existing code (translations, mock data, charts, etc.)
