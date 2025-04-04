// ...existing code...
// استيراد الوحدات
import * as UI from './ui.js';
import * as Data from './data.js';
import * as Utils from './utils.js';
import * as Main from './main.js';
import * as Investors from './investors.js';

// إضافة معاملة جديدة
function addTransaction() {
    const investorId = document.getElementById('transaction-investor-id').value;
    const type = document.getElementById('transaction-type').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const date = document.getElementById('transaction-date').value || Utils.getCurrentDate();
    const notes = document.getElementById('transaction-notes').value;
    
    // التحقق من صحة البيانات
    if (!investorId || isNaN(amount) || amount <= 0) {
        UI.showNotification('الرجاء تحديد المستثمر والمبلغ', 'error');
        return;
    }
    
    const transaction = {
        id: Date.now().toString(),
        investorId,
        type,
        amount,
        date,
        notes
    };
    
    Data.transactions.push(transaction);
    
    // تحديث ملخص اليوم
    if (type === 'investment') {
        Data.dailySummary.totalInvestments += amount;
        
        // تحديث مبلغ المستثمر في حالة إضافة استثمار جديد
        const investor = Data.investors.find(inv => inv.id === investorId);
        if (investor) {
            investor.amount += amount;
            
            // تحديث المستثمر المحدد إذا كان هو نفسه
            if (Main.selectedInvestor && Main.selectedInvestor.id === investorId) {
                Main.selectedInvestor = investor;
            }
        }
    } else {
        Data.dailySummary.totalPayouts += amount;
    }
    
    // إعادة حساب الإشعارات
    Data.calculateUpcomingPayments();
    
    // حفظ البيانات في التخزين المحلي
    Data.saveData();
    
    // إغلاق النموذج
    UI.hideModal('add-transaction-modal');
    
    // تحديث الواجهة
    if (Main.selectedInvestor && Main.selectedInvestor.id === investorId) {
        Investors.renderInvestorDetailsPage();
    } else if (Main.currentPage === 'transactions') {
        renderTransactionsPage();
    } else if (Main.currentPage === 'home') {
        UI.renderHomePage();
    }
    
    const typeName = type === 'investment' ? 'استثمار' : 'دفع ربح';
    UI.showNotification(`تم تسجيل ${typeName} بمبلغ ${Utils.numberWithCommas(amount)} د.ع بنجاح`, 'success');
}

// إضافة مصروف إداري
function addAdminExpense(amount, note) {
    const expense = {
        id: Date.now().toString(),
        type: 'admin',
        amount,
        date: Utils.getCurrentDate(),
        notes: note || 'مصروف إداري'
    };
    
    Data.transactions.push(expense);
    Data.dailySummary.adminExpenses += amount;
    
    // حفظ البيانات
    Data.saveData();
    
    // تحديث الواجهة إذا كان المستخدم في صفحة المعاملات
    if (Main.currentPage === 'transactions') {
        renderTransactionsPage();
    } else if (Main.currentPage === 'reports') {
        import('./reports.js').then(reports => {
            reports.renderReportsPage();
        });
    }
}

// إظهار نموذج إضافة معاملة جديدة
function showAddTransactionModal(type, investor = null) {
    // تعيين عنوان النموذج
    document.getElementById('transaction-modal-title').textContent = 
        type === 'investment' ? 'إضافة استثمار جديد' : 'تسجيل دفع ربح';
    
    // تعيين نوع المعاملة
    document.getElementById('transaction-type').value = type;
    
    // تعبئة قائمة المستثمرين
    const investorSelect = document.getElementById('transaction-investor-id');
    
    // مسح القائمة الحالية
    while (investorSelect.firstChild) {
        investorSelect.removeChild(investorSelect.firstChild);
    }
    
    // إضافة خيار افتراضي
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'اختر المستثمر';
    investorSelect.appendChild(defaultOption);
    
    // إضافة المستثمرين
    for (const inv of Data.investors) {
        const option = document.createElement('option');
        option.value = inv.id;
        option.textContent = inv.name;
        investorSelect.appendChild(option);
    }
    
    // إذا كان هناك مستثمر محدد
    if (investor) {
        investorSelect.value = investor.id;
        investorSelect.disabled = true;
        
        // إذا كان تسجيل ربح، تعيين المبلغ تلقائيًا
        if (type === 'payout') {
            document.getElementById('transaction-amount').value = Utils.calculateMonthlyProfit(investor.amount, Data.profitRate);
        } else {
            document.getElementById('transaction-amount').value = '';
        }
    } else {
        investorSelect.disabled = false;
        document.getElementById('transaction-amount').value = '';
    }
    
    // تعيين التاريخ الافتراضي لليوم
    document.getElementById('transaction-date').value = Utils.getCurrentDate();
    document.getElementById('transaction-notes').value = '';
    
    // إظهار النموذج
    UI.showModal('add-transaction-modal');
    
    // إعادة تعيين مستمعي الأحداث للأزرار
    document.getElementById('cancel-add-transaction').onclick = () => UI.hideModal('add-transaction-modal');
    document.getElementById('close-transaction-modal').onclick = () => UI.hideModal('add-transaction-modal');
    document.getElementById('confirm-add-transaction').onclick = addTransaction;
}

// عرض صفحة المعاملات
function renderTransactionsPage() {
    const mainContent = document.getElementById('main-content');
    
    // تصنيف المعاملات حسب التاريخ (الأحدث أولاً)
    const sortedTransactions = [...Data.transactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    let html = `
        <div class="container animate-fadeIn">
          <h1 class="text-xl font-bold mb-4">المعاملات</h1>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div class="stats-card stats-card-primary">
              <div class="icon-bg">
                <i class="fas fa-coins"></i>
              </div>
              <p class="text-sm text-gray-500">إجمالي الاستثمارات</p>
              <p class="font-bold text-lg">${Utils.numberWithCommas(Data.dailySummary.totalInvestments)} د.ع</p>
            </div>
            
            <div class="stats-card stats-card-secondary">
              <div class="icon-bg">
                <i class="fas fa-hand-holding-usd"></i>
              </div>
              <p class="text-sm text-gray-500">إجمالي المدفوعات</p>
              <p class="font-bold text-lg">${Utils.numberWithCommas(Data.dailySummary.totalPayouts)} د.ع</p>
            </div>
            
            <div class="stats-card stats-card-danger">
              <div class="icon-bg">
                <i class="fas fa-file-invoice-dollar"></i>
              </div>
              <p class="text-sm text-gray-500">المصروفات الإدارية</p>
              <p class="font-bold text-lg">${Utils.numberWithCommas(Data.dailySummary.adminExpenses)} د.ع</p>
            </div>
          </div>
          
          <div class="flex justify-between gap-2 mb-4">
            <button 
              class="flex-1 btn btn-secondary"
              id="add-payout-all-btn"
            >
              <i class="fas fa-dollar-sign ml-1"></i>
              تسجيل دفع
            </button>
            <button 
              class="flex-1 btn btn-primary"
              id="add-investment-all-btn"
            >
              <i class="fas fa-plus ml-1"></i>
              تسجيل استثمار
            </button>
          </div>
          
          <div class="search-container">
            <input 
              type="text" 
              id="transaction-search"
              placeholder="بحث في المعاملات..." 
              class="search-input"
            />
            <i class="fas fa-search search-icon"></i>
          </div>
          
          <div class="card">
      `;
      
      if (sortedTransactions.length > 0) {
        for (const transaction of sortedTransactions) {
          const investor = Data.investors.find(inv => inv.id === transaction.investorId);
          
          html += `
            <div class="list-item transaction-item" data-type="${transaction.type}">
              <div class="flex justify-between items-center">
                <div>
                  <div class="flex items-center gap-2">
                    <i class="fas ${Utils.getTransactionIcon(transaction.type)} ${Utils.getTransactionColorClass(transaction.type)}"></i>
                    <div>
                      <p class="font-bold">${investor ? investor.name : 'مصروف إداري'}</p>
                      <p class="text-sm text-gray-500">${Utils.formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">${transaction.notes || ''}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold ${Utils.getTransactionColorClass(transaction.type)}">
                    ${transaction.type === 'payout' || transaction.type === 'admin' ? '-' : '+'}
                    ${Utils.numberWithCommas(transaction.amount)} د.ع
                  </p>
                  <p class="text-xs badge ${Utils.getTransactionBadgeClass(transaction.type)}">
                    ${Utils.getTransactionTypeName(transaction.type)}
                  </p>
                </div>
              </div>
            </div>
          `;
        }
      } else {
        html += `
          <div class="flex flex-col items-center justify-center py-10">
            <i class="fas fa-exchange-alt text-gray-400 text-5xl mb-3"></i>
            <p class="text-gray-500 mb-2">لا توجد معاملات مسجلة</p>
          </div>
        `;
      }
      
      html += `
          </div>
        </div>
      `;
      
      mainContent.innerHTML = html;
      
      // إضافة المستمعين للأحداث
      document.getElementById('add-payout-all-btn').addEventListener('click', () => {
        showAddTransactionModal('payout');
      });
      
      document.getElementById('add-investment-all-btn').addEventListener('click', () => {
        showAddTransactionModal('investment');
      });
      
      // إضافة البحث في المعاملات
      document.getElementById('transaction-search')?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const transactionItems = document.getElementsByClassName('transaction-item');
        
        Array.from(transactionItems).forEach(item => {
          const text = item.textContent.toLowerCase();
          
          if (text.includes(searchTerm)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
}

// تصدير الوظائف
export {
    addTransaction,
    addAdminExpense,
    showAddTransactionModal,
    renderTransactionsPage
};