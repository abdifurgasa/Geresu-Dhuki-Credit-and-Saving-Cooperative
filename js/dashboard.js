import "./realtime-engine.js";

/* =========================
   SIDEBAR TOGGLE
========================= */

const sidebar = document.getElementById("sidebar");

window.toggleSidebar = function () {
  sidebar.classList.toggle("collapsed");
  localStorage.setItem(
    "sidebar",
    sidebar.classList.contains("collapsed") ? "collapsed" : "expanded"
  );
};

/* =========================
   CHART ENGINE HOOK
========================= */

window.renderCharts = function (state) {

  const ctx = document.getElementById("dashboardChart");
  const ctx2 = document.getElementById("repaymentChart");

  if (!ctx || !ctx2) return;

  /* SIMPLE CHART (OVERVIEW) */
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Members", "Savings", "Loans"],
      datasets: [{
        label: "Overview",
        data: [
          state.members.length,
          state.savings.reduce((t,i)=>t+Number(i.amount||0),0),
          state.loans.reduce((t,i)=>t+Number(i.principal||0),0)
        ]
      }]
    }
  });

  /* LOANS VS REPAYMENTS */
  new Chart(ctx2, {
    type: "line",
    data: {
      labels: ["Loans", "Repayments"],
      datasets: [{
        label: "Flow",
        data: [
          state.loans.reduce((t,i)=>t+Number(i.principal||0),0),
          state.repayments.reduce((t,i)=>t+Number(i.amount||0),0)
        ]
      }]
    }
  });
};
