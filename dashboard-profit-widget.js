// ...existing code...
function initProfitWidget(transactions, investors) {
  const dashboard = document.getElementById('dashboard-profit-section');
  if (!dashboard) return;
  // For demo purposes, pick the first investor; adjust as needed.
  const investor = investors[0];
  if (!investor) {
    dashboard.innerHTML = '<p>لا يوجد بيانات لعرض الربح</p>';
    return;
  }
  const today = new Date();
  window.uiIntegration.updateProfitWidget(investor.id, today.getFullYear(), today.getMonth() + 1, transactions);
}

window.dashboardProfitWidget = {
  init: initProfitWidget
};
// ...existing code...
