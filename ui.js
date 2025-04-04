// ...existing code...
// استيراد الوحدات الأخرى
import * as Data from './data.js';
import * as Utils from './utils.js';
import * as Main from './main.js';

// عرض الصفحة الرئيسية
function renderHomePage() {
    const mainContent = document.getElementById('main-content');
    
    let html = `
      <div class="container animate-fadeIn">
        <h1 class="font-bold mb-6 text-center">لوحة التحكم</h1>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="stats-card stats-card-primary">
            <div class="icon-bg">
              <i class="fas fa-coins"></i>
            </div>
            <p class="text-sm text-gray-500">إجمالي الاستثمارات</p>
            <p class="text-xl font-bold">${Utils.numberWithCommas(Data.dailySummary.totalInvestments)} د.ع</p>
            <p class="text-xs text-blue-600 mt-1">${Data.investors.length} مستثمر</p>
          </div>
          
          <div class="stats-card stats-card-secondary">
            <div class="icon-bg">
              <i class="fas fa-hand-holding-usd"></i>
            </div>
            <p class="text-sm text-gray-500">إجمالي الأرباح المدفوعة</p>
            <p class="text-xl font-bold">${Utils.numberWithCommas(Data.dailySummary.totalPayouts)} د.ع</p>
            <p class="text-xs text-green-600 mt-1">
              ${Utils.getPayoutTransactionsCount(Data.transactions)} عملية دفع
            </p>
          </div>
          
          <div class="stats-card stats-card-accent">
            <div class="icon-bg">
              <i class="fas fa-percentage"></i>
            </div>
            <p class="text-sm text-gray-500">نسبة الربح الشهرية</p>
            <p class="text-xl font-bold">${Data.profitRate}%</p>
            <p class="text-xs text-yellow-600 mt-1">لكل مليون د.ع</p>
          </div>
          
          <div class="stats-card stats-card-danger">
            <div class="icon-bg">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <p class="text-sm text-gray-500">المصروفات الإدارية</p>
            <p class="text-xl font-bold">${Utils.numberWithCommas(Data.dailySummary.adminExpenses)} د.ع</p>
            <p class="text-xs text-red-600 mt-1">
              ${Utils.getAdminExpensesCount(Data.transactions)} مصروف
            </p>
          </div>
        </div>
        
        <div class="flex justify-between items-center mb-2">
          <h2 class="font-bold">الإشعارات والمدفوعات القادمة</h2>
          <span class="badge badge-primary">${Data.notifications.length}</span>
        </div>
        
        <div class="card mb-6">
    `;
    
    if (Data.notifications.length > 0) {
      for (const notification of Data.notifications) {
        html += `
          <div class="list-item">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-bold">${notification.name}</p>
                <p class="text-sm text-gray-500">تاريخ الدفع: ${Utils.formatDate(notification.date)}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-green-600">${Utils.numberWithCommas(notification.amount)} د.ع</p>
                <div class="flex items-center">
                  <i class="fas fa-clock text-xs text-red-600 ml-1"></i>
                  <p class="text-xs text-red-600">متبقي ${notification.daysLeft} أيام</p>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    } else {
      html += `
        <div class="flex flex-col items-center justify-center py-6">
          <i class="fas fa-bell-slash text-gray-400 text-3xl mb-2"></i>
          <p class="text-gray-500">لا توجد مدفوعات قادمة هذا الأسبوع</p>
        </div>
      `;
    }
    
    html += `
        </div>
        
        <div class="flex justify-between items-center mb-2">
          <h2 class="font-bold">أحدث المعاملات</h2>
          <button class="btn btn-sm btn-outline-primary" id="view-all-transactions">
            عرض الكل <i class="fas fa-arrow-left mr-1"></i>
          </button>
        </div>
        
        <div class="card">
    `;
    
    const recentTransactions = [...Data.transactions].reverse().slice(0, 5);
    
    if (recentTransactions.length > 0) {
      for (const transaction of recentTransactions) {
        const investor = Data.investors.find(inv => inv.id === transaction.investorId);
        
        html += `
          <div class="list-item">
            <div class="flex justify-between items-center">
              <div>
                <div class="flex items-center gap-2">
                  <i class="fas ${Utils.getTransactionIcon(transaction.type)}"></i>
                  <p class="font-bold">${investor ? investor.name : 'مصروف إداري'}</p>
                </div>
                <p class="text-sm text-gray-500">${Utils.formatDate(transaction.date)}</p>
              </div>
              <div class="text-right">
                <p class="font-bold ${Utils.getTransactionColorClass(transaction.type)}">
                  ${transaction.type === 'payout' || transaction.type === 'admin' ? '-' : '+'}${Utils.numberWithCommas(transaction.amount)} د.ع
                </p>
                <p class="text-xs">
                  ${Utils.getTransactionTypeName(transaction.type)}
                </p>
              </div>
            </div>
          </div>
        `;
      }
    } else {
      html += `
        <div class="flex flex-col items-center justify-center py-6">
          <i class="fas fa-exchange-alt text-gray-400 text-3xl mb-2"></i>
          <p class="text-gray-500">لا توجد معاملات مسجلة</p>
        </div>
      `;
    }
    
    html += `
        </div>
      </div>
    `;
    
    mainContent.innerHTML = html;
    
    // إضافة المستمعين للأحداث
    document.getElementById('view-all-transactions')?.addEventListener('click', () => {
      Main.navigateTo('transactions');
    });
}

// عرض صفحة الإعدادات
function renderSettingsPage() {
    const mainContent = document.getElementById('main-content');
    
    let html = `
      <div class="container animate-fadeIn">
        <h1 class="text-xl font-bold mb-4">الإعدادات</h1>
        
        <div class="card p-4 mb-4">
          <h2 class="font-bold mb-3 flex items-center gap-2">
            <i class="fas fa-sliders-h text-blue-600"></i>
            إعدادات الأرباح
          </h2>
          
          <div class="form-group">
            <label class="form-label">
              نسبة الربح الشهرية لكل مليون (%)
            </label>
            <input 
              type="number" 
              id="profit-rate-input"
              value="${Data.profitRate}"
              step="0.1"
              min="0"
              class="w-full"
            />
            <p class="text-sm text-gray-500 mt-1">
              القيمة الحالية: ${Data.profitRate}% لكل مليون دينار عراقي
            </p>
          </div>
          
          <div class="card-blue-light p-3 rounded-lg mb-4">
            <h3 class="font-bold mb-1">مثال على الحساب:</h3>
            <p class="text-sm mb-1">لاستثمار بقيمة 10,000,000 دينار عراقي:</p>
            <p class="font-bold">
              الربح الشهري = <span id="profit-example">${Utils.numberWithCommas((10000000 / 1000000) * Data.profitRate * 1000)}</span> دينار عراقي
            </p>
          </div>
          
          <button 
            class="w-full btn btn-primary"
            id="save-settings-btn"
          >
            <i class="fas fa-save ml-1"></i>
            حفظ الإعدادات
          </button>
        </div>
        
        <div class="card p-4 mb-4">
          <h2 class="font-bold mb-3 flex items-center gap-2">
            <i class="fas fa-file-invoice-dollar text-red-600"></i>
            إضافة مصروف إداري
          </h2>
          
          <div class="form-group">
            <label class="form-label">المبلغ</label>
            <input 
              type="number" 
              placeholder="أدخل المبلغ"
              id="admin-expense-amount"
              class="w-full"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">ملاحظات</label>
            <input 
              type="text" 
              placeholder="أدخل وصف المصروف"
              id="admin-expense-note"
              class="w-full"
            />
          </div>
          
          <button 
            class="w-full btn btn-danger"
            id="add-admin-expense-btn"
          >
            <i class="fas fa-plus ml-1"></i>
            إضافة مصروف
          </button>
        </div>
        
        <div class="card p-4">
          <h2 class="font-bold mb-3 flex items-center gap-2">
            <i class="fas fa-database text-yellow-600"></i>
            النسخ الاحتياطي
          </h2>
          
          <div class="grid grid-cols-1 gap-2">
            <button 
              class="w-full btn btn-secondary"
              id="export-data-btn"
            >
              <i class="fas fa-file-export ml-1"></i>
              تصدير البيانات
            </button>
            
            <label class="w-full btn btn-primary text-center cursor-pointer">
              <i class="fas fa-file-import ml-1"></i>
              استيراد البيانات
              <input 
                type="file" 
                accept=".json" 
                class="hidden"
                id="import-data-input"
              />
            </label>
            
            <button 
              class="w-full btn btn-danger"
              id="reset-data-btn"
            >
              <i class="fas fa-trash ml-1"></i>
              إعادة تعيين البيانات
            </button>
          </div>
        </div>
      </div>
    `;
    
    mainContent.innerHTML = html;
    
    // إضافة المستمعين للأحداث
    document.getElementById('profit-rate-input').addEventListener('input', (e) => {
      const rate = parseFloat(e.target.value);
      if (!isNaN(rate)) {
        document.getElementById('profit-example').textContent = Utils.numberWithCommas((10000000 / 1000000) * rate * 1000);
      }
    });
    
    document.getElementById('save-settings-btn').addEventListener('click', () => {
      const rate = parseFloat(document.getElementById('profit-rate-input').value);
      if (!isNaN(rate) && rate >= 0) {
        Data.profitRate = rate;
        showNotification('تم حفظ الإعدادات بنجاح', 'success');
        Data.saveData();
        renderSettingsPage(); // تحديث الصفحة
      } else {
        showNotification('الرجاء إدخال قيمة صحيحة', 'error');
      }
    });
    
    document.getElementById('add-admin-expense-btn').addEventListener('click', () => {
      const amount = document.getElementById('admin-expense-amount').value;
      const note = document.getElementById('admin-expense-note').value;
      
      if (amount && !isNaN(parseFloat(amount))) {
        import('./transactions.js').then(transactions => {
          transactions.addAdminExpense(parseFloat(amount), note);
          document.getElementById('admin-expense-amount').value = '';
          document.getElementById('admin-expense-note').value = '';
          showNotification('تم إضافة المصروف بنجاح', 'success');
        });
      } else {
        showNotification('الرجاء إدخال مبلغ صحيح', 'error');
      }
    });
    
    document.getElementById('export-data-btn').addEventListener('click', () => {
      Data.exportData();
    });
    
    document.getElementById('import-data-input').addEventListener('change', (e) => {
      Data.importData(e.target.files[0]);
    });
    
    document.getElementById('reset-data-btn').addEventListener('click', () => {
      if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟ سيتم حذف جميع المستثمرين والمعاملات.')) {
        Data.resetData();
      }
    });
}

// وظيفة تبديل السمة
function toggleTheme() {
    // Determine the new theme state without modifying the imported module property
    const newTheme = !document.body.classList.contains('dark-theme');
    document.body.classList.toggle('dark-theme', newTheme);
    
    const themeIcon = document.getElementById('toggle-theme').querySelector('i');
    if (newTheme) {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    } else {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
    
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
}

// إظهار/إخفاء قائمة منسدلة
function toggleDropdown() {
    const dropdown = document.getElementById('actions-dropdown');
    dropdown.classList.toggle('show');
}

// إظهار النموذج
function showModal(modalId) {
    const modalOverlay = document.getElementById(modalId);
    if (modalOverlay) {
      modalOverlay.classList.add('visible');
    }
}

// إخفاء النموذج
function hideModal(modalId) {
    const modalOverlay = document.getElementById(modalId);
    if (modalOverlay) {
      modalOverlay.classList.remove('visible');
    }
}

// عرض إشعار للمستخدم
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} fixed z-50`;
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.maxWidth = '300px';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    notification.style.transition = 'all 0.3s ease';
    
    let icon;
    switch (type) {
      case 'success':
        icon = '<i class="fas fa-check-circle text-green-600"></i>';
        break;
      case 'error':
        icon = '<i class="fas fa-exclamation-circle text-red-600"></i>';
        break;
      case 'warning':
        icon = '<i class="fas fa-exclamation-triangle text-yellow-600"></i>';
        break;
      default:
        icon = '<i class="fas fa-info-circle text-blue-600"></i>';
    }
    
    notification.innerHTML = `
      ${icon}
      <div class="flex-1">${message}</div>
      <button class="ml-2 text-gray-400 hover:text-gray-600">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // إضافة الإشعار للصفحة
    document.body.appendChild(notification);
    
    // عرض الإشعار بتأثير حركي
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 10);
    
    // إضافة حدث النقر لإغلاق الإشعار
    notification.querySelector('button').addEventListener('click', () => {
      hideNotification(notification);
    });
    
    // إخفاء الإشعار تلقائياً بعد 3 ثوان
    setTimeout(() => {
      hideNotification(notification);
    }, 3000);
}

// إخفاء الإشعار
function hideNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
}

// تصدير الوظائف
export {
    renderHomePage,
    renderSettingsPage,
    toggleTheme,
    toggleDropdown,
    showModal,
    hideModal,
    showNotification,
    hideNotification
};