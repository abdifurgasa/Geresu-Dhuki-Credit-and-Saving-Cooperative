
export function loadCharts(data) {

  const ctx =
    document.getElementById("financeChart");

  new Chart(ctx, {

    type: "bar",

    data: {

      labels: ["Savings", "Loans", "Repayments"],

      datasets: [{

        label: "ETB",

        data: [
          data.savings,
          data.loans,
          data.repayments
        ]
      }]
    }
  });
}
