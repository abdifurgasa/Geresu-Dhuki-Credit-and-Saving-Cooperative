const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.querySelector(".toggle-btn");

// overlay
const overlay = document.querySelector(".overlay");

/* =========================
   LOAD STATE
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const saved = localStorage.getItem("sidebar");

  if (saved === "collapsed" && window.innerWidth > 768) {
    sidebar.classList.add("collapsed");
  }

  setActiveMenu();

});

/* =========================
   TOGGLE SIDEBAR
========================= */
toggleBtn.addEventListener("click", () => {

  if (window.innerWidth <= 768) {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
  } else {
    sidebar.classList.toggle("collapsed");

    localStorage.setItem(
      "sidebar",
      sidebar.classList.contains("collapsed") ? "collapsed" : "expanded"
    );
  }

});

/* =========================
   OVERLAY CLOSE
========================= */
overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
});

/* =========================
   ACTIVE MENU
========================= */
function setActiveMenu(){

  const current = window.location.pathname.split("/").pop();

  document.querySelectorAll(".menu li").forEach(li => {

    const page = li.getAttribute("data-page");

    if(page === current){
      li.classList.add("active");
    }

  });

}

/* =========================
   SUBMENU TOGGLE
========================= */
document.querySelectorAll(".has-submenu > a").forEach(menu => {

  menu.addEventListener("click", function(e){

    e.preventDefault();

    const parent = this.parentElement;

    // close others
    document.querySelectorAll(".has-submenu").forEach(item => {
      if(item !== parent){
        item.classList.remove("open");
      }
    });

    parent.classList.toggle("open");

  });

});
