/* =========================
   MULTI LANGUAGE SYSTEM
========================= */

/* CURRENT LANGUAGE */
let currentLang =
  localStorage.getItem("language") || "EN";

/* =========================
   TRANSLATIONS
========================= */

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
    transactions: "Transactions",
    reports: "Reports",
    users: "Users",
    settings: "Settings",
    logout: "Logout",

    overview: "Dashboard Overview",

    welcome:
      "Welcome to SACCO Management System",

    totalMembers: "Total Members",
    totalSavings: "Total Savings",
    totalLoans: "Total Loans",
    totalProfit: "Net Profit",

    addMember: "Add Member",
    depositSavings: "Deposit Savings",
    createLoan: "Create Loan",
    viewReports: "View Reports",

    financialAnalytics:
      "Financial Analytics",

    loanRepaymentAnalytics:
      "Loans vs Repayments"
  },

  /* =========================
     AMHARIC
  ========================= */

  AM: {

    dashboard: "ዳሽቦርድ",
    members: "አባላት",
    savings: "ቁጠባ",
    loans: "ብድር",
    repayments: "ክፍያ",
    transactions: "ግብይቶች",
    reports: "ሪፖርቶች",
    users: "ተጠቃሚዎች",
    settings: "ማስተካከያ",
    logout: "ውጣ",

    overview: "የዳሽቦርድ አጠቃላይ",

    welcome:
      "ወደ SACCO ስርዓት እንኳን በደህና መጡ",

    totalMembers: "ጠቅላላ አባላት",
    totalSavings: "ጠቅላላ ቁጠባ",
    totalLoans: "ጠቅላላ ብድር",
    totalProfit: "የተጣራ ትርፍ",

    addMember: "አባል ጨምር",
    depositSavings: "ቁጠባ አስገባ",
    createLoan: "ብድር ፍጠር",
    viewReports: "ሪፖርት እይ",

    financialAnalytics:
      "የፋይናንስ ትንታኔ",

    loanRepaymentAnalytics:
      "ብድር እና ክፍያ"
  },

  /* =========================
     OROMO
  ========================= */

  OR: {

    dashboard: "Daashboordii",
    members: "Miseensota",
    savings: "Qusannaa",
    loans: "Liqii",
    repayments: "Kaffaltii",
    transactions: "Sochii Maallaqaa",
    reports: "Ripoortii",
    users: "Fayyadamtoota",
    settings: "Qindaa'ina",
    logout: "Ba'i",

    overview: "Haala Waliigalaa",

    welcome:
      "Baga nagaan gara SACCO dhuftan",

    totalMembers: "Baay'ina Miseensotaa",
    totalSavings: "Qusannaa Waliigalaa",
    totalLoans: "Liqii Waliigalaa",
    totalProfit: "Bu'aa Waliigalaa",

    addMember: "Miseensa Dabali",
    depositSavings: "Qusannaa Galchi",
    createLoan: "Liqii Uumi",
    viewReports: "Ripoortii Ilaali",

    financialAnalytics:
      "Xiinxala Faayinaansii",

    loanRepaymentAnalytics:
      "Liqii fi Kaffaltii"
  }
};

/* =========================
   APPLY TRANSLATIONS
========================= */

function applyTranslations() {

  document.querySelectorAll("[data-i18n]")
    .forEach(el => {

      const key =
        el.getAttribute("data-i18n");

      if (
        translations[currentLang] &&
        translations[currentLang][key]
      ) {

        el.innerText =
          translations[currentLang][key];
      }
    });

  /* SAVE LANGUAGE */
  localStorage.setItem(
    "language",
    currentLang
  );

  /* UPDATE SELECT */
  const select =
    document.getElementById("langSelect");

  if (select) {
    select.value = currentLang;
  }
}

/* =========================
   CHANGE LANGUAGE
========================= */

window.changeLang = function (lang) {

  currentLang = lang;

  applyTranslations();
};

/* =========================
   AUTO LOAD
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    applyTranslations();

    const select =
      document.getElementById("langSelect");

    if (select) {

      select.addEventListener(
        "change",
        function () {

          changeLang(this.value);
        }
      );
    }
  }
);
