// ==================== MOCK DATA (replace with Firebase later) ====================
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const savingsData = [320000, 580000, 890000, 1230000, 1620000, 2110000, 2690000, 3320000, 4010000, 4620000, 5120000, 5487350];
const loansData = [148000, 310000, 498000, 752000, 1030000, 1370000, 1760000, 2185000, 2570000, 2890000, 3110000, 3289670];
const repaymentsData = [86000, 104000, 156000, 198000, 244000, 282000, 315000, 345000, 380000, 410000, 445000, 472000];

const totals = { members: 2847, savings: 5487350, loans: 3289670, withdrawals: 1245800, profit: 2197680 };

let perfChart = null;
let loanChart = null;

// helper: format money
function formatMoney(amount) {
  return amount.toLocaleString() + ' ETB';
}

// update stat cards with mock data
function updateStatCards() {
  document.getElementById('totalMembers').innerText = totals.members;
  document.getElementById('totalSavings').innerText = formatMoney(totals.savings);
  document.getElementById('totalLoans').innerText = formatMoney(totals.loans);
  document.getElementById('totalWithdrawals').innerText = formatMoney(totals.withdrawals);
  document.getElementById('netProfit').innerText = formatMoney(totals.profit);
}

// initialize both charts (destroy previous if exist)
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
        { label: 'Savings (ETB)', data: savingsData, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.05)', tension: 0.3, fill: true, pointBackgroundColor: '#2563eb', pointRadius: 3 },
        { label: 'Loans (ETB)', data: loansData, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.02)', tension: 0.3, fill: false }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toLocaleString()} ETB` } } } }
  });
  
  loanChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label: 'Loans Issued', data: loansData, backgroundColor: '#06b6d4', borderRadius: 8 },
        { label: 'Repayments', data: repaymentsData, backgroundColor: '#8b5cf6', borderRadius: 8 }
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

// ==================== INTERNATIONALIZATION ====================
const translations = {
  en: {
    dashboard: "Dashboard", members: "Members", savings: "Savings", loans: "Loans", repayments: "Repayments",
    withdrawals: "Withdrawals", reports: "Reports", users: "Users", settings: "Settings", logout: "Logout",
    financialDashboard: "Financial Dashboard", overviewSub: "Insights & Analytics", overview: "Dashboard Overview",
    welcome: "Welcome to Geresu Dhuki SACCO Banking System", subtitle: "Real‑time performance at a glance",
    totalMembers: "Total Members", totalSavings: "Total Savings", totalLoans: "Total Loans", netProfit: "Net Profit",
    quickActions: "Quick Actions", addMember: "Add Member", registerMember: "Register new member",
    recordSavings: "Record member savings", createLoan: "Create new loan", processWithdrawals: "Process withdrawals",
    overviewChart: "Savings vs Loans (ETB)", loansVsRepayments: "Loans vs Repayments"
  },
  om: {
    dashboard: "Duwwaa", members: "Miseensota", savings: "Kadhaa", loans: "Liqii", repayments: "Kaffaltii Liqii",
    withdrawals: "Baatii", reports: "Gabaasa", users: "Fayyadamaa", settings: "Qindaa’ina", logout: "Ba'i",
    financialDashboard: "Tuujjoo Maallaqaa", overviewSub: "Hubannoo fi Xiinxala", overview: "Roomsa Tuujjoo",
    welcome: "Baga Geresu Dhuki SACCO Banking System keessatti baga nagaan dhufte", subtitle: "Haalata yeroo ammaa",
    totalMembers: "Miseensonni Waligalaa", totalSavings: "Kadhaa Waligalaa", totalLoans: "Liqii Waligalaa", netProfit: "Bu’aa Qulqulluu",
    quickActions: "Gochaaf Madaalawwan", addMember: "Miseensa Iddas", registerMember: "Miseensa haaraa galmeessi",
    recordSavings: "Kadhaa miseensaa galmeessi", createLoan: "Liqii haaraa uumi", processWithdrawals: "Baatii hojjechi",
    overviewChart: "Kadhaa fi Liqii (ETB)", loansVsRepayments: "Liqii fi Kaffaltii Liqii"
  },
  am: {
    dashboard: "ዳሽቦርድ", members: "አባላት", savings: "ቁጠባ", loans: "ብድር", repayments: "ብድር ክፍያ",
    withdrawals: "መውጣት", reports: "ሪፖርቶች", users: "ተጠቃሚዎች", settings: "ቅንብሮች", logout: "ውጣ",
    financialDashboard: "የፋይናንስ ዳሽቦርድ", overviewSub: "ግንዛቤ እና ትንታኔ", overview: "የዳሽቦርድ አጠቃላይ እይታ",
    welcome: "እንኳን ወደ ገረሱ ዱኪ ሳኮ ባንክ ሲስተም በደህና መጡ", subtitle: "የቅጽበታዊ አፈጻጸም",
    totalMembers: "ጠቅላላ አባላት", totalSavings: "ጠቅላላ ቁጠባ", totalLoans: "ጠቅላላ ብድር", netProfit: "የተጣራ ትርፍ",
    quickActions: "ፈጣን ድርጊቶች", addMember: "አባል ጨምር", registerMember: "አዲስ አባል ይመዝገቡ",
    recordSavings: "የአባል ቁጠባ መዝግብ", createLoan: "አዲስ ብድር ፍጠር", processWithdrawals: "መውጣት ማስኬድ",
    overviewChart: "ቁጠባ እና ብድር (ETB)", loansVsRepayments: "ብድር እና ብድር ክፍያ"
  }
};

function changeLanguage(lang) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translations[lang][key];
      } else {
        el.innerText = translations[lang][key];
      }
    }
  });
  localStorage.setItem('sacco_lang', lang);
}

function initLanguage() {
  const savedLang = localStorage.getItem('sacco_lang') || 'en';
  const select = document.getElementById('languageSelect');
  if (select) {
    select.value = savedLang;
    select.addEventListener('change', (e) => changeLanguage(e.target.value));
  }
  changeLanguage(savedLang);
}

// ==================== INITIALIZE EVERYTHING ====================
document.addEventListener('DOMContentLoaded', () => {
  updateStatCards();
  initCharts();
  initSidebar();
  initLanguage();
});
