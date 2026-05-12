/* =========================
   LANGUAGE DATA
========================= */

const translations = {

  EN: {

    dashboard: "Dashboard",
    members: "Members",
    savings: "Savings",
    loans: "Loans",
    repayments: "Repayments",
    transactions: "Transactions",
    reports: "Reports",
    users: "Users",
    settings: "Settings",

    overview: "DASHBOARD OVERVIEW",
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
    loansVsRepayments: "Loans vs Repayments",

    logout: "Logout"
  },

  AM: {

    dashboard: "ዳሽቦርድ",
    members: "አባላት",
    savings: "ቁጠባ",
    loans: "ብድር",
    repayments: "ክፍያ",
    transactions: "ግብይቶች",
    reports: "ሪፖርቶች",
    users: "ተጠቃሚዎች",
    settings: "ቅንብሮች",

    overview: "የዳሽቦርድ አጠቃላይ እይታ",
    welcome: "ወደ SACCO የባንክ ስርዓት እንኳን በደህና መጡ",

    totalMembers: "ጠቅላላ አባላት",
    totalSavings: "ጠቅላላ ቁጠባ",
    totalLoans: "ጠቅላላ ብድር",
    netProfit: "የተጣራ ትርፍ",

    quickActions: "ፈጣን እርምጃዎች",

    addMember: "አባል ጨምር",
    depositSavings: "ቁጠባ አስገባ",
    createLoan: "ብድር ፍጠር",

    financialAnalytics: "የፋይናንስ ትንታኔ",
    loansVsRepayments: "ብድር እና ክፍያ",

    logout: "ውጣ"
  },

  OR: {

    dashboard: "Daashboordii",
    members: "Miseensota",
    savings: "Qusannaa",
    loans: "Liqii",
    repayments: "Kaffaltii",
    transactions: "Daldala",
    reports: "Ripoortii",
    users: "Fayyadamtoota",
    settings: "Qindaa'ina",

    overview: "Haala Waliigalaa Daashboordii",
    welcome: "Baga gara Sirna Baankii SACCO dhuftan",

    totalMembers: "Miseensota Waliigalaa",
    totalSavings: "Qusannaa Waliigalaa",
    totalLoans: "Liqii Waliigalaa",
    netProfit: "Bu'aa Qulqulluu",

    quickActions: "Gocha Ariifachiisaa",

    addMember: "Miseensa Dabali",
    depositSavings: "Qusannaa Galchi",
    createLoan: "Liqii Uumi",

    financialAnalytics: "Xiinxala Faayinaansii",
    loansVsRepayments: "Liqii fi Kaffaltii",

    logout: "Ba'i"
  }
};

/* =========================
   CHANGE LANGUAGE
========================= */

window.changeLang = function(lang) {

  localStorage.setItem("lang", lang);

  const t = translations[lang];

  /* SIDEBAR */

  const navTexts =
    document.querySelectorAll(".nav .text");

  if (navTexts.length >= 8) {

    navTexts[0].innerText = t.dashboard;
    navTexts[1].innerText = t.members;
    navTexts[2].innerText = t.savings;
    navTexts[3].innerText = t.loans;
    navTexts[4].innerText = t.repayments;
    navTexts[5].innerText = t.transactions;
    navTexts[6].innerText = t.reports;
    navTexts[7].innerText = t.users;

    if (navTexts[8]) {
      navTexts[8].innerText = t.settings;
    }
  }

  /* HEADER */

  const h1 =
    document.querySelector("h1");

  if (h1)
    h1.innerText = t.overview;

  /* WELCOME */

  const welcome =
    document.querySelector("p");

  if (welcome)
    welcome.innerText = t.welcome;

  /* CARDS */

  const h3 =
    document.querySelectorAll(".card h3");

  if (h3.length >= 7) {

    h3[0].innerText = t.totalMembers;
    h3[1].innerText = t.totalSavings;
    h3[2].innerText = t.totalLoans;
    h3[3].innerText = t.netProfit;

    h3[4].innerText = t.addMember;
    h3[5].innerText = t.depositSavings;
    h3[6].innerText = t.createLoan;

    if (h3[7]) {
      h3[7].innerText = "Reports";
    }
  }

  /* LOGOUT */

  const logoutBtn =
    document.querySelector(".btn.danger");

  if (logoutBtn)
    logoutBtn.innerText = t.logout;
};

/* =========================
   LOAD SAVED LANGUAGE
========================= */

window.addEventListener(
  "DOMContentLoaded",
  () => {

    const saved =
      localStorage.getItem("lang") || "EN";

    document.getElementById(
      "langSelect"
    ).value = saved;

    changeLang(saved);
  }
);
