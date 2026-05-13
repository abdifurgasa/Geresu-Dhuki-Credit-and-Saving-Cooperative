/* =========================
   LANGUAGES
========================= */

const translations = {

  EN: {

    dashboard: "Dashboard",
    members: "Members",
    savings: "Savings",
    loans: "Loans",
    repayments: "Repayments",
    transactions: "Transactions",
    withdrawals: "Withdrawals",
    reports: "Reports",
    users: "Users",
    settings: "Settings",

    overview: "DASHBOARD OVERVIEW",

    welcome:
      "Welcome to SACCO Banking System",

    totalMembers: "Total Members",
    totalSavings: "Total Savings",
    totalLoans: "Total Loans",
    netProfit: "Net Profit",

    addMember: "Add Member",
    depositSavings: "Deposit Savings",
    createLoan: "Create Loan",

    logout: "Logout"
  },

  AM: {

    dashboard: "ዳሽቦርድ",
    members: "አባላት",
    savings: "ቁጠባ",
    loans: "ብድር",
    repayments: "ክፍያ",
    transactions: "ግብይቶች",
    withdrawals: "ወጪ",
    reports: "ሪፖርቶች",
    users: "ተጠቃሚዎች",
    settings: "ቅንብሮች",

    overview:
      "የዳሽቦርድ አጠቃላይ እይታ",

    welcome:
      "ወደ SACCO ስርዓት እንኳን በደህና መጡ",

    totalMembers: "ጠቅላላ አባላት",
    totalSavings: "ጠቅላላ ቁጠባ",
    totalLoans: "ጠቅላላ ብድር",
    netProfit: "የተጣራ ትርፍ",

    addMember: "አባል ጨምር",
    depositSavings: "ቁጠባ አስገባ",
    createLoan: "ብድር ፍጠር",

    logout: "ውጣ"
  },

  OR: {

    dashboard: "Daashboordii",
    members: "Miseensota",
    savings: "Qusannaa",
    loans: "Liqii",
    repayments: "Kaffaltii",
    transactions: "Daddabarsa",
    withdrawals: "Baasii",
    reports: "Ripoortii",
    users: "Fayyadamtoota",
    settings: "Qindaa'ina",

    overview:
      "Haala Waliigalaa Daashboordii",

    welcome:
      "Baga gara SACCO dhuftan",

    totalMembers:
      "Miseensota Waliigalaa",

    totalSavings:
      "Qusannaa Waliigalaa",

    totalLoans:
      "Liqii Waliigalaa",

    netProfit:
      "Bu'aa Qulqulluu",

    addMember:
      "Miseensa Dabali",

    depositSavings:
      "Qusannaa Galchi",

    createLoan:
      "Liqii Uumi",

    logout: "Ba'i"
  }
};

/* =========================
   APPLY LANGUAGE
========================= */

function applyLanguage(lang) {

  const elements =
    document.querySelectorAll("[data-i18n]");

  elements.forEach(el => {

    const key =
      el.getAttribute("data-i18n");

    if (
      translations[lang]
      &&
      translations[lang][key]
    ) {

      el.textContent =
        translations[lang][key];
    }
  });

  localStorage.setItem("lang", lang);
}

/* =========================
   GLOBAL CHANGE FUNCTION
========================= */

window.changeLang =
  function(lang) {

    applyLanguage(lang);
  };

/* =========================
   INIT
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const savedLang =
      localStorage.getItem("lang")
      || "EN";

    const select =
      document.getElementById(
        "langSelect"
      );

    if (select) {

      select.value = savedLang;
    }

    applyLanguage(savedLang);
  }
);
