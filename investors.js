// ...existing code...
// استيراد الوحدات الأخرى
import * as UI from './ui.js';
import * as Data from './data.js';
import * as Utils from './utils.js';
import * as Main from './main.js';

// إضافة مستثمر جديد
function addInvestor() {
    const name = document.getElementById('new-investor-name').value;
    const phone = document.getElementById('new-investor-phone').value;
    const address = document.getElementById('new-investor-address').value;
    const amount = parseFloat(document.getElementById('new-investor-amount').value);
    const startDate = document.getElementById('new-investor-start-date').value;
    const idCard = document.getElementById('new-investor-id-card').value;
    const notes = document.getElementById('new-investor-notes').value;
    
    // التحقق من صحة البيانات
    if (!name || isNaN(amount) || !startDate) {
        UI.showNotification('الرجاء إدخال الاسم والمبلغ وتاريخ البدء على الأقل', 'error');
        return;
    }
    
    const investorId = Date.now().toString();
    const investor = {
        id: investorId,
        name,
        phone,
        address,
        amount,
        startDate,
        idCard,
        notes
    };
    
    Data.investors.push(investor);
    
    // إضافة معاملة للاستثمار الأولي
    const initialInvestment = {
        id: Date.now().toString(),
        investorId,
        type: 'investment',
        amount,
        date: startDate,
        notes: 'استثمار أولي'
    };
    
    Data.transactions.push(initialInvestment);
    
    // تحديث ملخص اليوم
    Data.dailySummary.totalInvestments += amount;
    
    // إعادة حساب الإشعارات
    Data.calculateUpcomingPayments();
    
    // حفظ البيانات
    Data.saveData();
    
    // إغلاق النموذج والانتقال إلى صفحة المستثمرين
    UI.hideModal('add-investor-modal');
    Main.navigateTo('investors');
    
    UI.showNotification(`تم إضافة المستثمر ${name} بنجاح`, 'success');
}

// تحديث بيانات مستثمر
function updateInvestor() {
    const investorId = document.getElementById('edit-investor-id').value;
    if (!investorId) {
        UI.showNotification('خطأ في تحديد المستثمر', 'error');
        return;
    }
    
    const name = document.getElementById('new-investor-name').value;
    const phone = document.getElementById('new-investor-phone').value;
    const address = document.getElementById('new-investor-address').value;
    const amount = parseFloat(document.getElementById('new-investor-amount').value);
    const startDate = document.getElementById('new-investor-start-date').value;
    const idCard = document.getElementById('new-investor-id-card').value;
    const notes = document.getElementById('new-investor-notes').value;
    
    // التحقق من صحة البيانات
    if (!name || isNaN(amount) || !startDate) {
        UI.showNotification('الرجاء إدخال الاسم والمبلغ وتاريخ البدء على الأقل', 'error');
        return;
    }
    
    // البحث عن المستثمر في القائمة
    const investorIndex = Data.investors.findIndex(inv => inv.id === investorId);
    if (investorIndex === -1) {
        UI.showNotification('المستثمر غير موجود', 'error');
        return;
    }
    
    // الحصول على البيانات القديمة للمستثمر
    const oldInvestor = Data.investors[investorIndex];
    const oldAmount = oldInvestor.amount;
    
    // تحديث بيانات المستثمر
    Data.investors[investorIndex] = {
        ...oldInvestor,
        name,
        phone,
        address,
        amount,
        startDate,
        idCard,
        notes
    };
    
    // تحديث ملخص البيانات إذا تغير مبلغ الاستثمار
    if (amount !== oldAmount) {
        // البحث عن معاملة الاستثمار الأولي لتحديثها
        const initialInvestmentIndex = Data.transactions.findIndex(
            trans => trans.investorId === investorId && trans.type === 'investment' && trans.notes === 'استثمار أولي'
        );
        
        if (initialInvestmentIndex !== -1) {
            const oldTransAmount = Data.transactions[initialInvestmentIndex].amount;
            Data.transactions[initialInvestmentIndex].amount = amount;
            Data.transactions[initialInvestmentIndex].date = startDate;
            
            // تحديث ملخص اليوم
            Data.dailySummary.totalInvestments = Data.dailySummary.totalInvestments - oldTransAmount + amount;
        }
    }
    
    // تحديث المستثمر المحدد إذا كان هو نفسه المستثمر الذي تم تعديله
    if (Main.selectedInvestor && Main.selectedInvestor.id === investorId) {
        Main.selectedInvestor = Data.investors[investorIndex];
    }
    
    // إعادة حساب الإشعارات
    Data.calculateUpcomingPayments();
    
    // حفظ البيانات
    Data.saveData();
    
    // إغلاق النموذج
    UI.hideModal('add-investor-modal');
    
    // تحديث الواجهة
    if (Main.currentPage === 'investorDetails') {
        renderInvestorDetailsPage();
    } else {
        Main.navigateTo('investors');
    }
    
    UI.showNotification(`تم تحديث بيانات المستثمر ${name} بنجاح`, 'success');
}

// حذف مستثمر
function deleteInvestor(investorId) {
    if (confirm('هل أنت متأكد من حذف هذا المستثمر وجميع معاملاته؟')) {
        // البحث عن المستثمر
        const investor = Data.investors.find(inv => inv.id === investorId);
        if (!investor) return;
        
        // حذف المستثمر
        Data.investors = Data.investors.filter(inv => inv.id !== investorId);
        
        // حذف معاملات المستثمر
        const investorTransactions = Data.transactions.filter(trans => trans.investorId === investorId);
        Data.transactions = Data.transactions.filter(trans => trans.investorId !== investorId);
        
        // تحديث ملخص اليوم
        for (const trans of investorTransactions) {
            if (trans.type === 'investment') {
                Data.dailySummary.totalInvestments -= trans.amount;
            } else if (trans.type === 'payout') {
                Data.dailySummary.totalPayouts -= trans.amount;
            }
        }
        
        // إعادة حساب الإشعارات
        Data.calculateUpcomingPayments();
        
        // حفظ البيانات
        Data.saveData();
        
        // العودة إلى قائمة المستثمرين
        Main.selectedInvestor = null;
        Main.navigateTo('investors');
        
        UI.showNotification(`تم حذف المستثمر ${investor.name} وجميع معاملاته بنجاح`, 'success');
    }
}

// إظهار نموذج إضافة مستثمر جديد
function showAddInvestorModal() {
    // تعيين عنوان النموذج
    document.getElementById('investor-modal-title').textContent = 'إضافة مستثمر جديد';
    
    // تغيير نص زر التأكيد
    document.getElementById('confirm-add-investor').textContent = 'إضافة';
    
    // إعادة تعيين حقول النموذج
    document.getElementById('new-investor-name').value = '';
    document.getElementById('new-investor-phone').value = '';
    document.getElementById('new-investor-address').value = '';
    document.getElementById('new-investor-amount').value = '';
    document.getElementById('new-investor-start-date').value = Utils.getCurrentDate();
    document.getElementById('new-investor-id-card').value = '';
    document.getElementById('new-investor-notes').value = '';
    
    // مسح معرف المستثمر (للتعديل)
    document.getElementById('edit-investor-id').value = '';
    
    // إظهار النموذج
    UI.showModal('add-investor-modal');
    
    // إعادة تعيين مستمعي الأحداث للأزرار
    document.getElementById('cancel-add-investor').onclick = () => UI.hideModal('add-investor-modal');
    document.getElementById('close-investor-modal').onclick = () => UI.hideModal('add-investor-modal');
    document.getElementById('confirm-add-investor').onclick = addInvestor;
}

// إظهار نموذج تعديل مستثمر
function editInvestor(investor) {
    if (!investor) {
        UI.showNotification('لا توجد بيانات للمستثمر', 'error');
        return;
    }
    
    try {
        // تعيين عنوان النموذج
        document.getElementById('investor-modal-title').textContent = 'تعديل معلومات المستثمر';
        
        // تغيير نص زر التأكيد
        document.getElementById('confirm-add-investor').textContent = 'حفظ التعديلات';
        
        // تعبئة حقول النموذج ببيانات المستثمر
        document.getElementById('new-investor-name').value = investor.name || '';
        document.getElementById('new-investor-phone').value = investor.phone || '';
        document.getElementById('new-investor-address').value = investor.address || '';
        document.getElementById('new-investor-amount').value = investor.amount || '';
        document.getElementById('new-investor-start-date').value = investor.startDate || '';
        document.getElementById('new-investor-id-card').value = investor.idCard || '';
        document.getElementById('new-investor-notes').value = investor.notes || '';
        
        // تخزين معرف المستثمر للتعديل
        document.getElementById('edit-investor-id').value = investor.id;
        
        // إظهار النموذج
        UI.showModal('add-investor-modal');
        
        // إعادة تعيين مستمعي الأحداث للأزرار
        document.getElementById('cancel-add-investor').onclick = () => UI.hideModal('add-investor-modal');
        document.getElementById('close-investor-modal').onclick = () => UI.hideModal('add-investor-modal');
        document.getElementById('confirm-add-investor').onclick = updateInvestor;
    } catch (error) {
        console.error('حدث خطأ أثناء محاولة فتح نافذة التعديل:', error);
        UI.showNotification('حدث خطأ أثناء محاولة فتح نافذة التعديل', 'error');
    }
}

// عرض تفاصيل المستثمر
function viewInvestorDetails(investor) {
    Main.selectedInvestor = investor;
    Main.currentPage = 'investorDetails';
    Main.updateNavigation();
    renderInvestorDetailsPage();
}

// عرض صفحة المستثمرين
function renderInvestorsPage() {
    const mainContent = document.getElementById('main-content');
    
    let html = `
        <div class="container animate-fadeIn">
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-xl font-bold">المستثمرين</h1>
                <button 
                  class="btn btn-primary"
                  id="add-investor-btn"
                >
                  <i class="fas fa-plus ml-1"></i> إضافة مستثمر
                </button>
            </div>
            
            <div class="search-container">
                <input 
                  type="text" 
                  id="investor-search"
                  placeholder="بحث عن مستثمر..." 
                  class="search-input"
                />
                <i class="fas fa-search search-icon"></i>
            </div>
            
            <div class="card" id="investors-list">
      `;
      
      if (Data.investors.length > 0) {
        // ترتيب المستثمرين حسب المبلغ (تنازلياً)
        const sortedInvestors = [...Data.investors].sort((a, b) => b.amount - a.amount);
        
        for (const investor of sortedInvestors) {
          html += `
            <div 
              class="list-item cursor-pointer investor-item" 
              data-id="${investor.id}"
            >
              <div class="flex justify-between items-center">
                <div>
                  <div class="flex items-center gap-2">
                    <div class="badge badge-primary" style="min-width: 26px; height: 26px;">
                      ${investor.name.charAt(0)}
                    </div>
                    <div>
                      <p class="font-bold">${investor.name}</p>
                      <div class="flex items-center text-sm text-gray-500">
                        <i class="fas fa-phone-alt text-xs ml-1"></i>
                        <p>${investor.phone || 'غير متوفر'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold">${Utils.numberWithCommas(investor.amount)} د.ع</p>
                  <p class="text-sm text-green-600">${Utils.numberWithCommas(Utils.calculateMonthlyProfit(investor.amount, Data.profitRate))} د.ع شهريًا</p>
                </div>
              </div>
            </div>
          `;
        }
      } else {
        html += `
          <div class="flex flex-col items-center justify-center py-10">
            <i class="fas fa-users text-gray-400 text-5xl mb-3"></i>
            <p class="text-gray-500 mb-4">لا يوجد مستثمرين. أضف مستثمر جديد للبدء.</p>
            <button class="btn btn-primary" id="empty-add-investor-btn">
              <i class="fas fa-user-plus ml-1"></i> إضافة مستثمر جديد
            </button>
          </div>
        `;
      }
      
      html += `
          </div>
        </div>
      `;
      
      mainContent.innerHTML = html;
      
      // إضافة المستمعين للأحداث
      document.getElementById('add-investor-btn')?.addEventListener('click', () => {
        showAddInvestorModal();
      });
      
      document.getElementById('empty-add-investor-btn')?.addEventListener('click', () => {
        showAddInvestorModal();
      });
      
      document.getElementById('investor-search')?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const investorItems = document.getElementsByClassName('investor-item');
        
        Array.from(investorItems).forEach(item => {
          const investorId = item.getAttribute('data-id');
          const investor = Data.investors.find(inv => inv.id === investorId);
          
          if (investor.name.toLowerCase().includes(searchTerm) || 
              (investor.phone && investor.phone.includes(searchTerm))) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
      
      // إضافة المستمعين لعناصر المستثمرين
      const investorItems = document.getElementsByClassName('investor-item');
      Array.from(investorItems).forEach(item => {
        item.addEventListener('click', () => {
          const investorId = item.getAttribute('data-id');
          const investor = Data.investors.find(inv => inv.id === investorId);
          viewInvestorDetails(investor);
        });
      });
}

// عرض صفحة تفاصيل المستثمر
function renderInvestorDetailsPage() {
    if (!Main.selectedInvestor) {
        Main.navigateTo('investors');
        return;
    }
    
    const mainContent = document.getElementById('main-content');
    
    // الحصول على معاملات المستثمر
    const investorTransactions = Data.transactions.filter(
        trans => trans.investorId === Main.selectedInvestor.id
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // حساب إجمالي الاستثمارات والأرباح المدفوعة
    const totalInvestments = investorTransactions
        .filter(t => t.type === 'investment')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const totalPayouts = investorTransactions
        .filter(t => t.type === 'payout')
        .reduce((sum, t) => sum + t.amount, 0);
    
    // حساب المدة بالأشهر من تاريخ البدء
    const startDate = new Date(Main.selectedInvestor.startDate);
    const currentDate = new Date();
    const months = (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
        (currentDate.getMonth() - startDate.getMonth());
    
    let html = `
        <div class="container animate-fadeIn">
          <div class="flex items-center mb-4">
            <button 
              class="btn btn-icon btn-gray ml-2"
              id="back-to-investors"
            >
              <i class="fas fa-arrow-right"></i>
            </button>
            <h1 class="text-xl font-bold">تفاصيل المستثمر</h1>
          </div>
          
          <div class="card mb-4">
            <div class="flex justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="badge badge-primary" style="width: 40px; height: 40px; font-size: 1.25rem;">
                  ${Main.selectedInvestor.name.charAt(0)}
                </div>
                <h2 class="text-lg font-bold">${Main.selectedInvestor.name}</h2>
              </div>
              <div class="flex">
                <button class="btn btn-icon btn-outline-primary ml-2" id="edit-investor" title="تعديل بيانات المستثمر">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-outline btn-danger" id="delete-investor" title="حذف المستثمر">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="flex items-center gap-2">
                <i class="fas fa-phone-alt text-gray-500"></i>
                <div>
                  <p class="text-xs text-gray-500">رقم الهاتف</p>
                  <p>${Main.selectedInvestor.phone || "غير متوفر"}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-map-marker-alt text-gray-500"></i>
                <div>
                  <p class="text-xs text-gray-500">العنوان</p>
                  <p>${Main.selectedInvestor.address || "غير متوفر"}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-id-card text-gray-500"></i>
                <div>
                  <p class="text-xs text-gray-500">رقم الهوية</p>
                  <p>${Main.selectedInvestor.idCard || "غير متوفر"}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-calendar-alt text-gray-500"></i>
                <div>
                  <p class="text-xs text-gray-500">تاريخ البدء</p>
                  <p>${Utils.formatDate(Main.selectedInvestor.startDate)}</p>
                  <p class="text-xs text-blue-600">منذ ${months} شهر</p>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="card-blue-light p-3 rounded-lg">
                <div class="flex justify-between mb-1">
                  <p class="font-medium">مبلغ الاستثمار</p>
                  <p class="font-bold">${Utils.numberWithCommas(Main.selectedInvestor.amount)} د.ع</p>
                </div>
                <div class="text-xs text-gray-500">إجمالي المبلغ المستثمر</div>
              </div>
              
              <div class="card-green-light p-3 rounded-lg">
                <div class="flex justify-between mb-1">
                  <p class="font-medium">الربح الشهري (${Data.profitRate}%)</p>
                  <p class="font-bold text-green-600">
                    ${Utils.numberWithCommas(Utils.calculateMonthlyProfit(Main.selectedInvestor.amount, Data.profitRate))} د.ع
                  </p>
                </div>
                <div class="text-xs text-gray-500">على أساس المبلغ الحالي</div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="stats-card stats-card-primary">
                <div class="icon-bg">
                  <i class="fas fa-money-bill-wave"></i>
                </div>
                <p class="text-sm text-gray-500">إجمالي الاستثمارات</p>
                <p class="text-xl font-bold">${Utils.numberWithCommas(totalInvestments)} د.ع</p>
                <p class="text-xs text-blue-600 mt-1">
                  ${investorTransactions.filter(t => t.type === 'investment').length} عملية
                </p>
              </div>
              
              <div class="stats-card stats-card-secondary">
                <div class="icon-bg">
                  <i class="fas fa-hand-holding-usd"></i>
                </div>
                <p class="text-sm text-gray-500">إجمالي الأرباح المدفوعة</p>
                <p class="text-xl font-bold">${Utils.numberWithCommas(totalPayouts)} د.ع</p>
                <p class="text-xs text-green-600 mt-1">
                  ${investorTransactions.filter(t => t.type === 'payout').length} عملية
                </p>
              </div>
            </div>
            
            <div class="flex gap-2">
              <button 
                class="flex-1 btn btn-secondary"
                id="add-payout-btn"
              >
                <i class="fas fa-dollar-sign ml-1"></i>
                تسجيل دفع ربح
              </button>
              <button 
                class="flex-1 btn btn-primary"
                id="add-investment-btn"
              >
                <i class="fas fa-plus ml-1"></i>
                إضافة استثمار
              </button>
            </div>
          </div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold">سجل المعاملات</h3>
            <div class="text-sm text-gray-500">
              (${investorTransactions.length}) معاملة
            </div>
          </div>
          
          <div class="card" id="investor-transactions">
      `;
      
      if (investorTransactions.length > 0) {
        for (const transaction of investorTransactions) {
          html += `
            <div class="list-item">
              <div class="flex justify-between items-center">
                <div>
                  <div class="flex items-center gap-2">
                    <i class="fas ${Utils.getTransactionIcon(transaction.type)} ${Utils.getTransactionColorClass(transaction.type)}"></i>
                    <p class="text-sm">${Utils.formatDate(transaction.date)}</p>
                  </div>
                  <p class="text-xs text-gray-500">${transaction.notes || 'بدون ملاحظات'}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold ${Utils.getTransactionColorClass(transaction.type)}">
                    ${transaction.type === 'payout' ? '-' : '+'}${Utils.numberWithCommas(transaction.amount)} د.ع
                  </p>
                  <p class="text-xs">${Utils.getTransactionTypeName(transaction.type)}</p>
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
      document.getElementById('back-to-investors').addEventListener('click', () => {
        Main.selectedInvestor = null;
        Main.navigateTo('investors');
      });
      
      document.getElementById('edit-investor').addEventListener('click', () => {
        editInvestor(Main.selectedInvestor);
      });
      
      document.getElementById('delete-investor').addEventListener('click', () => {
        deleteInvestor(Main.selectedInvestor.id);
      });
      
      document.getElementById('add-payout-btn').addEventListener('click', () => {
        import('./transactions.js').then(transactions => {
          transactions.showAddTransactionModal('payout', Main.selectedInvestor);
        });
      });
      
      document.getElementById('add-investment-btn').addEventListener('click', () => {
        import('./transactions.js').then(transactions => {
          transactions.showAddTransactionModal('investment', Main.selectedInvestor);
        });
      });
}

// تصدير الوظائف
export {
    addInvestor,
    updateInvestor,
    deleteInvestor,
    showAddInvestorModal,
    editInvestor,
    viewInvestorDetails,
    renderInvestorsPage,
    renderInvestorDetailsPage
};