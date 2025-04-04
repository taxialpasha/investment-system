// ...existing code...
// استيراد الوحدات
import * as UI from './ui.js';
import * as Data from './data.js';
import * as Utils from './utils.js';

// عرض حاسبة الأرباح
function showProfitCalculator() {
    document.getElementById('calc-investment-amount').value = '';
    document.getElementById('calc-profit-rate').value = Data.profitRate;
    document.getElementById('calc-duration').value = 12;
    document.getElementById('calc-monthly-profit').textContent = '- - -';
    document.getElementById('calc-total-profit').textContent = '- - -';
    
    UI.showModal('profit-calculator-modal');
    
    document.getElementById('close-calculator-modal').onclick = () => UI.hideModal('profit-calculator-modal');
    
    document.getElementById('calc-profits-btn').onclick = () => {
        calculateProfits();
    };
}

// حساب الأرباح في الحاسبة
function calculateProfits() {
    const amount = parseFloat(document.getElementById('calc-investment-amount').value);
    const rate = parseFloat(document.getElementById('calc-profit-rate').value);
    const duration = parseInt(document.getElementById('calc-duration').value);
    
    if (isNaN(amount) || isNaN(rate) || isNaN(duration)) {
        UI.showNotification('الرجاء إدخال قيم صحيحة', 'error');
        return;
    }
    
    const monthlyProfit = (amount / 1000000) * rate * 1000;
    const totalProfit = monthlyProfit * duration;
    
    document.getElementById('calc-monthly-profit').textContent = `${Utils.numberWithCommas(monthlyProfit)} د.ع`;
    document.getElementById('calc-total-profit').textContent = `${Utils.numberWithCommas(totalProfit)} د.ع`;
}

// عرض صفحة التقارير
function renderReportsPage() {
    const mainContent = document.getElementById('main-content');
    
    // حساب إجمالي الاستثمارات
    const totalInvestments = Data.transactions
        .filter(trans => trans.type === 'investment')
        .reduce((sum, trans) => sum + trans.amount, 0);
    
    // حساب إجمالي المدفوعات للأرباح
    const totalPayouts = Data.transactions
        .filter(trans => trans.type === 'payout')
        .reduce((sum, trans) => sum + trans.amount, 0);
    
    // حساب إجمالي المصروفات الإدارية
    const totalAdminExpenses = Data.transactions
        .filter(trans => trans.type === 'admin')
        .reduce((sum, trans) => sum + trans.amount, 0);
    
    // حساب عدد المستثمرين النشطين
    const activeInvestors = Data.investors.length;
    
    // حساب إجمالي الأرباح الشهرية المتوقعة
    const totalMonthlyProfit = Data.investors.reduce(
        (sum, inv) => sum + Utils.calculateMonthlyProfit(inv.amount, Data.profitRate), 
        0
    );
    
    // حساب توزيع المعاملات حسب النوع
    const transactionsByType = {};
    Data.transactions.forEach(trans => {
        if (!transactionsByType[trans.type]) {
            transactionsByType[trans.type] = {
                count: 0,
                amount: 0
            };
        }
        transactionsByType[trans.type].count++;
        transactionsByType[trans.type].amount += trans.amount;
    });
    
    // حساب معاملات الشهر الحالي
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = Data.transactions.filter(trans => {
        const transDate = new Date(trans.date);
        return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
    });
    
    const currentMonthInvestments = currentMonthTransactions
        .filter(trans => trans.type === 'investment')
        .reduce((sum, trans) => sum + trans.amount, 0);
        
    const currentMonthPayouts = currentMonthTransactions
        .filter(trans => trans.type === 'payout')
        .reduce((sum, trans) => sum + trans.amount, 0);
    
    let html = `
        <div class="container animate-fadeIn">
          <h1 class="text-xl font-bold mb-4">التقارير</h1>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="card p-4">
              <h2 class="font-bold mb-3 flex items-center gap-2">
                <i class="fas fa-chart-pie text-blue-600"></i>
                ملخص الاستثمارات
              </h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">إجمالي الاستثمارات</p>
                  <p class="font-bold text-lg">${Utils.numberWithCommas(totalInvestments)} د.ع</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">إجمالي الأرباح المدفوعة</p>
                  <p class="font-bold text-lg">${Utils.numberWithCommas(totalPayouts)} د.ع</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">المصروفات الإدارية</p>
                  <p class="font-bold text-lg">${Utils.numberWithCommas(totalAdminExpenses)} د.ع</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">عدد المستثمرين</p>
                  <p class="font-bold text-lg">${activeInvestors}</p>
                </div>
              </div>
            </div>
            
            <div class="card p-4">
              <h2 class="font-bold mb-3 flex items-center gap-2">
                <i class="fas fa-calendar-alt text-green-600"></i>
                الشهر الحالي (${Utils.getCurrentMonthName()})
              </h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">استثمارات الشهر</p>
                  <p class="font-bold text-lg">${Utils.numberWithCommas(currentMonthInvestments)} د.ع</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">مدفوعات الشهر</p>
                  <p class="font-bold text-lg">${Utils.numberWithCommas(currentMonthPayouts)} د.ع</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">عدد المعاملات</p>
                  <p class="font-bold text-lg">${currentMonthTransactions.length}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">رصيد الشهر</p>
                  <p class="font-bold text-lg">${Utils.numberWithCommas(currentMonthInvestments - currentMonthPayouts)} د.ع</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card p-4 mb-4">
            <h2 class="font-bold mb-3 flex items-center gap-2">
              <i class="fas fa-percentage text-yellow-600"></i>
              الأرباح الشهرية المتوقعة
            </h2>
            <div class="flex justify-between items-center">
              <div>
                <p class="font-bold text-xl text-green-600">
                  ${Utils.numberWithCommas(totalMonthlyProfit)} د.ع
                </p>
                <p class="text-sm text-gray-500">
                  إجمالي مبلغ الأرباح المتوقع دفعه شهريًا لجميع المستثمرين
                </p>
              </div>
              <div class="text-right">
                <p class="font-bold">نسبة الربح الحالية</p>
                <p class="text-xl text-blue-600">${Data.profitRate}%</p>
              </div>
            </div>
          </div>
          
          <div class="card p-4">
            <h2 class="font-bold mb-3 flex items-center gap-2">
              <i class="fas fa-trophy text-yellow-600"></i>
              أعلى المستثمرين
            </h2>
      `;
      
      if (Data.investors.length > 0) {
        const topInvestors = [...Data.investors]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
            
        topInvestors.forEach((investor, index) => {
            html += `
              <div class="list-item">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <span class="badge badge-primary">${index + 1}</span>
                    <div>
                      <p class="font-bold">${investor.name}</p>
                      <p class="text-xs text-gray-500">منذ ${Utils.formatDate(investor.startDate)}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-bold">${Utils.numberWithCommas(investor.amount)} د.ع</p>
                    <p class="text-sm text-green-600">${Utils.numberWithCommas(Utils.calculateMonthlyProfit(investor.amount, Data.profitRate))} د.ع شهريًا</p>
                  </div>
                </div>
              </div>
            `;
        });
      } else {
        html += `
          <div class="flex flex-col items-center justify-center py-6">
            <i class="fas fa-users text-gray-400 text-3xl mb-2"></i>
            <p class="text-gray-500">لا يوجد مستثمرين</p>
          </div>
        `;
      }
      
      html += `
          </div>
        </div>
      `;
      
      mainContent.innerHTML = html;
}

// تصدير الوظائف
export {
    showProfitCalculator,
    calculateProfits,
    renderReportsPage
};