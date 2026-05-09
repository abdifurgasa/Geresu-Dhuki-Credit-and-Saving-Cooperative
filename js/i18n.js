const translations = {
  EN: {
    dashboard: "Dashboard",
    overview: "Dashboard Overview",
    welcome: "Welcome back! Here's what's happening with your SACCO today.",
    members: "Members",
    savings: "Savings",
    loans: "Loans",
    reports: "Reports",
    transactions: "Transactions",
    settings: "Settings",
    login: "Login",
    logout: "Logout",
    totalMembers: "Total Members",
    totalSavings: "Total Savings",
    totalLoans: "Total Loans",
    totalProfit: "Total Profit"
  },

  AM: {
    dashboard: "ዳሽቦርድ",
    overview: "የዳሽቦርድ እይታ",
    welcome: "እንኳን ደህና መጡ! ዛሬ የሚከናወኑ ነገሮች እነዚህ ናቸው።",
    members: "አባላት",
    savings: "ቁጠባ",
    loans: "ብድር",
    reports: "ሪፖርቶች",
    transactions: "ግብይቶች",
    settings: "ቅንብሮች",
    login: "ግባ",
    logout: "ውጣ",
    totalMembers: "ጠቅላላ አባላት",
    totalSavings: "ጠቅላላ ቁጠባ",
    totalLoans: "ጠቅላላ ብድር",
    totalProfit: "ጠቅላላ ትርፍ"
  },

  OR: {
    dashboard: "Daashboordii",
    overview: "Ilaalcha Daashboordii",
    welcome: "Baga nagaan dhuftan! Kun wanta har'a raawwatamaa jiru.",
    members: "Miseensota",
    savings: "Qusannaa",
    loans: "Liqii",
    reports: "Gabaasa",
    transactions: "Sochii Daddabarsaa",
    settings: "Qindaa'ina",
    login: "Seeni",
    logout: "Ba'i",
    totalMembers: "Miseensota Waliigala",
    totalSavings: "Qusannaa Waliigala",
    totalLoans: " Liqii Waliigala",
    totalProfit: "Bu'aa Waliigala"
  }
};

let currentLang = localStorage.getItem("lang") || "EN";

/* APPLY */
function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.innerText = translations[currentLang]?.[key] || key;
  });

  const langSelect = document.getElementById("langSelect");
  if (langSelect) langSelect.value = currentLang;
}

/* CHANGE LANGUAGE */
function changeLang(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyTranslations();
}

document.addEventListener("DOMContentLoaded", applyTranslations);

window.changeLang = changeLang;
