// =========================
// SIDEBAR TOGGLE + PERSISTENCE
// =========================

const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.querySelector(".toggle-btn");

// Load saved state
document.addEventListener("DOMContentLoaded", () => {

  const savedState = localStorage.getItem("sidebar");

  if (savedState === "collapsed") {
    sidebar.classList.add("collapsed");
  }

  setActiveMenu();

});

// Toggle
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {

    sidebar.classList.toggle("collapsed");

    if (sidebar.classList.contains("collapsed")) {
      localStorage.setItem("sidebar", "collapsed");
    } else {
      localStorage.setItem("sidebar", "expanded");
    }

  });
}

// =========================
// ACTIVE MENU HIGHLIGHT
// =========================

function setActiveMenu() {

  const currentPage = window.location.pathname.split("/").pop();

  document.querySelectorAll(".menu li").forEach(item => {

    const page = item.getAttribute("data-page");

    if (page === currentPage) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }

  });

}
