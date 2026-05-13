function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed");
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}
