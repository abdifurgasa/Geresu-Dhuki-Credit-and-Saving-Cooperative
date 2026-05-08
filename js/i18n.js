/* =========================
   LANGUAGE DATA
========================= */
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
    logout: "Logout",
    totalMembers: "Total Members",
    totalSavings: "Total Savings",
    totalLoans: "Total Loans",
    totalProfit: "Total Profit",
    recent: "Recent Transactions",
    quick: "Quick Actions"
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
    logout: "ውጣ",
    totalMembers: "ጠቅላላ አባላት",
    totalSavings: "ጠቅላላ ቁጠባ",
    totalLoans: "ጠቅላላ ብድር",
    totalProfit: "ጠቅላላ ትርፍ",
    recent: "የቅርብ ግብይቶች",
    quick: "ፈጣን እርምጃዎች"
  },

  OR: {
    dashboard: "Daashboordii",
    overview: "Ilaalcha Daashboordii",
    welcome: "Baga nagaan dhuftan! Kun wanta har'a raawwatamaa jiru.",
    members: "Miseensota",
    savings: "Kuusaa",
    loans: "Liqii",
    reports: "Ripoortii",
    transactions: "Sochii",
    settings: "Qindaa'ina",
    logout: "Ba'i",
    totalMembers: "Waliigala Miseensota",
    totalSavings: "Waliigala Kuusaa",
    totalLoans: "Waliigala Liqii",
    totalProfit: "Waliigala Bu'aa",
    recent: "Sochii Dhihoo",
    quick: "Tarkaanfii Ariifataa"
  }
};

/* =========================
   CURRENT LANGUAGE
========================= */
let currentLang = localStorage.getItem("lang") || "EN";

/* =========================
   APPLY TRANSLATION
========================= */
function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.innerText = translations[currentLang]?.[key] || key;
  });

  // SAFE (no crash if element not exists)
  const langText = document.getElementById("langText");
  if (langText) langText.innerText = currentLang;

  const langSelect = document.getElementById("langSelect");
  if (langSelect) langSelect.value = currentLang;
}

/* =========================
   CHANGE LANGUAGE (GLOBAL)
========================= */
function changeLang(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyTranslations();
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", applyTranslations);

/* =========================
   MAKE GLOBAL FOR HTML
========================= */
window.changeLang = changeLang;
