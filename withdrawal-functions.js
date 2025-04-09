// وظائف السحب من الاستثمار (withdrawal-functions.js)

// عرض نافذة إضافة سحب جديد
function showWithdrawalModal(investor = null) {
    // تعيين عنوان النافذة
    document.getElementById('withdrawal-modal-title').textContent = 'سحب من الاستثمار';
    
    // إعادة تعيين حقول النموذج
    document.getElementById('withdrawal-amount').value = '';
    document.getElementById('withdrawal-date').value = getCurrentDate();
    document.getElementById('scheduled-withdrawal-date').value = getCurrentDate();
    document.getElementById('withdrawal-notes').value = '';
    document.getElementById('withdrawal-scheduled').checked = false;
    document.getElementById('scheduled-date-container').style.display = 'none';
    
    // تعبئة قائمة المستثمرين
    const investorSelect = document.getElementById('withdrawal-investor-id');
    
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
    for (const inv of investors) {
      const option = document.createElement('option');
      option.value = inv.id;
      option.textContent = `${inv.name} (${numberWithCommas(inv.amount)} د.ع)`;
      investorSelect.appendChild(option);
    }
    
    // إذا كان هناك مستثمر محدد
    if (investor) {
      investorSelect.value = investor.id;
      investorSelect.disabled = true;
      
      // عرض الرصيد المتاح للسحب
      updateAvailableBalance(investor);
    } else {
      investorSelect.disabled = false;
      
      // إضافة مستمع حدث لتغيير المستثمر
      investorSelect.onchange = function() {
        if (!this.value) return;
        
        const selectedInvestor = investors.find(inv => inv.id === this.value);
        if (selectedInvestor) {
          updateAvailableBalance(selectedInvestor);
        }
      };
    }
    
    // إظهار النافذة
    showModal('withdrawal-modal');
  }
  
  // تحديث عرض الرصيد المتاح للسحب
  function updateAvailableBalance(investor) {
    if (!investor) return;
    
    // إضافة أو تحديث عنصر عرض الرصيد المتاح
    if (!document.getElementById('available-withdrawal-balance')) {
      const infoElement = document.createElement('div');
      infoElement.id = 'available-withdrawal-balance';
      infoElement.className = 'alert alert-info mt-3';
      
      const amountField = document.getElementById('withdrawal-amount').parentNode;
      amountField.parentNode.insertBefore(infoElement, amountField.nextSibling);
    }
    
    // تحديث عنصر عرض الرصيد المتاح
    document.getElementById('available-withdrawal-balance').innerHTML = `
      <i class="fas fa-info-circle"></i>
      <div>
        <p class="font-bold">الرصيد المتاح للسحب:</p>
        <p>${numberWithCommas(investor.amount)} د.ع</p>
      </div>
    `;
  }
  
  // تسجيل سحب جديد
  function addWithdrawal() {
    const investorId = document.getElementById('withdrawal-investor-id').value;
    const amount = parseFloat(document.getElementById('withdrawal-amount').value);
    const date = document.getElementById('withdrawal-date').value || getCurrentDate();
    const notes = document.getElementById('withdrawal-notes').value;
    const isScheduled = document.getElementById('withdrawal-scheduled').checked;
    const scheduledDate = document.getElementById('scheduled-withdrawal-date').value;
    
    // التحقق من صحة البيانات
    if (!investorId || isNaN(amount) || amount <= 0) {
      showNotification('الرجاء تحديد المستثمر والمبلغ', 'error');
      return;
    }
    
    // الحصول على بيانات المستثمر
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
      showNotification('لم يتم العثور على المستثمر', 'error');
      return;
    }
    
    // التحقق من أن المبلغ المطلوب سحبه لا يتجاوز رصيد المستثمر
    if (investor.amount < amount) {
      showNotification('مبلغ السحب أكبر من الرصيد المتاح!', 'error');
      return;
    }
    
    // إنشاء معرف فريد للمعاملة
    const transactionId = Date.now().toString();
    
    // إنشاء سجل معاملة السحب
    const transaction = {
      id: transactionId,
      investorId,
      type: 'withdrawal',
      amount,
      date,
      notes: notes || 'سحب من الاستثمار',
      isScheduled: isScheduled,
      scheduledWithdrawalDate: isScheduled ? scheduledDate : null,
      processed: !isScheduled // المعاملة غير المجدولة تعتبر منفذة فورًا
    };
    
    // إضافة المعاملة
    transactions.push(transaction);
    
    // إذا كانت معاملة فورية (غير مجدولة)، تحديث الرصيد
    if (!isScheduled) {
      // تحديث المبلغ الإجمالي للمستثمر
      investor.amount -= amount;
      
      // تحديث المستثمر المحدد إذا كان هو نفسه
      if (selectedInvestor && selectedInvestor.id === investorId) {
        selectedInvestor = investor;
      }
      
      // تحديث ملخص الاستثمارات
      dailySummary.totalInvestments -= amount;
      
      showNotification(`تم تسجيل سحب أموال بمبلغ ${numberWithCommas(amount)} د.ع بنجاح`, 'success');
    } else {
      showNotification(`تم جدولة سحب أموال بمبلغ ${numberWithCommas(amount)} د.ع بتاريخ ${formatDate(scheduledDate)}`, 'success');
    }
    
    // إعادة حساب الإشعارات والسحوبات المجدولة
    calculateUpcomingPayments();
    calculateUpcomingWithdrawals();
    
    // حفظ البيانات في التخزين المحلي
    saveData();
    
    // إغلاق النموذج
    hideModal('withdrawal-modal');
    
    // تحديث الواجهة
    if (selectedInvestor && selectedInvestor.id === investorId) {
      renderInvestorDetailsPage();
    } else if (currentPage === 'transactions') {
      renderTransactionsPage();
    } else if (currentPage === 'withdrawals') {
      renderWithdrawalsPage();
    } else if (currentPage === 'home') {
      renderHomePage();
    }
  }
  
  // دالة لحساب السحوبات المجدولة القادمة
  function calculateUpcomingWithdrawals() {
    const today = new Date();
    const upcomingWithdrawals = [];
    
    // البحث عن السحوبات المجدولة غير المنفذة
    const pendingWithdrawals = transactions.filter(t => 
      t.type === 'withdrawal' &&
      t.isScheduled &&
      t.scheduledWithdrawalDate &&
      !t.processed
    );
    
    for (const withdrawal of pendingWithdrawals) {
      const withdrawalDate = new Date(withdrawal.scheduledWithdrawalDate);
      const investor = investors.find(inv => inv.id === withdrawal.investorId);
      
      if (investor) {
        const daysUntilWithdrawal = Math.floor((withdrawalDate - today) / (1000 * 60 * 60 * 24));
        
        // إضافة السحوبات التي موعدها خلال الأسبوع القادم
        if (daysUntilWithdrawal <= 7 && daysUntilWithdrawal >= 0) {
          upcomingWithdrawals.push({
            id: withdrawal.id,
            name: investor.name,
            date: withdrawal.scheduledWithdrawalDate,
            amount: withdrawal.amount,
            daysLeft: daysUntilWithdrawal,
            type: 'withdrawal'
          });
        }
      }
    }
    
    // إضافة السحوبات المجدولة إلى الإشعارات العامة
    if (upcomingWithdrawals.length > 0) {
      // إزالة السحوبات السابقة من قائمة الإشعارات
      notifications = notifications.filter(n => n.type !== 'withdrawal');
      
      // إضافة السحوبات الجديدة
      notifications = [...notifications, ...upcomingWithdrawals];
      
      // ترتيب الإشعارات حسب الأقرب موعدًا
      notifications.sort((a, b) => a.daysLeft - b.daysLeft);
    }
  }
  
  // دالة للتحقق من السحوبات المجدولة وتنفيذها عند حلول موعدها
  function checkScheduledWithdrawals() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // البحث عن السحوبات المستحقة اليوم
    const dueWithdrawals = transactions.filter(t => 
      t.type === 'withdrawal' &&
      t.isScheduled &&
      t.scheduledWithdrawalDate &&
      new Date(t.scheduledWithdrawalDate) <= today &&
      !t.processed
    );
    
    // تنفيذ السحوبات المستحقة
    for (const withdrawal of dueWithdrawals) {
      const investor = investors.find(inv => inv.id === withdrawal.investorId);
      
      if (investor) {
        if (investor.amount >= withdrawal.amount) {
          // تنفيذ السحب
          investor.amount -= withdrawal.amount;
          dailySummary.totalInvestments -= withdrawal.amount;
          
          // تحديث حالة المعاملة
          withdrawal.processed = true;
          withdrawal.processingDate = today.toISOString().split('T')[0];
          
          showNotification(`تم تنفيذ سحب مجدول بمبلغ ${numberWithCommas(withdrawal.amount)} د.ع للمستثمر ${investor.name}`, 'success');
        } else {
          // إضافة ملاحظة بتعذر التنفيذ بسبب عدم كفاية الرصيد
          withdrawal.notes += ' (تعذر التنفيذ بسبب عدم كفاية الرصيد)';
          withdrawal.processingError = true;
          
          showNotification(`تعذر تنفيذ سحب مجدول للمستثمر ${investor.name} بسبب نقص الرصيد!`, 'error');
        }
      }
    }
    
    // حفظ التغييرات إذا كانت هناك سحوبات مستحقة
    if (dueWithdrawals.length > 0) {
      saveData();
      
      // تحديث الواجهة إذا كان المستثمر المحدد قد تأثر
      if (selectedInvestor && dueWithdrawals.some(w => w.investorId === selectedInvestor.id)) {
        selectedInvestor = investors.find(inv => inv.id === selectedInvestor.id);
        if (currentPage === 'investorDetails') {
          renderInvestorDetailsPage();
        }
      }
      
      // تحديث صفحة السحوبات إذا كانت مفتوحة
      if (currentPage === 'withdrawals') {
        renderWithdrawalsPage();
      }
    }
    
    // تحديث الإشعارات
    calculateUpcomingWithdrawals();
  }
  
  // عرض صفحة السحوبات
  function renderWithdrawalsPage() {
    const mainContent = document.getElementById('main-content');
    
    // الحصول على جميع معاملات السحب مرتبة حسب التاريخ (الأحدث أولاً)
    const allWithdrawals = transactions
      .filter(t => t.type === 'withdrawal')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // فصل السحوبات المجدولة عن المنفذة
    const scheduledWithdrawals = allWithdrawals.filter(w => w.isScheduled && !w.processed);
    const processedWithdrawals = allWithdrawals.filter(w => w.processed || !w.isScheduled);
    const failedWithdrawals = allWithdrawals.filter(w => w.processingError);
    
    // حساب إجمالي المبالغ
    const totalScheduled = scheduledWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const totalProcessed = processedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    
    let html = `
      <div class="container animate-fadeIn">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-xl font-bold">إدارة السحوبات</h1>
          <button 
            class="btn btn-primary"
            id="add-new-withdrawal-btn"
          >
            <i class="fas fa-plus ml-1"></i> سحب جديد
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div class="stats-card stats-card-danger">
            <div class="icon-bg">
              <i class="fas fa-money-bill-alt"></i>
            </div>
            <p class="text-sm text-gray-500">إجمالي السحوبات المنفذة</p>
            <p class="font-bold text-lg">${numberWithCommas(totalProcessed)} د.ع</p>
            <p class="text-xs">${processedWithdrawals.length} عملية</p>
          </div>
          
          <div class="stats-card stats-card-warning">
            <div class="icon-bg">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <p class="text-sm text-gray-500">السحوبات المجدولة</p>
            <p class="font-bold text-lg">${numberWithCommas(totalScheduled)} د.ع</p>
            <p class="text-xs">${scheduledWithdrawals.length} عملية</p>
          </div>
          
          <div class="stats-card stats-card-secondary">
            <div class="icon-bg">
              <i class="fas fa-chart-line"></i>
            </div>
            <p class="text-sm text-gray-500">نسبة السحوبات من الاستثمارات</p>
            <p class="font-bold text-lg">${dailySummary.totalInvestments > 0 ? 
              ((totalProcessed / dailySummary.totalInvestments) * 100).toFixed(1) : 0}%</p>
            <p class="text-xs">من إجمالي الاستثمارات</p>
          </div>
        </div>
        
        <!-- قسم السحوبات المجدولة -->
        <div class="card p-4 mb-4">
          <h2 class="font-bold mb-3 flex items-center gap-2">
            <i class="fas fa-calendar-alt text-yellow-600"></i>
            السحوبات المجدولة القادمة
          </h2>
    `;
    
    if (scheduledWithdrawals.length > 0) {
      // ترتيب السحوبات المجدولة حسب تاريخ التنفيذ
      const sortedScheduled = [...scheduledWithdrawals].sort(
        (a, b) => new Date(a.scheduledWithdrawalDate) - new Date(b.scheduledWithdrawalDate)
      );
      
      html += `
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100 text-right">
                <th class="p-2 border">المستثمر</th>
                <th class="p-2 border">المبلغ</th>
                <th class="p-2 border">تاريخ الجدولة</th>
                <th class="p-2 border">تاريخ التنفيذ</th>
                <th class="p-2 border">الملاحظات</th>
                <th class="p-2 border">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      for (const withdrawal of sortedScheduled) {
        const investor = investors.find(inv => inv.id === withdrawal.investorId);
        const scheduledDate = new Date(withdrawal.scheduledWithdrawalDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const daysLeft = Math.floor((scheduledDate - today) / (1000 * 60 * 60 * 24));
        const isUrgent = daysLeft <= 3;
        
        html += `
          <tr class="border-b hover:bg-gray-50 ${isUrgent ? 'bg-red-50' : ''}">
            <td class="p-2 border">${investor ? investor.name : 'غير معروف'}</td>
            <td class="p-2 border font-bold text-red-600">${numberWithCommas(withdrawal.amount)} د.ع</td>
            <td class="p-2 border">${formatDate(withdrawal.date)}</td>
            <td class="p-2 border">
              <span class="${isUrgent ? 'text-red-600 font-bold' : ''}">${formatDate(withdrawal.scheduledWithdrawalDate)}</span>
              ${daysLeft <= 0 ? '<span class="badge badge-red">اليوم</span>' : 
                `<span class="text-sm text-gray-500">متبقي ${daysLeft} أيام</span>`}
            </td>
            <td class="p-2 border">${withdrawal.notes || '-'}</td>
            <td class="p-2 border">
              <div class="flex gap-1">
                <button class="process-withdrawal-btn btn-icon btn-sm btn-outline-primary" data-id="${withdrawal.id}" title="تنفيذ الآن">
                  <i class="fas fa-check"></i>
                </button>
                <button class="edit-withdrawal-btn btn-icon btn-sm btn-outline-secondary" data-id="${withdrawal.id}" title="تعديل">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="cancel-withdrawal-btn btn-icon btn-sm btn-outline-danger" data-id="${withdrawal.id}" title="إلغاء">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }
      
      html += `
            </tbody>
          </table>
        </div>
      `;
    } else {
      html += `
        <div class="text-center py-4">
          <i class="fas fa-calendar-times text-gray-400 text-3xl mb-2"></i>
          <p class="text-gray-500">لا توجد سحوبات مجدولة</p>
        </div>
      `;
    }
    
    html += `
        </div>
        
        <!-- قسم السحوبات المنفذة -->
        <div class="card p-4">
          <div class="flex justify-between mb-3">
            <h2 class="font-bold flex items-center gap-2">
              <i class="fas fa-history text-blue-600"></i>
              سجل السحوبات المنفذة
            </h2>
            
            <div class="flex gap-2">
              <button class="btn btn-sm btn-outline-primary" id="export-withdrawals-btn">
                <i class="fas fa-file-export ml-1"></i>
                تصدير التقرير
              </button>
            </div>
          </div>
    `;
    
    if (processedWithdrawals.length > 0) {
      html += `
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100 text-right">
                <th class="p-2 border">المستثمر</th>
                <th class="p-2 border">المبلغ</th>
                <th class="p-2 border">تاريخ السحب</th>
                <th class="p-2 border">نوع السحب</th>
                <th class="p-2 border">الملاحظات</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      for (const withdrawal of processedWithdrawals) {
        const investor = investors.find(inv => inv.id === withdrawal.investorId);
        
        html += `
          <tr class="border-b hover:bg-gray-50">
            <td class="p-2 border">${investor ? investor.name : 'غير معروف'}</td>
            <td class="p-2 border font-bold text-red-600">${numberWithCommas(withdrawal.amount)} د.ع</td>
            <td class="p-2 border">${formatDate(withdrawal.date)}</td>
            <td class="p-2 border">
              ${withdrawal.isScheduled ? 
                `<span class="badge badge-yellow">مجدول</span>` : 
                `<span class="badge badge-green">فوري</span>`}
            </td>
            <td class="p-2 border">${withdrawal.notes || '-'}</td>
          </tr>
        `;
      }
      
      html += `
            </tbody>
          </table>
        </div>
      `;
    } else {
      html += `
        <div class="text-center py-4">
          <i class="fas fa-file-invoice-dollar text-gray-400 text-3xl mb-2"></i>
          <p class="text-gray-500">لا توجد سحوبات منفذة</p>
        </div>
      `;
    }
    
    html += `
        </div>
        
        <!-- قسم السحوبات الفاشلة إذا وجدت -->
        ${failedWithdrawals.length > 0 ? `
        <div class="card p-4 mt-4 card-red-light">
          <h2 class="font-bold mb-3 flex items-center gap-2">
            <i class="fas fa-exclamation-triangle text-red-600"></i>
            سحوبات فشل تنفيذها
          </h2>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-100 text-right">
                  <th class="p-2 border">المستثمر</th>
                  <th class="p-2 border">المبلغ</th>
                  <th class="p-2 border">تاريخ التنفيذ</th>
                  <th class="p-2 border">الملاحظات</th>
                  <th class="p-2 border">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${failedWithdrawals.map(withdrawal => {
                  const investor = investors.find(inv => inv.id === withdrawal.investorId);
                  return `
                  <tr class="border-b hover:bg-gray-50 bg-red-50">
                    <td class="p-2 border">${investor ? investor.name : 'غير معروف'}</td>
                    <td class="p-2 border font-bold text-red-600">${numberWithCommas(withdrawal.amount)} د.ع</td>
                    <td class="p-2 border">${formatDate(withdrawal.scheduledWithdrawalDate)}</td>
                    <td class="p-2 border">${withdrawal.notes || '-'}</td>
                    <td class="p-2 border">
                      <div class="flex gap-1">
                        <button class="retry-withdrawal-btn btn-icon btn-sm btn-outline-primary" data-id="${withdrawal.id}" title="إعادة المحاولة">
                          <i class="fas fa-redo"></i>
                        </button>
                        <button class="cancel-withdrawal-btn btn-icon btn-sm btn-outline-danger" data-id="${withdrawal.id}" title="إلغاء">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}
      </div>
    `;
    
    mainContent.innerHTML = html;
    
    // إضافة مستمعي الأحداث
    document.getElementById('add-new-withdrawal-btn').addEventListener('click', () => {
      showWithdrawalModal();
    });
    
    document.getElementById('export-withdrawals-btn')?.addEventListener('click', () => {
      exportWithdrawalsReport();
    });
    
    // مستمعات أحداث أزرار السحوبات المجدولة
    document.querySelectorAll('.process-withdrawal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const withdrawalId = e.currentTarget.getAttribute('data-id');
        processScheduledWithdrawal(withdrawalId);
      });
    });
    
    document.querySelectorAll('.edit-withdrawal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const withdrawalId = e.currentTarget.getAttribute('data-id');
        editScheduledWithdrawal(withdrawalId);
      });
    });
    
    document.querySelectorAll('.cancel-withdrawal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const withdrawalId = e.currentTarget.getAttribute('data-id');
        cancelScheduledWithdrawal(withdrawalId);
      });
    });
    
    // مستمعات أحداث أزرار السحوبات الفاشلة
    document.querySelectorAll('.retry-withdrawal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const withdrawalId = e.currentTarget.getAttribute('data-id');
        retryFailedWithdrawal(withdrawalId);
      });
    });
  }
  
  // تنفيذ سحب مجدول
  function processScheduledWithdrawal(withdrawalId) {
    const withdrawal = transactions.find(t => t.id === withdrawalId);
    if (!withdrawal || withdrawal.processed) return;
    
    const investor = investors.find(inv => inv.id === withdrawal.investorId);
    if (!investor) return;
    
    if (investor.amount >= withdrawal.amount) {
      // تنفيذ السحب
      investor.amount -= withdrawal.amount;
      dailySummary.totalInvestments -= withdrawal.amount;
      
      // تحديث حالة المعاملة
      withdrawal.processed = true;
      withdrawal.processingDate = getCurrentDate();
      
      // حفظ البيانات
      saveData();
      
      // تحديث الواجهة
      showNotification(`تم تنفيذ السحب المجدول بمبلغ ${numberWithCommas(withdrawal.amount)} د.ع بنجاح`, 'success');
      renderWithdrawalsPage();
    } else {
      showNotification(`تعذر تنفيذ السحب المجدول بسبب عدم كفاية الرصيد!`, 'error');
    }
  }
  
  // تعديل سحب مجدول
  function editScheduledWithdrawal(withdrawalId) {
    const withdrawal = transactions.find(t => t.id === withdrawalId);
    if (!withdrawal || withdrawal.processed) return;
    
    const investor = investors.find(inv => inv.id === withdrawal.investorId);
    if (!investor) return;
    
    // تعبئة نموذج التعديل
    document.getElementById('edit-withdrawal-id').value = withdrawal.id;
    document.getElementById('edit-withdrawal-amount').value = withdrawal.amount;
    document.getElementById('edit-withdrawal-date').value = withdrawal.date;
    document.getElementById('edit-withdrawal-scheduled-date').value = withdrawal.scheduledWithdrawalDate;
    document.getElementById('edit-withdrawal-notes').value = withdrawal.notes || '';
    
    // عرض معلومات المستثمر
    document.getElementById('edit-withdrawal-investor-name').textContent = investor.name;
    document.getElementById('edit-withdrawal-balance').textContent = `${numberWithCommas(investor.amount)} د.ع`;
    
    // عرض النافذة
    showModal('edit-withdrawal-modal');
  }
  
  // تحديث سحب مجدول
  function updateScheduledWithdrawal() {
    const withdrawalId = document.getElementById('edit-withdrawal-id').value;
    const withdrawal = transactions.find(t => t.id === withdrawalId);
    if (!withdrawal) return;
    
    const amount = parseFloat(document.getElementById('edit-withdrawal-amount').value);
    const scheduledDate = document.getElementById('edit-withdrawal-scheduled-date').value;
    const notes = document.getElementById('edit-withdrawal-notes').value;
    
    // التحقق من صحة البيانات
    if (isNaN(amount) || amount <= 0 || !scheduledDate) {
      showNotification('الرجاء إدخال المبلغ وتاريخ التنفيذ بشكل صحيح', 'error');
      return;
    }
    
    // تحديث بيانات السحب
    withdrawal.amount = amount;
    withdrawal.scheduledWithdrawalDate = scheduledDate;
    withdrawal.notes = notes;
    
    // حفظ البيانات
    saveData();
    
    // إغلاق النافذة
    hideModal('edit-withdrawal-modal');
    
    // تحديث صفحة السحوبات
    showNotification('تم تحديث بيانات السحب المجدول بنجاح', 'success');
    renderWithdrawalsPage();
  }
  
  // إلغاء سحب مجدول
  function cancelScheduledWithdrawal(withdrawalId) {
    if (!confirm('هل أنت متأكد من إلغاء هذا السحب المجدول؟')) return;
    
    const withdrawal = transactions.find(t => t.id === withdrawalId);
    if (!withdrawal) return;
    
    // حذف المعاملة من قائمة المعاملات
    transactions = transactions.filter(t => t.id !== withdrawalId);
    
    // حفظ البيانات
    saveData();
    
    // تحديث الإشعارات
    calculateUpcomingWithdrawals();
    
    // تحديث صفحة السحوبات
    showNotification('تم إلغاء السحب المجدول بنجاح', 'success');
    renderWithdrawalsPage();
  }
  
  // إعادة محاولة تنفيذ سحب فاشل
  function retryFailedWithdrawal(withdrawalId) {
    const withdrawal = transactions.find(t => t.id === withdrawalId);
    if (!withdrawal) return;
    
    const investor = investors.find(inv => inv.id === withdrawal.investorId);
    if (!investor) return;
    
    // إعادة ضبط حالة المعاملة
    withdrawal.processingError = false;
    withdrawal.notes = withdrawal.notes.replace(' (تعذر التنفيذ بسبب عدم كفاية الرصيد)', '');
    
    // التحقق مجددًا من إمكانية التنفيذ
    if (investor.amount >= withdrawal.amount) {
      // تنفيذ السحب
      investor.amount -= withdrawal.amount;
      dailySummary.totalInvestments -= withdrawal.amount;
      
      // تحديث حالة المعاملة
      withdrawal.processed = true;
      withdrawal.processingDate = getCurrentDate();
      
      showNotification(`تم تنفيذ السحب بمبلغ ${numberWithCommas(withdrawal.amount)} د.ع بنجاح`, 'success');
    } else {
      showNotification(`تعذر تنفيذ السحب بسبب عدم كفاية الرصيد!`, 'error');
      withdrawal.processingError = true;
      withdrawal.notes += ' (تعذر التنفيذ بسبب عدم كفاية الرصيد)';
    }
    
    // حفظ البيانات
    saveData();
    
    // تحديث صفحة السحوبات
    renderWithdrawalsPage();
  }
  
  // تصدير تقرير السحوبات
  function exportWithdrawalsReport() {
    // الحصول على جميع معاملات السحب
    const allWithdrawals = transactions
      .filter(t => t.type === 'withdrawal')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // تنسيق البيانات للتصدير
    const reportData = allWithdrawals.map(withdrawal => {
      const investor = investors.find(inv => inv.id === withdrawal.investorId);
      return {
        المستثمر: investor ? investor.name : 'غير معروف',
        المبلغ: withdrawal.amount,
        تاريخ_الجدولة: formatDate(withdrawal.date),
        تاريخ_التنفيذ: withdrawal.processed ? formatDate(withdrawal.processingDate || withdrawal.date) : 
          (withdrawal.isScheduled ? formatDate(withdrawal.scheduledWithdrawalDate) : formatDate(withdrawal.date)),
        الحالة: withdrawal.processed ? 'تم التنفيذ' : 
          (withdrawal.processingError ? 'فشل التنفيذ' : 'في الانتظار'),
        نوع_السحب: withdrawal.isScheduled ? 'مجدول' : 'فوري',
        ملاحظات: withdrawal.notes || '-'
      };
    });
    
    // تحويل البيانات إلى CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // إضافة رأس الجدول
    const headers = Object.keys(reportData[0]);
    csvContent += headers.join(",") + "\r\n";
    
    // إضافة الصفوف
    reportData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvContent += values.join(",") + "\r\n";
    });
    
    // إنشاء رابط التنزيل
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير_السحوبات_${getCurrentDate()}.csv`);
    document.body.appendChild(link);
    
    // النقر على الرابط لبدء التنزيل
    link.click();
    
    // إزالة الرابط من المستند
    document.body.removeChild(link);
    
    showNotification('تم تصدير تقرير السحوبات بنجاح', 'success');
  }