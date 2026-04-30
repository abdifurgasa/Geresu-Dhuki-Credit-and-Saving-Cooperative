/* =========================
   GET ROLE SAFELY
========================= */
function getRole() {
  return localStorage.getItem("role") || "guest";
}

/* =========================
   SIDEBAR ACCESS CONTROL
========================= */
function applyRoleAccess() {

  const role = getRole();

  document.querySelectorAll(".menu li").forEach(item => {

    const roles = item.getAttribute("data-role");

    if (!roles) return;

    const allowedRoles = roles.split(" ");

    if (allowedRoles.includes(role)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }

  });

}

/* =========================
   ACTIVE MENU FIX
========================= */
function setActiveMenu() {

  const page = window.location.pathname.split("/").pop();

  document.querySelectorAll(".menu li").forEach(item => {

    const link = item.querySelector("a");

    if (!link) return;

    if (link.getAttribute("href") === page) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }

  });

}

/* =========================
   PAGE PROTECTION (IMPORTANT FIX)
========================= */
function protectPage() {

  const role = getRole();
  const page = window.location.pathname.split("/").pop();

  const accessRules = {
    "dashboard.html": ["admin", "cashier", "member"],
    "members.html": ["admin", "cashier"],
    "savings.html": ["admin", "cashier", "member"],
    "loans.html": ["admin", "cashier"],
    "transactions.html": ["admin", "cashier"],
    "reports.html": ["admin"],
    "settings.html": ["admin", "cashier", "member"]
  };

  const allowed = accessRules[page];

  if (!allowed) return;

  if (!allowed.includes(role)) {
    document.body.innerHTML = `
      <div style="
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
        font-family:sans-serif;
        background:#f4f6f9;
      ">
        <div style="text-align:center;">
          <h1 style="color:red;">Access Denied</h1>
          <p>You do not have permission to view this page.</p>
          <a href="dashboard.html">Go Back</a>
        </div>
      </div>
    `;
  }
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  applyRoleAccess();
  setActiveMenu();
  protectPage();
});
