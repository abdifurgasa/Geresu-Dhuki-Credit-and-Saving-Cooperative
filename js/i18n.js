const translations = {

/* =========================
   ENGLISH
========================= */
EN: {

  dashboard: "Dashboard",
  members: "Members",
  savings: "Savings",
  loans: "Loans",
  repayments: "Repayments",
  withdrawals: "Withdrawals",
  transactions: "Transactions",
  reports: "Reports",
  users: "Users",
  settings: "Settings",

  financialDashboard: "Financial Dashboard",
  overview: "Overview",
  welcome: "Welcome to SACCO Banking System",

  totalMembers: "Total Members",
  totalSavings: "Total Savings",
  totalLoans: "Total Loans",
  netProfit: "Net Profit",

  quickActions: "Quick Actions",
  addMember: "Add Member",
  depositSavings: "Deposit Savings",
  createLoan: "Create Loan",

  financialAnalytics: "Financial Analytics",
  loanVsRepayment: "Loans vs Repayments",

  logout: "Logout"

},

/* =========================
   AMHARIC
========================= */
AM: {

  dashboard: "ዳሽቦርድ",
  members: "አባላት",
  savings: "ቁጠባ",
  loans: "ብድር",
  repayments: "መመለሻ",
  withdrawals: "መውጫ",
  transactions: "ግብይቶች",
  reports: "ሪፖርቶች",
  users: "ተጠቃሚዎች",
  settings: "ቅንብሮች",

  financialDashboard: "የፋይናንስ ዳሽቦርድ",
  overview: "አጠቃላይ እይታ",
  welcome: "ወደ SACCO ስርዓት እንኳን ደህና መጡ",

  totalMembers: "ጠቅላላ አባላት",
  totalSavings: "ጠቅላላ ቁጠባ",
  totalLoans: "ጠቅላላ ብድር",
  netProfit: "ንጥረ ትርፍ",

  quickActions: "ፈጣን ተግባራት",
  addMember: "አባል አክል",
  depositSavings: "ቁጠባ አስገባ",
  createLoan: "ብድር ፍጠር",

  financialAnalytics: "የፋይናንስ ትንተና",
  loanVsRepayment: "ብድር እና መመለሻ",

  logout: "ውጣ"

},

/* =========================
   OROMO
========================= */
OR: {

  dashboard: "Daashboordii",
  members: "Miseensota",
  savings: "Qusannoo",
  loans: "Liizii",
  repayments: "Deebii",
  withdrawals: "Baafata",
  transactions: "Daldala",
  reports: "Gabaasa",
  users: "Fayyadamtoota",
  settings: "Sirna",

  financialDashboard: "Daashboordii Faayinaansii",
  overview: "Ilaalcha Waliigalaa",
  welcome: "Baga nagaan gara SACCO dhuftan",

  totalMembers: "Waliigala Miseensota",
  totalSavings: "Waliigala Qusannoo",
  totalLoans: "Waliigala Liizii",
  netProfit: "Bu’aa Netii",

  quickActions: "Gochoota Saffisaa",
  addMember: "Miseensa Dabaluu",
  depositSavings: "Qusannoo Galchuu",
  createLoan: "Liizii Uumuu",

  financialAnalytics: "Xiinxala Faayinaansii",
  loanVsRepayment: "Liizii vs Deebii",

  logout: "Ba’i"

}

};

/* =========================
   APPLY LANGUAGE
========================= */
function applyLanguage() {

  const lang = localStorage.getItem("lang") || "EN";

  document.querySelectorAll("[data-i18n]").forEach(el => {

    const key = el.getAttribute("data-i18n");

    const value = translations?.[lang]?.[key];

    if (value) {
      el.innerText = value;
    }

  });

}

/* =========================
   CHANGE LANGUAGE
========================= */
window.changeLang = function (lang) {

  localStorage.setItem("lang", lang);
  applyLanguage();

};

/* =========================
   INIT ON LOAD
========================= */
document.addEventListener("DOMContentLoaded", () => {
  applyLanguage();
});
