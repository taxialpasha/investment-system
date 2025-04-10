// دوال لإدارة شريط الإعدادات الجانبي

// تهيئة شريط الإعدادات الجانبي
function initSidebar() {
  const sidebarContainer = document.getElementById('settings-sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const mainContent = document.querySelector('.main-content') || document.getElementById('main-content');
  
  if (!sidebarContainer || !sidebarToggle) {
    console.error('لم يتم العثور على عناصر الشريط الجانبي');
    return;
  }
  
  // ضبط موضع الشريط وفقًا لارتفاع الهيدر
  const header = document.querySelector('header');
  if (header) {
    const headerHeight = header.offsetHeight;
    sidebarContainer.style.top = `${headerHeight}px`;
    sidebarContainer.style.height = `calc(100vh - ${headerHeight}px)`;
  }
  
  // إظهار الشريط افتراضيًا
  sidebarContainer.classList.remove('collapsed');
  
  // تحديث تنسيق المحتوى الرئيسي
  if (mainContent) {
    mainContent.classList.add('with-sidebar');
    mainContent.classList.remove('with-collapsed-sidebar');
  }
  
  // حدث النقر على زر التبديل
  sidebarToggle.addEventListener('click', function() {
    sidebarContainer.classList.toggle('collapsed');
    
    if (mainContent) {
      if (sidebarContainer.classList.contains('collapsed')) {
        mainContent.classList.remove('with-sidebar');
        mainContent.classList.add('with-collapsed-sidebar');
      } else {
        mainContent.classList.add('with-sidebar');
        mainContent.classList.remove('with-collapsed-sidebar');
      }
    }
    
    // حفظ حالة الشريط
    localStorage.setItem('sidebarState', 
      sidebarContainer.classList.contains('collapsed') ? 'collapsed' : 'expanded');
  });
  
  // استعادة حالة الشريط من التخزين المحلي
  const savedState = localStorage.getItem('sidebarState');
  if (savedState === 'collapsed') {
    sidebarContainer.classList.add('collapsed');
    if (mainContent) {
      mainContent.classList.remove('with-sidebar');
      mainContent.classList.add('with-collapsed-sidebar');
    }
  }
  
  // بقية إعداد الشريط...
  setupSidebarMenuItems();
  setupQuickActions();
  
  if (selectedInvestor) {
    updateSidebar(selectedInvestor.id);
  }
}

// تعديل موضع الشريط الجانبي ليتناسب مع شريط العنوان
function adjustSidebarPosition() {
  const sidebarContainer = document.getElementById('settings-sidebar');
  const header = document.querySelector('header');
  
  if (sidebarContainer && header) {
    const headerHeight = header.offsetHeight;
    sidebarContainer.style.top = `${headerHeight}px`;
    sidebarContainer.style.height = `calc(100vh - ${headerHeight}px)`;
  }
}

// تبديل حالة ظهور/إخفاء الشريط الجانبي
function toggleSidebar() {
  const sidebar = document.getElementById('settings-sidebar');
  const mainContent = document.querySelector('.main-content');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  
  if (!sidebar) return;
  
  // تبديل الفئة للشريط الجانبي
  sidebar.classList.toggle('collapsed');
  
  // تحديث فئة المحتوى الرئيسي
  if (mainContent) {
    if (sidebar.classList.contains('collapsed')) {
      mainContent.classList.remove('with-sidebar');
      mainContent.classList.add('with-collapsed-sidebar');
      localStorage.setItem('sidebarState', 'collapsed');
    } else {
      mainContent.classList.add('with-sidebar');
      mainContent.classList.remove('with-collapsed-sidebar');
      localStorage.setItem('sidebarState', 'expanded');
      
      // عرض الستارة الخلفية في الجوال
      if (window.innerWidth <= 768 && mobileBackdrop) {
        mobileBackdrop.classList.add('active');
      }
    }
  }
  
  // الحصول على أيقونة زر التبديل وتدويرها
  const toggleIcon = document.querySelector('#sidebar-toggle i');
  if (toggleIcon) {
    toggleIcon.style.transform = sidebar.classList.contains('collapsed') ? 'rotate(0deg)' : 'rotate(180deg)';
  }
}
  
  // إعداد مستمعات الأحداث لعناصر القائمة
  function setupSidebarMenuItems() {
    // تعديل بيانات المستثمر
    document.getElementById('menu-investor-data').addEventListener('click', () => {
      editInvestor(selectedInvestor);
      highlightMenuItem('menu-investor-data');
    });
    
    // تعديل نسبة الربح المخصصة
    document.getElementById('menu-profit-rate').addEventListener('click', () => {
      showCustomProfitRateModal(selectedInvestor.id);
      highlightMenuItem('menu-profit-rate');
    });
    
    // جدولة الدفعات
    document.getElementById('menu-payment-schedule').addEventListener('click', () => {
      showPaymentScheduleModal(selectedInvestor.id);
      highlightMenuItem('menu-payment-schedule');
    });
    
    // حاسبة الاستثمار
    document.getElementById('menu-investment-calculator').addEventListener('click', () => {
      showInvestmentCalculator(selectedInvestor.id);
      highlightMenuItem('menu-investment-calculator');
    });
    
    // عرض مخطط الأرباح
    document.getElementById('menu-profit-chart').addEventListener('click', () => {
      showProfitChart(selectedInvestor.id);
      highlightMenuItem('menu-profit-chart');
    });
    
    // عرض تفاصيل حساب الأرباح
    document.getElementById('menu-profit-details').addEventListener('click', () => {
      showProfitDetailsModal(selectedInvestor.id);
      highlightMenuItem('menu-profit-details');
    });
    
    // تصدير البيانات
    document.getElementById('menu-export-data').addEventListener('click', () => {
      exportInvestorData(selectedInvestor.id);
      highlightMenuItem('menu-export-data');
    });
    
    // إعداد تذكيرات
    document.getElementById('menu-reminder').addEventListener('click', () => {
      showScheduleReminderModal(selectedInvestor.id);
      highlightMenuItem('menu-reminder');
    });
    
    // إعدادات الإشعارات
    document.getElementById('menu-notifications').addEventListener('click', () => {
      showNotificationsSettingsModal(selectedInvestor.id);
      highlightMenuItem('menu-notifications');
    });
    
    // حذف المستثمر
    document.getElementById('menu-delete-investor').addEventListener('click', () => {
      deleteInvestor(selectedInvestor.id);
    });
  }
  
  // إعداد مستمعات الأحداث للإجراءات السريعة
  function setupQuickActions() {
    // دفع الأرباح
    document.getElementById('quick-pay-profit').addEventListener('click', () => {
      payDueProfits(selectedInvestor.id);
    });
    
    // إضافة استثمار
    document.getElementById('quick-add-investment').addEventListener('click', () => {
      showAddTransactionModal('investment', selectedInvestor);
    });
    
    // طباعة كشف حساب
    document.getElementById('quick-print').addEventListener('click', () => {
      printInvestorStatement(selectedInvestor.id);
    });
    
    // إرسال تقرير عبر الواتساب
    document.getElementById('quick-whatsapp').addEventListener('click', () => {
      sendWhatsappReport(selectedInvestor.id);
    });
  }
  
  // إضاءة عنصر القائمة المحدد
  function highlightMenuItem(menuId) {
    // إزالة الفئة النشطة من جميع عناصر القائمة
    const menuItems = document.querySelectorAll('.sidebar-menu-item');
    menuItems.forEach(item => {
      item.classList.remove('active');
    });
    
    // إضافة الفئة النشطة للعنصر المحدد
    document.getElementById(menuId).classList.add('active');
  }
  
  // تحديث بيانات الشريط الجانبي للمستثمر المحدد
  function updateSidebar(investorId) {
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) return;
    
    // تحديث الحرف الأول من اسم المستثمر
    document.getElementById('investor-initial').innerText = investor.name.charAt(0);
    
    // حساب البيانات المالية
    const investorTransactions = transactions.filter(
      trans => trans.investorId === investorId
    );
    
    const payoutTransactions = investorTransactions.filter(t => t.type === 'payout');
    const totalPayouts = payoutTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyProfit = calculateMonthlyProfit(investor.amount);
    const totalEarnedProfit = calculateTotalEarnedProfit(investorId);
    const remainingProfit = totalEarnedProfit - totalPayouts;
    
    // تحديث البيانات المالية في الشريط الجانبي
    document.getElementById('sidebar-total-amount').innerText = numberWithCommas(investor.amount) + ' د.ع';
    document.getElementById('sidebar-monthly-profit').innerText = numberWithCommas(monthlyProfit) + ' د.ع';
    document.getElementById('sidebar-due-profit').innerText = numberWithCommas(remainingProfit) + ' د.ع';
    
    // تحديث نص دورة الدفع
    const paymentCycleBadge = document.querySelector('#menu-payment-schedule .sidebar-badge');
    paymentCycleBadge.innerText = getPaymentCycleText(investor.paymentCycle || 'monthly');
  }
  
  // الحصول على النص المناسب لدورة الدفع
  function getPaymentCycleText(cycle) {
    switch (cycle) {
      case 'monthly': return 'شهري';
      case 'quarterly': return 'ربعي';
      case 'biannual': return 'نصف سنوي';
      case 'annual': return 'سنوي';
      default: return 'شهري';
    }
  }
  
  // إضافة دالة جديدة لعرض نافذة تعديل نسبة الربح المخصصة
  function showCustomProfitRateModal(investorId) {
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) return;
    
    // إنشاء نافذة تعديل نسبة الربح
    showModal({
      title: 'تعديل نسبة الربح المخصصة',
      content: `
        <div class="form-group mb-3">
          <label class="block text-sm font-bold mb-1">نسبة الربح الحالية: ${investor.customProfitRate || profitRate}%</label>
          <input type="number" id="custom-profit-rate" class="form-control" value="${investor.customProfitRate || profitRate}" step="0.1" min="0" max="100">
          <p class="text-xs text-gray-500 mt-1">النسبة العامة للنظام: ${profitRate}%</p>
        </div>
      `,
      onConfirm: () => {
        // الحصول على القيمة من حقل الإدخال
        const customRateInput = document.getElementById('custom-profit-rate');
        const customRate = parseFloat(customRateInput.value);
        
        // التحقق من صحة القيمة
        if (isNaN(customRate) || customRate < 0 || customRate > 100) {
          showNotification('يرجى إدخال نسبة ربح صحيحة (0-100)', 'error');
          return;
        }
        
        // تحديث نسبة الربح المخصصة للمستثمر
        investor.customProfitRate = customRate;
        
        // حفظ البيانات
        saveData();
        
        // إظهار إشعار بنجاح العملية
        showNotification('تم حفظ نسبة الربح المخصصة بنجاح', 'success');
        
        // تحديث الواجهة
        renderInvestorDetailsPage();
        updateSidebar(investorId);
      }
    });
  }
  
  // إضافة دالة جديدة لعرض نافذة جدولة الدفعات
  function showPaymentScheduleModal(investorId) {
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) return;
    
    // إنشاء نافذة جدولة الدفعات
    showModal({
      title: 'إعدادات جدولة الدفعات',
      content: `
        <div class="form-group mb-3">
          <label class="block text-sm font-bold mb-1">دورة الدفع</label>
          <select id="payment-cycle" class="form-control">
            <option value="monthly" ${investor.paymentCycle === 'monthly' ? 'selected' : ''}>شهري</option>
            <option value="quarterly" ${investor.paymentCycle === 'quarterly' ? 'selected' : ''}>ربع سنوي</option>
            <option value="biannual" ${investor.paymentCycle === 'biannual' ? 'selected' : ''}>نصف سنوي</option>
            <option value="annual" ${investor.paymentCycle === 'annual' ? 'selected' : ''}>سنوي</option>
          </select>
        </div>
        <div class="form-group mb-3">
          <label class="block text-sm font-bold mb-1">يوم الدفع من الشهر</label>
          <select id="payment-day" class="form-control">
            ${generatePaymentDayOptions(investor.paymentDay || 1)}
          </select>
        </div>
        <div class="form-check mb-3">
          <input type="checkbox" id="send-reminder" class="form-check-input" ${investor.sendReminder ? 'checked' : ''}>
          <label class="form-check-label" for="send-reminder">إرسال تذكير قبل موعد الدفع</label>
        </div>
        <div class="form-group" id="reminder-days-group" ${investor.sendReminder ? '' : 'style="display: none;"'}>
          <label class="block text-sm font-bold mb-1">عدد أيام التذكير قبل الدفع</label>
          <select id="reminder-days" class="form-control">
            <option value="1" ${investor.reminderDays === 1 ? 'selected' : ''}>يوم واحد</option>
            <option value="3" ${investor.reminderDays === 3 ? 'selected' : ''}>3 أيام</option>
            <option value="7" ${investor.reminderDays === 7 ? 'selected' : ''}>أسبوع</option>
          </select>
        </div>
      `,
      onRender: () => {
        // إضافة مستمع الأحداث لخيار التذكير
        document.getElementById('send-reminder').addEventListener('change', function() {
          const reminderDaysGroup = document.getElementById('reminder-days-group');
          if (this.checked) {
            reminderDaysGroup.style.display = 'block';
          } else {
            reminderDaysGroup.style.display = 'none';
          }
        });
      },
      onConfirm: () => {
        // الحصول على القيم من النموذج
        const paymentCycle = document.getElementById('payment-cycle').value;
        const paymentDay = parseInt(document.getElementById('payment-day').value);
        const sendReminder = document.getElementById('send-reminder').checked;
        const reminderDays = sendReminder ? parseInt(document.getElementById('reminder-days').value) : 0;
        
        // تحديث بيانات المستثمر
        investor.paymentCycle = paymentCycle;
        investor.paymentDay = paymentDay;
        investor.sendReminder = sendReminder;
        investor.reminderDays = reminderDays;
        
        // حفظ البيانات
        saveData();
        
        // إظهار إشعار بنجاح العملية
        showNotification('تم حفظ إعدادات جدولة الدفعات بنجاح', 'success');
        
        // تحديث الواجهة
        updateSidebar(investorId);
      }
    });
  }
  
  // دالة مساعدة لإنشاء خيارات أيام الدفع
  function generatePaymentDayOptions(selectedDay = 1) {
    let options = '';
    for (let i = 1; i <= 28; i++) {
      options += `<option value="${i}" ${i === selectedDay ? 'selected' : ''}>${i}</option>`;
    }
    // إضافة خيارات إضافية للأيام الأخيرة من الشهر
    options += `<option value="29" ${selectedDay === 29 ? 'selected' : ''}>29</option>`;
    options += `<option value="30" ${selectedDay === 30 ? 'selected' : ''}>30</option>`;
    options += `<option value="31" ${selectedDay === 31 ? 'selected' : ''}>31 (آخر يوم في الشهر)</option>`;
    return options;
  }
  
  // إضافة دالة جديدة لعرض نافذة إعدادات الإشعارات
  function showNotificationsSettingsModal(investorId) {
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) return;
    
    // إنشاء نافذة إعدادات الإشعارات
    showModal({
      title: 'إعدادات الإشعارات',
      content: `
        <div class="form-check mb-3">
          <input type="checkbox" id="notify-on-profit" class="form-check-input" ${investor.notifyOnProfit ? 'checked' : ''}>
          <label class="form-check-label" for="notify-on-profit">إشعار عند استحقاق الأرباح</label>
        </div>
        <div class="form-check mb-3">
          <input type="checkbox" id="notify-on-payment" class="form-check-input" ${investor.notifyOnPayment ? 'checked' : ''}>
          <label class="form-check-label" for="notify-on-payment">إشعار عند تسجيل دفعة جديدة</label>
        </div>
        <div class="form-check mb-3">
          <input type="checkbox" id="notify-on-investment" class="form-check-input" ${investor.notifyOnInvestment ? 'checked' : ''}>
          <label class="form-check-label" for="notify-on-investment">إشعار عند إضافة استثمار جديد</label>
        </div>
        <div class="form-group mb-3">
          <label class="block text-sm font-bold mb-1">طريقة الإشعار</label>
          <select id="notification-method" class="form-control">
            <option value="app" ${investor.notificationMethod === 'app' ? 'selected' : ''}>داخل التطبيق فقط</option>
            <option value="whatsapp" ${investor.notificationMethod === 'whatsapp' ? 'selected' : ''}>واتساب</option>
            <option value="both" ${investor.notificationMethod === 'both' ? 'selected' : ''}>التطبيق وواتساب معاً</option>
          </select>
        </div>
        <div class="form-group mb-3" id="whatsapp-number-group" ${investor.notificationMethod === 'app' ? 'style="display: none;"' : ''}>
          <label class="block text-sm font-bold mb-1">رقم الواتساب للإشعارات</label>
          <input type="tel" id="whatsapp-number" class="form-control" value="${investor.whatsappNumber || investor.phone || ''}">
          <p class="text-xs text-gray-500 mt-1">يرجى إدخال الرقم بصيغة دولية، مثال: 9647800000000+</p>
        </div>
      `,
      onRender: () => {
        // إضافة مستمع الأحداث لطريقة الإشعار
        document.getElementById('notification-method').addEventListener('change', function() {
          const whatsappNumberGroup = document.getElementById('whatsapp-number-group');
          if (this.value === 'app') {
            whatsappNumberGroup.style.display = 'none';
          } else {
            whatsappNumberGroup.style.display = 'block';
          }
        });
      },
      onConfirm: () => {
        // الحصول على القيم من النموذج
        const notifyOnProfit = document.getElementById('notify-on-profit').checked;
        const notifyOnPayment = document.getElementById('notify-on-payment').checked;
        const notifyOnInvestment = document.getElementById('notify-on-investment').checked;
        const notificationMethod = document.getElementById('notification-method').value;
        const whatsappNumber = document.getElementById('whatsapp-number').value.trim();
        
        // التحقق من رقم الواتساب إذا كان مطلوباً
        if (notificationMethod !== 'app' && !whatsappNumber) {
          showNotification('يرجى إدخال رقم واتساب صحيح للإشعارات', 'error');
          return;
        }
        
        // تحديث بيانات المستثمر
        investor.notifyOnProfit = notifyOnProfit;
        investor.notifyOnPayment = notifyOnPayment;
        investor.notifyOnInvestment = notifyOnInvestment;
        investor.notificationMethod = notificationMethod;
        investor.whatsappNumber = whatsappNumber;
        
        // حفظ البيانات
        saveData();
        
        // إظهار إشعار بنجاح العملية
        showNotification('تم حفظ إعدادات الإشعارات بنجاح', 'success');
      }
    });
  }
  
  // تعديل دالة renderInvestorDetailsPage لإضافة الشريط الجانبي
  function renderInvestorDetailsPage() {
    if (!selectedInvestor) {
      navigateTo('investors');
      return;
    }
    
    const mainContent = document.getElementById('main-content');
    
    // الحصول على معاملات المستثمر
    const investorTransactions = transactions.filter(
      trans => trans.investorId === selectedInvestor.id
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // فصل معاملات الاستثمار عن الدفعات والسحوبات
    const investmentTransactions = investorTransactions.filter(t => t.type === 'investment');
    const payoutTransactions = investorTransactions.filter(t => t.type === 'payout');
    const withdrawalTransactions = investorTransactions.filter(t => t.type === 'withdrawal');
    
    // حساب إجمالي الاستثمارات والأرباح المدفوعة والسحوبات
    const totalInvestments = investmentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalPayouts = payoutTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = withdrawalTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // حساب المدة بالأشهر من تاريخ البدء
    const startDate = new Date(selectedInvestor.startDate);
    const currentDate = new Date();
    const months = (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
      (currentDate.getMonth() - startDate.getMonth());
    
    // حساب الأرباح النسبية للشهر الحالي
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const profitData = calculateProportionalProfit(
      selectedInvestor.id, 
      firstDayOfMonth.toISOString().split('T')[0], 
      Math.min(today.getDate(), lastDayOfMonth.getDate()) === today.getDate() 
        ? today.toISOString().split('T')[0]
        : lastDayOfMonth.toISOString().split('T')[0]
    );
    
    // إنشاء قسم لعرض الاستثمارات المنفصلة
    let separateInvestmentsHTML = '';
    
    // ترتيب الاستثمارات حسب التاريخ (الأحدث أولاً)
    const sortedInvestments = [...investmentTransactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    
    if (sortedInvestments.length > 0) {
      separateInvestmentsHTML = `
        <div class="card p-4 mb-4">
          <h3 class="font-bold mb-2">الاستثمارات المنفصلة</h3>
          <div class="grid grid-cols-1 gap-3">
      `;
      
      for (const investment of sortedInvestments) {
        const investmentDate = new Date(investment.date);
        
        // حساب أرباح هذا الاستثمار المحدد منذ تاريخ إنشائه
        const singleInvestmentProfit = (investment.amount / 1000000) * profitRate * 1000;
        
        // حساب عدد الأيام منذ الاستثمار
        const daysSinceInvestment = Math.floor((currentDate - investmentDate) / (1000 * 60 * 60 * 24));
        
        // حساب الربح النسبي لهذا الاستثمار فقط
        const dailyRate = profitRate / 30 / 100;
        const accumulatedProfit = (investment.amount / 1000000) * dailyRate * 1000 * daysSinceInvestment;
        
        separateInvestmentsHTML += `
          <div class="card card-${daysSinceInvestment < 30 ? 'yellow' : 'green'}-light p-3 rounded-lg">
            <div class="flex justify-between mb-1">
              <div>
                <p class="font-medium">مبلغ: ${numberWithCommas(investment.amount)} د.ع</p>
                <p class="text-xs text-gray-500">تاريخ: ${formatDate(investment.date)}</p>
              </div>
              <div class="text-right">
                <p class="font-bold ${daysSinceInvestment < 30 ? 'text-yellow-600' : 'text-green-600'}">
                  ${numberWithCommas(Math.round(singleInvestmentProfit))} د.ع
                </p>
                <p class="text-xs text-gray-500">ربح شهري</p>
              </div>
            </div>
            <div class="mt-2">
              <p class="text-sm">الربح المتراكم: <span class="font-bold text-blue-600">${numberWithCommas(Math.round(accumulatedProfit))} د.ع</span></p>
              <p class="text-xs text-gray-500">منذ ${daysSinceInvestment} يوم (${(daysSinceInvestment / 30).toFixed(1)} شهر)</p>
            </div>
            ${investment.notes ? `<p class="text-xs text-gray-500 mt-1">ملاحظات: ${investment.notes}</p>` : ''}
          </div>
        `;
      }
      
      separateInvestmentsHTML += `
          </div>
        </div>
      `;
    }
    
    let html = `
      <div class="container animate-fadeIn main-content with-sidebar">
        <div class="flex items-center mb-4">
          <button 
            class="btn btn-icon btn-gray ml-2"
            id="back-to-investors"
          >
            <i class="fas fa-arrow-right"></i>
          </button>
          <h1 class="text-xl font-bold">تفاصيل المستثمر</h1>
        </div>
        
        <!-- بطاقة بيانات المستثمر -->
        <div class="card mb-4">
          <div class="flex justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="badge badge-primary" style="width: 40px; height: 40px; font-size: 1.25rem;">
                ${selectedInvestor.name.charAt(0)}
              </div>
              <h2 class="text-lg font-bold">${selectedInvestor.name}</h2>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="flex items-center gap-2">
              <i class="fas fa-phone-alt text-gray-500"></i>
              <div>
                <p class="text-xs text-gray-500">رقم الهاتف</p>
                <p>${selectedInvestor.phone || "غير متوفر"}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <i class="fas fa-map-marker-alt text-gray-500"></i>
              <div>
                <p class="text-xs text-gray-500">العنوان</p>
                <p>${selectedInvestor.address || "غير متوفر"}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <i class="fas fa-id-card text-gray-500"></i>
              <div>
                <p class="text-xs text-gray-500">رقم الهوية</p>
                <p>${selectedInvestor.idCard || "غير متوفر"}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <i class="fas fa-calendar-alt text-gray-500"></i>
              <div>
                <p class="text-xs text-gray-500">تاريخ البدء</p>
                <p>${formatDate(selectedInvestor.startDate)}</p>
                <p class="text-xs text-blue-600">منذ ${months} شهر</p>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="card-blue-light p-3 rounded-lg">
              <div class="flex justify-between mb-1">
                <p class="font-medium">مبلغ الاستثمار الإجمالي</p>
                <p class="font-bold">${numberWithCommas(selectedInvestor.amount)} د.ع</p>
              </div>
              <div class="text-xs text-gray-500">إجمالي المبالغ المستثمرة (${investmentTransactions.length} استثمار)</div>
            </div>
            
            <div class="card-green-light p-3 rounded-lg">
              <div class="flex justify-between mb-1">
                <p class="font-medium">الربح الشهري الإجمالي (${profitRate}%)</p>
                <p class="font-bold text-green-600">
                  ${numberWithCommas(calculateMonthlyProfit(selectedInvestor.amount))} د.ع
                </p>
              </div>
              <div class="text-xs text-gray-500">على أساس المبلغ الإجمالي الحالي</div>
            </div>
          </div>
          
          <!-- قسم الأرباح النسبية -->
          <div class="card card-yellow-light p-3 rounded-lg mb-4">
            <h3 class="font-bold mb-2">الأرباح النسبية للشهر الحالي:</h3>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <p class="text-sm">الربح المحسوب حتى الآن:</p>
                <p class="font-bold text-blue-600">${numberWithCommas(profitData.totalProfit)} د.ع</p>
                <p class="text-xs text-gray-500">(${Math.floor((today.getDate() / lastDayOfMonth.getDate()) * 100)}% من الشهر)</p>
              </div>
              <div>
                <p class="text-sm">الربح المتوقع نهاية الشهر:</p>
                <p class="font-bold text-green-600">${numberWithCommas(profitData.projectedMonthlyProfit)} د.ع</p>
              </div>
            </div>
          </div>
          
          <!-- إضافة قسم استعراض الاستثمارات المنفصلة -->
          ${separateInvestmentsHTML}
          
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="stats-card stats-card-primary">
              <div class="icon-bg">
                <i class="fas fa-money-bill-wave"></i>
              </div>
              <p class="text-sm text-gray-500">إجمالي الاستثمارات</p>
              <p class="text-xl font-bold">${numberWithCommas(totalInvestments)} د.ع</p>
              <p class="text-xs text-blue-600 mt-1">
                ${investmentTransactions.length} عملية
              </p>
            </div>
            
            <div class="stats-card stats-card-secondary">
              <div class="icon-bg">
                <i class="fas fa-hand-holding-usd"></i>
              </div>
              <p class="text-sm text-gray-500">إجمالي الأرباح المدفوعة</p>
              <p class="text-xl font-bold">${numberWithCommas(totalPayouts)} د.ع</p>
              <p class="text-xs text-green-600 mt-1">
                ${payoutTransactions.length} عملية
              </p>
            </div>
            
            <div class="stats-card stats-card-danger">
              <div class="icon-bg">
                <i class="fas fa-money-bill-alt"></i>
              </div>
              <p class="text-sm text-gray-500">إجمالي السحوبات</p>
              <p class="text-xl font-bold">${numberWithCommas(totalWithdrawals)} د.ع</p>
              <p class="text-xs text-red-600 mt-1">
                ${withdrawalTransactions.length} عملية
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
            <button 
              class="flex-1 btn btn-danger"
              id="add-withdrawal-btn"
            >
              <i class="fas fa-money-bill-alt ml-1"></i>
              سحب أموال
            </button>
          </div>
        </div>
        
        <!-- قسم سجل المعاملات -->
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
        // إضافة عرض أكثر تفصيلاً لمعاملات الاستثمار
        let transactionDetails = '';
        
        if (transaction.type === 'investment') {
          // حساب الربح الشهري لهذا الاستثمار
          const singleInvestmentProfit = (transaction.amount / 1000000) * profitRate * 1000;
          
          transactionDetails = `
            <div class="flex items-center gap-3 mt-2">
              <span class="badge badge-primary">ربح شهري</span>
              <span class="text-green-600 font-bold">${numberWithCommas(Math.round(singleInvestmentProfit))} د.ع</span>
            </div>
          `;
        }
        
        html += `
          <div class="list-item">
            <div class="flex justify-between items-center">
              <div>
                <div class="flex items-center gap-2">
                  <i class="fas ${getTransactionIcon(transaction.type)} ${getTransactionColorClass(transaction.type)}"></i>
                  <p class="text-sm">${formatDate(transaction.date)}</p>
                </div>
                <p class="text-xs text-gray-500">${transaction.notes || 'بدون ملاحظات'}</p>
                ${transactionDetails}
              </div>
              <div class="text-right">
                <p class="font-bold ${getTransactionColorClass(transaction.type)}">
                  ${transaction.type === 'payout' || transaction.type === 'withdrawal' ? '-' : '+'}${numberWithCommas(transaction.amount)} د.ع
                </p>
                <p class="text-xs">${getTransactionTypeName(transaction.type)}</p>
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
      
      <!-- إضافة شريط الإعدادات الجانبي -->
      ${document.getElementById('settings-sidebar') ? '' : document.getElementById('sidebar-template').innerHTML}
      <div id="mobile-backdrop" class="mobile-backdrop"></div>
    `;
    
    mainContent.innerHTML = html;
    
    // إضافة المستمعين للأحداث
    document.getElementById('back-to-investors').addEventListener('click', () => {
      selectedInvestor = null;
      navigateTo('investors');
    });
    
    document.getElementById('add-payout-btn').addEventListener('click', () => {
      showAddTransactionModal('payout', selectedInvestor);
    });
    
    document.getElementById('add-investment-btn').addEventListener('click', () => {
      showAddTransactionModal('investment', selectedInvestor);
    });
    
    // إضافة مستمع حدث لزر سحب الأموال
    document.getElementById('add-withdrawal-btn').addEventListener('click', () => {
      showAddTransactionModal('withdrawal', selectedInvestor);
    });
    
    // تهيئة الشريط الجانبي
    initSidebar();
    
    // تحديث بيانات الشريط الجانبي
    updateSidebar(selectedInvestor.id);
  }
  
  // يجب إضافة قالب الشريط الجانبي إلى ملف HTML الرئيسي
  function addSidebarTemplate() {
    // إنشاء عنصر قالب للشريط الجانبي
    const template = document.createElement('template');
    template.id = 'sidebar-template';
    template.innerHTML = document.getElementById('settings-sidebar-html').innerHTML;
    document.body.appendChild(template);
  }



  // كود لتكامل شريط الإعدادات الجانبي مع صفحة المستثمرين

// إضافة قالب الشريط الجانبي إلى ملف HTML الرئيسي
document.addEventListener('DOMContentLoaded', function() {
    // إنشاء عنصر للقالب
    const template = document.createElement('template');
    template.id = 'sidebar-template';
    
    // قالب الشريط الجانبي
    template.innerHTML = `
      <!-- شريط الإعدادات الجانبي -->
      <div id="settings-sidebar" class="sidebar-container">
        <!-- زر تبديل عرض/إخفاء الشريط -->
        <button id="sidebar-toggle" class="sidebar-toggle">
          <i class="fas fa-chevron-right"></i>
        </button>
        
        <!-- رأس الشريط الجانبي -->
        <div class="sidebar-header">
          <div class="d-flex justify-content-between align-items-center">
            <div>إعدادات المستثمر</div>
            <div id="investor-initial" class="badge badge-light">أ</div>
          </div>
        </div>
        
        <!-- محتوى الشريط الجانبي -->
        <div class="sidebar-content">
          <!-- ملخص الاستثمار -->
          <div class="sidebar-section">
            <div class="sidebar-section-title">
              <i class="fas fa-chart-pie"></i>
              ملخص الاستثمار
            </div>
            <div class="mt-2">
              <div class="d-flex justify-content-between mb-1">
                <span>المبلغ الإجمالي:</span>
                <span id="sidebar-total-amount" class="font-weight-bold">1,000,000 د.ع</span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span>الربح الشهري:</span>
                <span id="sidebar-monthly-profit" class="font-weight-bold text-success">100,000 د.ع</span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span>الأرباح المستحقة:</span>
                <span id="sidebar-due-profit" class="font-weight-bold text-primary">250,000 د.ع</span>
              </div>
            </div>
          </div>
          
          <!-- مؤشر صحة الاستثمار -->
          <div class="sidebar-section">
            <div class="sidebar-section-title">
              <i class="fas fa-heartbeat"></i>
              حالة الاستثمار
            </div>
            <div class="mt-2">
              <div class="d-flex justify-content-between mb-1">
                <span>الصحة:</span>
                <span id="sidebar-health-percent" class="font-weight-bold text-success">85%</span>
              </div>
              <div class="health-meter">
                <div class="health-value" style="width: 85%;"></div>
              </div>
              <div class="mt-2">
                <div class="d-flex align-items-center text-success mb-1" style="font-size: 0.8rem;">
                  <i class="fas fa-check-circle mr-1"></i>
                  <span>مدفوعات منتظمة</span>
                </div>
                <div class="d-flex align-items-center text-success mb-1" style="font-size: 0.8rem;">
                  <i class="fas fa-check-circle mr-1"></i>
                  <span>نمو مستمر للاستثمار</span>
                </div>
                <div class="d-flex align-items-center text-warning" style="font-size: 0.8rem;">
                  <i class="fas fa-exclamation-circle mr-1"></i>
                  <span>تأخر دفعة واحدة سابقاً</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- الإجراءات السريعة -->
          <div class="sidebar-section">
            <div class="sidebar-section-title">
              <i class="fas fa-bolt"></i>
              إجراءات سريعة
            </div>
            <div class="sidebar-quick-actions">
              <div class="quick-action-btn" id="quick-pay-profit">
                <i class="fas fa-money-bill-wave"></i>
                <span>دفع الأرباح</span>
              </div>
              <div class="quick-action-btn" id="quick-add-investment">
                <i class="fas fa-plus"></i>
                <span>إضافة استثمار</span>
              </div>
              <div class="quick-action-btn" id="quick-print">
                <i class="fas fa-print"></i>
                <span>طباعة كشف</span>
              </div>
              <div class="quick-action-btn" id="quick-whatsapp">
                <i class="fab fa-whatsapp"></i>
                <span>إرسال تقرير</span>
              </div>
            </div>
          </div>
          
          <!-- قائمة الإعدادات -->
          <div class="sidebar-section">
            <div class="sidebar-section-title">
              <i class="fas fa-cog"></i>
              الإعدادات
            </div>
            <div>
              <div class="sidebar-menu-item" id="menu-investor-data">
                <i class="fas fa-user-edit"></i>
                <span>تعديل بيانات المستثمر</span>
              </div>
              <div class="sidebar-menu-item" id="menu-profit-rate">
                <i class="fas fa-percentage"></i>
                <span>نسبة الربح المخصصة</span>
              </div>
              <div class="sidebar-menu-item" id="menu-payment-schedule">
                <i class="fas fa-calendar-alt"></i>
                <span>جدولة الدفعات</span>
                <span class="sidebar-badge">شهري</span>
              </div>
              <div class="sidebar-menu-item" id="menu-investment-calculator">
                <i class="fas fa-calculator"></i>
                <span>حاسبة الاستثمار</span>
              </div>
            </div>
          </div>
          
          <!-- التحليلات -->
          <div class="sidebar-section">
            <div class="sidebar-section-title">
              <i class="fas fa-chart-line"></i>
              التحليلات
            </div>
            <div>
              <div class="sidebar-menu-item" id="menu-profit-chart">
                <i class="fas fa-chart-bar"></i>
                <span>مخطط الأرباح</span>
              </div>
              <div class="sidebar-menu-item" id="menu-profit-details">
                <i class="fas fa-file-invoice-dollar"></i>
                <span>تفاصيل حساب الأرباح</span>
              </div>
              <div class="sidebar-menu-item" id="menu-export-data">
                <i class="fas fa-file-export"></i>
                <span>تصدير البيانات</span>
              </div>
            </div>
          </div>
          
          <!-- خيارات متقدمة -->
          <div class="sidebar-section">
            <div class="sidebar-section-title">
              <i class="fas fa-sliders-h"></i>
              خيارات متقدمة
            </div>
            <div>
              <div class="sidebar-menu-item" id="menu-reminder">
                <i class="fas fa-bell"></i>
                <span>إعداد تذكيرات</span>
              </div>
              <div class="sidebar-menu-item" id="menu-notifications">
                <i class="fas fa-envelope"></i>
                <span>إعدادات الإشعارات</span>
              </div>
              <div class="sidebar-menu-item text-danger" id="menu-delete-investor">
                <i class="fas fa-trash"></i>
                <span>حذف المستثمر</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- الستارة الخلفية للجوال -->
      <div id="mobile-backdrop" class="mobile-backdrop"></div>
    `;
    
    // إضافة القالب إلى المستند
    document.body.appendChild(template);
    
    // إضافة أنماط CSS للشريط الجانبي
    addSidebarStyles();
  });
  
  // إضافة أنماط CSS للشريط الجانبي
  function addSidebarStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* أنماط شريط الإعدادات الجانبي */
      .sidebar-container {
        position: fixed;
        top: 0;
        right: 0;
        width: 280px;
        height: 100vh;
        background-color: #f8f9fa;
        border-right: 1px solid #dee2e6;
        z-index: 1000;
        overflow-y: auto;
        transition: transform 0.3s ease;
        box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
        direction: rtl;
      }
      
      .sidebar-container.collapsed {
        transform: translateX(250px);
      }
      
      .sidebar-toggle {
        position: absolute;
        top: 50%;
        right: 280px;
        transform: translateY(-50%);
        width: 30px;
        height: 50px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 5px 0 0 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1001;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
      }
      
      .sidebar-toggle i {
        transition: transform 0.3s ease;
      }
      
      .sidebar-container.collapsed .sidebar-toggle i {
        transform: rotate(180deg);
      }
      
      .sidebar-header {
        padding: 15px;
        background-color: var(--primary-color);
        color: white;
        font-weight: bold;
        text-align: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .sidebar-content {
        padding: 15px;
      }
      
      .sidebar-section {
        margin-bottom: 20px;
      }
      
      .sidebar-section-title {
        display: flex;
        align-items: center;
        font-weight: bold;
        font-size: 0.9rem;
        color: var(--primary-color);
        padding-bottom: 8px;
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 10px;
      }
      
      .sidebar-section-title i {
        margin-left: 8px;
      }
      
      .sidebar-menu-item {
        display: flex;
        align-items: center;
        padding: 8px 10px;
        margin-bottom: 5px;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.85rem;
      }
      
      .sidebar-menu-item:hover {
        background-color: rgba(var(--secondary-color-rgb), 0.1);
      }
      
      .sidebar-menu-item.active {
        background-color: rgba(var(--secondary-color-rgb), 0.2);
        font-weight: bold;
      }
      
      .sidebar-menu-item i {
        margin-left: 10px;
        font-size: 1rem;
        min-width: 20px;
        text-align: center;
      }
      
      .sidebar-badge {
        background-color: var(--secondary-color);
        color: white;
        font-size: 0.7rem;
        padding: 2px 6px;
        border-radius: 10px;
        margin-right: auto;
      }
      
      .health-meter {
        height: 6px;
        background-color: #e9ecef;
        border-radius: 3px;
        overflow: hidden;
        margin-top: 5px;
      }
      
      .health-value {
        height: 100%;
        background-color: var(--secondary-color);
        border-radius: 3px;
      }
      
      .sidebar-quick-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px;
        margin-top: 10px;
      }
      
      .quick-action-btn {
        background-color: white;
        border: 1px solid #dee2e6;
        border-radius: 5px;
        padding: 8px 5px;
        font-size: 0.75rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .quick-action-btn:hover {
        background-color: #f0f7ff;
        border-color: var(--secondary-color);
      }
      
      .quick-action-btn i {
        font-size: 1rem;
        margin-bottom: 5px;
        color: var(--secondary-color);
      }
      
      /* تكييف المحتوى الرئيسي مع وجود الشريط الجانبي */
      .main-content {
        transition: margin-right 0.3s ease;
      }
      
      .main-content.with-sidebar {
        margin-right: 280px;
      }
      
      .main-content.with-collapsed-sidebar {
        margin-right: 30px;
      }
      
      /* أنماط للوضع المتنقل */
      @media (max-width: 768px) {
        .sidebar-container {
          transform: translateX(100%);
          width: 100%;
          max-width: 320px;
        }
        
        .sidebar-container.active {
          transform: translateX(0);
        }
        
        .sidebar-toggle {
          right: 0;
          border-radius: 5px 0 0 5px;
        }
        
        .main-content.with-sidebar, 
        .main-content.with-collapsed-sidebar {
          margin-right: 0;
        }
        
        .mobile-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 999;
          display: none;
        }
        
        .mobile-backdrop.active {
          display: block;
        }
      }
    `;
    
    document.head.appendChild(styleElement);
  }
  
  // دالة لحساب صحة الاستثمار (مثال)
  function calculateInvestmentHealth(investorId) {
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) return { score: 0, status: [], issues: [] };
    
    // الحصول على معاملات المستثمر
    const investorTransactions = transactions.filter(
      trans => trans.investorId === investorId
    );
    
    // فصل معاملات الدفع
    const payoutTransactions = investorTransactions.filter(t => t.type === 'payout');
    
    // حساب مدة الاستثمار بالأشهر
    const startDate = new Date(investor.startDate);
    const currentDate = new Date();
    const investmentMonths = (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
      (currentDate.getMonth() - startDate.getMonth());
    
    // حساب عدد الدفعات المتوقعة بناءً على دورة الدفع
    let expectedPayouts = 0;
    switch (investor.paymentCycle || 'monthly') {
      case 'monthly':
        expectedPayouts = investmentMonths;
        break;
      case 'quarterly':
        expectedPayouts = Math.floor(investmentMonths / 3);
        break;
      case 'biannual':
        expectedPayouts = Math.floor(investmentMonths / 6);
        break;
      case 'annual':
        expectedPayouts = Math.floor(investmentMonths / 12);
        break;
    }
    
    // حساب نسبة الالتزام بالدفعات
    const paymentComplianceRatio = expectedPayouts > 0 ? 
      Math.min(payoutTransactions.length / expectedPayouts, 1) : 1;
    
    // حساب الأرباح المدفوعة والمستحقة
    const totalPayouts = payoutTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalEarnedProfit = calculateTotalEarnedProfit(investorId);
    const paymentCompletionRatio = totalEarnedProfit > 0 ? 
      Math.min(totalPayouts / totalEarnedProfit, 1) : 1;
    
    // حساب الدرجة النهائية (من 100)
    const score = Math.round(
      (paymentComplianceRatio * 50) + // 50٪ من الدرجة تعتمد على الالتزام بجدول الدفعات
      (paymentCompletionRatio * 30) + // 30٪ من الدرجة تعتمد على نسبة الدفع من الأرباح المستحقة
      20 // 20٪ نقاط أساسية لوجود الاستثمار
    );
    
    // تحديد حالة الصحة
    let healthStatus;
    if (score >= 90) {
      healthStatus = 'ممتاز';
    } else if (score >= 75) {
      healthStatus = 'جيد جداً';
    } else if (score >= 60) {
      healthStatus = 'جيد';
    } else if (score >= 40) {
      healthStatus = 'متوسط';
    } else {
      healthStatus = 'ضعيف';
    }
    
    // تحديد نقاط القوة
    const strengths = [];
    if (paymentComplianceRatio >= 0.8) {
      strengths.push('مدفوعات منتظمة');
    }
    if (paymentCompletionRatio >= 0.8) {
      strengths.push('دفع الأرباح المستحقة بانتظام');
    }
    if (investmentMonths >= 6) {
      strengths.push('استثمار مستمر لفترة طويلة');
    }
    if (investor.amount >= 10000000) {
      strengths.push('مبلغ استثماري كبير');
    }
    
    // تحديد المشاكل
    const issues = [];
    if (paymentComplianceRatio < 0.8) {
      issues.push('تأخر في بعض مواعيد الدفع');
    }
    if (paymentCompletionRatio < 0.8) {
      issues.push('تراكم الأرباح غير المدفوعة');
    }
    
    return {
      score,
      healthStatus,
      strengths,
      issues
    };
  }
  
  // تعديل الدالة updateSidebar لإضافة حساب صحة الاستثمار
  function updateSidebar(investorId) {
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) return;
    
    // تحديث الحرف الأول من اسم المستثمر
    document.getElementById('investor-initial').innerText = investor.name.charAt(0);
    
    // حساب البيانات المالية
    const investorTransactions = transactions.filter(
      trans => trans.investorId === investorId
    );
    
    const payoutTransactions = investorTransactions.filter(t => t.type === 'payout');
    const totalPayouts = payoutTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyProfit = calculateMonthlyProfit(investor.amount);
    const totalEarnedProfit = calculateTotalEarnedProfit(investorId);
    const remainingProfit = totalEarnedProfit - totalPayouts;
    
    // تحديث البيانات المالية في الشريط الجانبي
    document.getElementById('sidebar-total-amount').innerText = numberWithCommas(investor.amount) + ' د.ع';
    document.getElementById('sidebar-monthly-profit').innerText = numberWithCommas(monthlyProfit) + ' د.ع';
    document.getElementById('sidebar-due-profit').innerText = numberWithCommas(remainingProfit) + ' د.ع';
    
    // حساب وتحديث صحة الاستثمار
    const healthData = calculateInvestmentHealth(investorId);
    document.getElementById('sidebar-health-percent').innerText = healthData.score + '%';
    document.getElementById('sidebar-health-percent').className = 
      `font-weight-bold ${healthData.score >= 75 ? 'text-success' : healthData.score >= 50 ? 'text-warning' : 'text-danger'}`;
    
    document.querySelector('.health-value').style.width = healthData.score + '%';
    document.querySelector('.health-value').style.backgroundColor = 
      healthData.score >= 75 ? 'var(--success-color)' : 
      healthData.score >= 50 ? 'var(--warning-color)' : 
      'var(--danger-color)';
    
    // تحديث نقاط القوة والمشاكل
    const strengthsContainer = document.querySelector('.sidebar-section:nth-child(2) .mt-2');
    
    // حذف العناصر الموجودة
    while (strengthsContainer.children.length > 1) {
      strengthsContainer.removeChild(strengthsContainer.lastChild);
    }
    
    // إضافة نقاط القوة
    healthData.strengths.forEach(strength => {
      const strengthElement = document.createElement('div');
      strengthElement.className = 'd-flex align-items-center text-success mb-1';
      strengthElement.style.fontSize = '0.8rem';
      strengthElement.innerHTML = `
        <i class="fas fa-check-circle mr-1"></i>
        <span>${strength}</span>
      `;
      strengthsContainer.appendChild(strengthElement);
    });
    
    // إضافة المشاكل
    healthData.issues.forEach(issue => {
      const issueElement = document.createElement('div');
      issueElement.className = 'd-flex align-items-center text-warning mb-1';
      issueElement.style.fontSize = '0.8rem';
      issueElement.innerHTML = `
        <i class="fas fa-exclamation-circle mr-1"></i>
        <span>${issue}</span>
      `;
      strengthsContainer.appendChild(issueElement);
    });
    
    // تحديث نص دورة الدفع
    const paymentCycleBadge = document.querySelector('#menu-payment-schedule .sidebar-badge');
    paymentCycleBadge.innerText = getPaymentCycleText(investor.paymentCycle || 'monthly');
  }

  // دوال لإدارة شريط الإعدادات الجانبي المحسن

// تهيئة شريط الإعدادات الجانبي
function initSidebar() {
    // التأكد من وجود عناصر الشريط الجانبي
    const sidebarContainer = document.getElementById('settings-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mobileBackdrop = document.getElementById('mobile-backdrop');
    
    if (!sidebarContainer || !sidebarToggle) {
      console.error('لم يتم العثور على عناصر الشريط الجانبي اللازمة');
      return;
    }
    
    // تعديل موضع الشريط الجانبي ليتناسب مع شريط العنوان
    adjustSidebarPosition();
  
    // إضافة مستمع الأحداث لزر التبديل
    sidebarToggle.addEventListener('click', toggleSidebar);
    
    // إضافة مستمع الأحداث للستارة الخلفية في الجوال
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', closeSidebar);
    }
    
    // إضافة مستمعات الأحداث لعناصر القائمة
    setupSidebarMenuItems();
    
    // إضافة مستمعات الأحداث للإجراءات السريعة
    setupQuickActions();
    
    // التحقق من حالة الشريط الجانبي المخزنة
    const sidebarState = localStorage.getItem('sidebarState');
    if (sidebarState === 'collapsed') {
      toggleSidebar();
    }
    
    // تحديث بيانات المستثمر في الشريط الجانبي
    if (selectedInvestor) {
      updateSidebar(selectedInvestor.id);
    }
    
    // إضافة مستمع للتغيير في السمة (الوضع الداكن)
    document.getElementById('toggle-theme')?.addEventListener('click', function() {
      setTimeout(() => {
        if (selectedInvestor) {
          updateSidebar(selectedInvestor.id);
        }
      }, 100);
    });
    
    // إضافة مستمع للتغيير في حجم الشاشة
    window.addEventListener('resize', adjustSidebarPosition);
  }
  
  // تعديل موضع الشريط الجانبي ليتناسب مع شريط العنوان
  function adjustSidebarPosition() {
    const sidebarContainer = document.getElementById('settings-sidebar');
    const header = document.querySelector('header');
    
    if (sidebarContainer && header) {
      const headerHeight = header.offsetHeight;
      sidebarContainer.style.top = `${headerHeight}px`;
      sidebarContainer.style.height = `calc(100vh - ${headerHeight}px)`;
    }
  }
  
  // تبديل حالة ظهور/إخفاء الشريط الجانبي
  function toggleSidebar() {
    const sidebar = document.getElementById('settings-sidebar');
    const mainContent = document.querySelector('.main-content');
    const mobileBackdrop = document.getElementById('mobile-backdrop');
    
    if (!sidebar) return;
    
    // تبديل الفئة للشريط الجانبي
    sidebar.classList.toggle('collapsed');
    
    // تحديث فئة المحتوى الرئيسي
    if (mainContent) {
      if (sidebar.classList.contains('collapsed')) {
        mainContent.classList.remove('with-sidebar');
        mainContent.classList.add('with-collapsed-sidebar');
        localStorage.setItem('sidebarState', 'collapsed');
      } else {
        mainContent.classList.add('with-sidebar');
        mainContent.classList.remove('with-collapsed-sidebar');
        localStorage.setItem('sidebarState', 'expanded');
        
        // عرض الستارة الخلفية في الجوال
        if (window.innerWidth <= 768 && mobileBackdrop) {
          mobileBackdrop.classList.add('active');
        }
      }
    }
    
    // الحصول على أيقونة زر التبديل وتدويرها
    const toggleIcon = document.querySelector('#sidebar-toggle i');
    if (toggleIcon) {
      toggleIcon.style.transform = sidebar.classList.contains('collapsed') ? 'rotate(180deg)' : 'rotate(0deg)';
    }
    
    // تحريك محتوى الصفحة الرئيسية في الشاشات الكبيرة
    if (window.innerWidth > 768) {
      document.body.classList.toggle('sidebar-expanded', !sidebar.classList.contains('collapsed'));
    }
  }
  
  // إغلاق الشريط الجانبي (خاص بالجوال)
  function closeSidebar() {
    const sidebar = document.getElementById('settings-sidebar');
    const mainContent = document.querySelector('.main-content');
    const mobileBackdrop = document.getElementById('mobile-backdrop');
    
    if (!sidebar) return;
    
    // إغلاق الشريط فقط إذا كان مفتوحًا
    if (!sidebar.classList.contains('collapsed')) {
      // إضافة فئة الانهيار للشريط الجانبي
      sidebar.classList.add('collapsed');
      
      // تحديث فئة المحتوى الرئيسي
      if (mainContent) {
        mainContent.classList.remove('with-sidebar');
        mainContent.classList.add('with-collapsed-sidebar');
      }
      
      // إخفاء الستارة الخلفية
      if (mobileBackdrop) {
        mobileBackdrop.classList.remove('active');
      }
      
      // تحديث حالة التخزين المحلي
      localStorage.setItem('sidebarState', 'collapsed');
      
      // الحصول على أيقونة زر التبديل وتدويرها
      const toggleIcon = document.querySelector('#sidebar-toggle i');
      if (toggleIcon) {
        toggleIcon.style.transform = 'rotate(180deg)';
      }
    }
  }
  
  // إعداد مستمعات الأحداث لعناصر القائمة
  function setupSidebarMenuItems() {
    // تعديل بيانات المستثمر
    document.getElementById('menu-investor-data')?.addEventListener('click', () => {
      if (selectedInvestor) {
        editInvestor(selectedInvestor);
        highlightMenuItem('menu-investor-data');
      }
    });
    
    // تعديل نسبة الربح المخصصة
    document.getElementById('menu-profit-rate')?.addEventListener('click', () => {
      if (selectedInvestor) {
        showCustomProfitRateModal(selectedInvestor.id);
        highlightMenuItem('menu-profit-rate');
      }
    });
    
    // جدولة الدفعات
    document.getElementById('menu-payment-schedule')?.addEventListener('click', () => {
      if (selectedInvestor) {
        showPaymentScheduleModal(selectedInvestor.id);
        highlightMenuItem('menu-payment-schedule');
      }
    });
    
    // حاسبة الاستثمار
    document.getElementById('menu-investment-calculator')?.addEventListener('click', () => {
      if (selectedInvestor) {
        showInvestmentCalculator(selectedInvestor.id);
        highlightMenuItem('menu-investment-calculator');
      }
    });
    
    // عرض مخطط الأرباح
    document.getElementById('menu-profit-chart')?.addEventListener('click', () => {
      if (selectedInvestor) {
        showProfitChart(selectedInvestor.id);
        highlightMenuItem('menu-profit-chart');
      }
    });
    
    // عرض تفاصيل حساب الأرباح
    document.getElementById('menu-profit-details')?.addEventListener('click', () => {
      if (selectedInvestor) {
        showProfitDetailsModal(selectedInvestor.id);
        highlightMenuItem('menu-profit-details');
      }
    });
    
    // تصدير البيانات
    document.getElementById('menu-export-data')?.addEventListener('click', () => {
      if (selectedInvestor) {
        exportInvestorData(selectedInvestor.id);
        highlightMenuItem('menu-export-data');
      }
    });
    
    // إعداد تذكيرات
    document.getElementById('menu-reminder')?.addEventListener('click', () => {
      if (selectedInvestor) {
        showScheduleReminderModal(selectedInvestor.id);
        highlightMenuItem('menu-reminder');
      }
    });
    
    // إعدادات الإشعارات
    document.getElementById('menu-notifications')?.addEventListener('click', () => {
      if (selectedInvestor) {
        showNotificationsSettingsModal(selectedInvestor.id);
        highlightMenuItem('menu-notifications');
      }
    });
    
    // حذف المستثمر
    document.getElementById('menu-delete-investor')?.addEventListener('click', () => {
      if (selectedInvestor) {
        deleteInvestor(selectedInvestor.id);
      }
    });
  }
  
  // إعداد مستمعات الأحداث للإجراءات السريعة
  function setupQuickActions() {
    // دفع الأرباح
    document.getElementById('quick-pay-profit')?.addEventListener('click', () => {
      if (selectedInvestor) {
        payDueProfits(selectedInvestor.id);
      }
    });
    
    // إضافة استثمار
    document.getElementById('quick-add-investment')?.addEventListener('click', () => {
      if (selectedInvestor) {
        showAddTransactionModal('investment', selectedInvestor);
      }
    });
    
    // طباعة كشف حساب
    document.getElementById('quick-print')?.addEventListener('click', () => {
      if (selectedInvestor) {
        printInvestorStatement(selectedInvestor.id);
      }
    });
    
    // إرسال تقرير عبر الواتساب
    document.getElementById('quick-whatsapp')?.addEventListener('click', () => {
      if (selectedInvestor) {
        sendWhatsappReport(selectedInvestor.id);
      }
    });
  }
  
  // إضاءة عنصر القائمة المحدد
  function highlightMenuItem(menuId) {
    // إزالة الفئة النشطة من جميع عناصر القائمة
    const menuItems = document.querySelectorAll('.sidebar-menu-item');
    menuItems.forEach(item => {
      item.classList.remove('active');
    });
    
    // إضافة الفئة النشطة للعنصر المحدد
    const menuItem = document.getElementById(menuId);
    if (menuItem) {
      menuItem.classList.add('active');
      
      // تمرير إلى العنصر النشط ليكون مرئيًا
      menuItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  
  // تحديث بيانات الشريط الجانبي للمستثمر المحدد
  function updateSidebar(investorId) {
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) return;
    
    // تحديث الحرف الأول من اسم المستثمر
    const investorInitial = document.getElementById('investor-initial');
    if (investorInitial) {
      investorInitial.textContent = investor.name.charAt(0);
    }
    
    // الحصول على معاملات المستثمر
    const investorTransactions = transactions.filter(
      trans => trans.investorId === investorId
    );
    
    // حساب الإحصائيات
    const payoutTransactions = investorTransactions.filter(t => t.type === 'payout');
    const totalPayouts = payoutTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyProfit = calculateMonthlyProfit(investor.amount);
    const totalEarnedProfit = calculateTotalEarnedProfit(investorId);
    const remainingProfit = totalEarnedProfit - totalPayouts;
    
    // تحديث البيانات المالية في الشريط الجانبي
    updateSidebarText('sidebar-total-amount', numberWithCommas(investor.amount) + ' د.ع');
    updateSidebarText('sidebar-monthly-profit', numberWithCommas(monthlyProfit) + ' د.ع');
    updateSidebarText('sidebar-due-profit', numberWithCommas(remainingProfit) + ' د.ع');
    
    // حساب وتحديث صحة الاستثمار
    const healthData = calculateInvestmentHealth(investorId);
    updateSidebarText('sidebar-health-percent', healthData.score + '%');
    
    // تغيير فئة العنصر حسب النتيجة
    const healthElement = document.getElementById('sidebar-health-percent');
    if (healthElement) {
      // إزالة جميع فئات النص
      healthElement.classList.remove('text-success', 'text-warning', 'text-danger');
      
      // إضافة الفئة المناسبة
      if (healthData.score >= 75) {
        healthElement.classList.add('text-success');
      } else if (healthData.score >= 50) {
        healthElement.classList.add('text-warning');
      } else {
        healthElement.classList.add('text-danger');
      }
    }
    
    // تحديث شريط الصحة
    const healthValueElement = document.querySelector('.health-value');
    if (healthValueElement) {
      healthValueElement.style.width = healthData.score + '%';
      
      // تغيير لون الشريط حسب النتيجة
      if (healthData.score >= 75) {
        healthValueElement.style.backgroundColor = 'var(--secondary-color, #10b981)';
      } else if (healthData.score >= 50) {
        healthValueElement.style.backgroundColor = 'var(--accent-color, #f59e0b)';
      } else {
        healthValueElement.style.backgroundColor = 'var(--danger-color, #ef4444)';
      }
    }
    
    // تحديث نقاط القوة والمشاكل
    updateHealthStatusItems(healthData);
    
    // تحديث نص دورة الدفع
    const paymentCycleBadge = document.querySelector('#menu-payment-schedule .sidebar-badge');
    if (paymentCycleBadge) {
      paymentCycleBadge.textContent = getPaymentCycleText(investor.paymentCycle || 'monthly');
    }
  }
  
  // وظيفة مساعدة لتحديث النص لعنصر معين
  function updateSidebarText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
    }
  }
  
  // تحديث نقاط القوة والمشاكل في عرض صحة الاستثمار
  function updateHealthStatusItems(healthData) {
    const strengthsContainer = document.querySelector('.sidebar-section:nth-child(2) .mt-2');
    if (!strengthsContainer) return;
    
    // حذف العناصر الموجودة ما عدا شريط الصحة والعنوان
    while (strengthsContainer.children.length > 2) {
      strengthsContainer.removeChild(strengthsContainer.lastChild);
    }
    
    // إضافة نقاط القوة مع تأثير حركي للظهور
    healthData.strengths.forEach((strength, index) => {
      setTimeout(() => {
        const strengthElement = document.createElement('div');
        strengthElement.className = 'd-flex align-items-center text-success mb-1';
        strengthElement.style.fontSize = '0.8rem';
        strengthElement.style.opacity = '0';
        strengthElement.style.transform = 'translateY(10px)';
        strengthElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        strengthElement.innerHTML = `
          <i class="fas fa-check-circle mr-1"></i>
          <span>${strength}</span>
        `;
        strengthsContainer.appendChild(strengthElement);
        
        // تأثير الظهور التدريجي
        setTimeout(() => {
          strengthElement.style.opacity = '1';
          strengthElement.style.transform = 'translateY(0)';
        }, 50);
      }, index * 100);
    });
    
    // إضافة المشاكل مع تأثير حركي للظهور
    healthData.issues.forEach((issue, index) => {
      setTimeout(() => {
        const issueElement = document.createElement('div');
        issueElement.className = 'd-flex align-items-center text-warning mb-1';
        issueElement.style.fontSize = '0.8rem';
        issueElement.style.opacity = '0';
        issueElement.style.transform = 'translateY(10px)';
        issueElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        issueElement.innerHTML = `
          <i class="fas fa-exclamation-circle mr-1"></i>
          <span>${issue}</span>
        `;
        strengthsContainer.appendChild(issueElement);
        
        // تأثير الظهور التدريجي
        setTimeout(() => {
          issueElement.style.opacity = '1';
          issueElement.style.transform = 'translateY(0)';
        }, 50);
      }, (healthData.strengths.length + index) * 100);
    });
  }

  // إضافة الشريط الجانبي عند عرض صفحة تفاصيل المستثمر
function createSidebarTemplate() {
    const sidebarHTML = `
       <div id="settings-sidebar" class="sidebar-container">
      <!-- زر تبديل عرض/إخفاء الشريط -->
      <button id="sidebar-toggle" class="sidebar-toggle">
        <i class="fas fa-chevron-left"></i>
      </button>
        
     <!-- رأس الشريط الجانبي -->
      <div class="sidebar-header">
        <div class="d-flex justify-content-between align-items-center">
          <div>إعدادات المستثمر</div>
          <div id="investor-initial" class="badge badge-light">م</div>
        </div>
      </div>
        
        <!-- محتوى الشريط الجانبي -->
        <div class="sidebar-content">
          <!-- ملخص الاستثمار -->
          <div class="sidebar-section">
            <div class="sidebar-section-title">
              <i class="fas fa-chart-pie"></i>
              ملخص الاستثمار
            </div>
            <div class="mt-2">
              <div class="d-flex justify-content-between mb-1">
                <span>المبلغ الإجمالي:</span>
                <span id="sidebar-total-amount" class="font-weight-bold">0 د.ع</span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span>الربح الشهري:</span>
                <span id="sidebar-monthly-profit" class="font-weight-bold text-success">0 د.ع</span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span>الأرباح المستحقة:</span>
                <span id="sidebar-due-profit" class="font-weight-bold text-primary">0 د.ع</span>
              </div>
            </div>
          </div>
          
          <!-- مؤشر صحة الاستثمار -->
          <div class="sidebar-section">
            <div class="sidebar-section-title">
              <i class="fas fa-heartbeat"></i>
              حالة الاستثمار
            </div>
            <div class="mt-2">
              <div class="d-flex justify-content-between mb-1">
                <span>الصحة:</span>
                <span id="sidebar-health-percent" class="font-weight-bold text-success">0%</span>
              </div>
              <div class="health-meter">
                <div class="health-value" style="width: 0%;"></div>
              </div>
            </div>
          </div>
          
          <!-- الإجراءات السريعة -->
          <div class="sidebar-section">
            <div class="sidebar-section-title">
              <i class="fas fa-bolt"></i>
              إجراءات سريعة
            </div>
            <div class="sidebar-quick-actions">
              <div class="quick-action-btn" id="quick-pay-profit">
                <i class="fas fa-money-bill-wave"></i>
                <span>دفع الأرباح</span>
              </div>
              <div class="quick-action-btn" id="quick-add-investment">
                <i class="fas fa-plus"></i>
                <span>إضافة استثمار</span>
              </div>
              <div class="quick-action-btn" id="quick-print">
                <i class="fas fa-print"></i>
                <span>طباعة كشف</span>
              </div>
              <div class="quick-action-btn" id="quick-whatsapp">
                <i class="fab fa-whatsapp"></i>
                <span>إرسال تقرير</span>
              </div>
            </div>
          </div>
          
          <!-- قائمة الإعدادات -->
          <div class="sidebar-section">
            <div class="sidebar-section-title">
              <i class="fas fa-cog"></i>
              الإعدادات
            </div>
            <div>
              <div class="sidebar-menu-item" id="menu-investor-data">
                <i class="fas fa-user-edit"></i>
                <span>تعديل بيانات المستثمر</span>
              </div>
              <div class="sidebar-menu-item" id="menu-profit-rate">
                <i class="fas fa-percentage"></i>
                <span>نسبة الربح المخصصة</span>
              </div>
              <div class="sidebar-menu-item" id="menu-payment-schedule">
                <i class="fas fa-calendar-alt"></i>
                <span>جدولة الدفعات</span>
                <span class="sidebar-badge">شهري</span>
              </div>
              <div class="sidebar-menu-item" id="menu-investment-calculator">
                <i class="fas fa-calculator"></i>
                <span>حاسبة الاستثمار</span>
              </div>
            </div>
          </div>
          
          <!-- التحليلات -->
          <div class="sidebar-section">
            <div class="sidebar-section-title">
              <i class="fas fa-chart-line"></i>
              التحليلات
            </div>
            <div>
              <div class="sidebar-menu-item" id="menu-profit-chart">
                <i class="fas fa-chart-bar"></i>
                <span>مخطط الأرباح</span>
              </div>
              <div class="sidebar-menu-item" id="menu-profit-details">
                <i class="fas fa-file-invoice-dollar"></i>
                <span>تفاصيل حساب الأرباح</span>
              </div>
              <div class="sidebar-menu-item" id="menu-export-data">
                <i class="fas fa-file-export"></i>
                <span>تصدير البيانات</span>
              </div>
            </div>
          </div>
          
          <!-- خيارات متقدمة -->
          <div class="sidebar-section">
            <div class="sidebar-section-title">
              <i class="fas fa-sliders-h"></i>
              خيارات متقدمة
            </div>
            <div>
              <div class="sidebar-menu-item" id="menu-reminder">
                <i class="fas fa-bell"></i>
                <span>إعداد تذكيرات</span>
              </div>
              <div class="sidebar-menu-item" id="menu-notifications">
                <i class="fas fa-envelope"></i>
                <span>إعدادات الإشعارات</span>
              </div>
              <div class="sidebar-menu-item text-danger" id="menu-delete-investor">
                <i class="fas fa-trash"></i>
                <span>حذف المستثمر</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    <!-- الستارة الخلفية للجوال -->
    <div id="mobile-backdrop" class="mobile-backdrop"></div>
  `;
    
    return sidebarHTML;
  }
  
  // دالة لتحديث الشريط الجانبي ليكون متوافقًا مع باقي الواجهة
  function integrateSidebarWithUi() {
    // إضافة نمط الشريط الجانبي المحسن
    const styleElement = document.createElement('style');
    styleElement.id = 'enhanced-sidebar-styles';
    
    // التحقق من عدم وجود العنصر مسبقًا
    if (!document.getElementById('enhanced-sidebar-styles')) {
      document.head.appendChild(styleElement);
      
      // هنا يتم إضافة أنماط CSS من ملف enhanced-sidebar-style
      // يمكن تضمينها مباشرة أو استدعاؤها من ملف خارجي
      fetch('enhanced-sidebar-style.css')
        .then(response => response.text())
        .then(css => {
          styleElement.textContent = css;
        })
        .catch(() => {
          // في حالة فشل التحميل، استخدم الأنماط الافتراضية
          styleElement.textContent = getDefaultSidebarStyles();
        });
    }
    
    // تعديل دالة renderInvestorDetailsPage للتكامل مع الشريط الجانبي
    const originalRenderInvestorDetailsPage = window.renderInvestorDetailsPage;
    window.renderInvestorDetailsPage = function() {
      originalRenderInvestorDetailsPage();
      
      // بعد رسم الصفحة، تأكد من وجود الشريط الجانبي
      if (!document.getElementById('settings-sidebar')) {
        // إضافة الشريط الجانبي إلى الصفحة
        document.body.insertAdjacentHTML('beforeend', createSidebarTemplate());
        
        // تهيئة الشريط الجانبي وإضافة المستمعات
        initSidebar();
      }
      
      // تعديل المحتوى الرئيسي ليتناسب مع الشريط الجانبي
      const mainContent = document.getElementById('main-content');
      if (mainContent && !mainContent.classList.contains('with-sidebar')) {
        mainContent.classList.add('with-sidebar');
      }
    };
  }
  
 
// استرجاع أنماط CSS للشريط الجانبي من اليسار
function getLeftSidebarStyles() {
    return `
      /* تحسينات الشريط الجانبي من اليسار */
      .sidebar-container {
        position: fixed;
        top: 60px; /* لإبقاء الشريط أسفل شريط العنوان */
        left: 0; /* تغيير من right إلى left للظهور في اليسار */
        width: 280px;
        height: calc(100vh - 60px); /* تعديل الارتفاع ليناسب شريط العنوان */
        background-color: var(--white, #ffffff);
        border-left: 1px solid var(--gray-200, #e5e7eb); /* تغيير من border-right إلى border-left */
        z-index: 39; /* تأكد من أن الرقم أقل من شريط العنوان (40) */
        overflow-y: auto;
        transition: transform 0.3s ease;
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1); /* تغيير اتجاه الظل */
        direction: rtl;
      }
      
      .sidebar-container.collapsed {
        transform: translateX(-250px); /* تغيير من +250px إلى -250px */
      }
      
      .sidebar-toggle {
        position: absolute;
        top: 50%;
        left: 280px; /* تغيير من right إلى left */
        transform: translateY(-50%);
        width: 30px;
        height: 50px;
        background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
        color: white;
        border: none;
        border-radius: 0 5px 5px 0; /* عكس اتجاه الحواف المستديرة */
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 39;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); /* تغيير اتجاه الظل */
      }
      
      .sidebar-toggle i {
        transform: rotate(180deg); /* عكس اتجاه السهم */
        transition: transform 0.3s ease;
      }
      
      .sidebar-container.collapsed .sidebar-toggle i {
        transform: rotate(0deg); /* عكس اتجاه السهم عند الطي */
      }
      
      /* تكييف المحتوى الرئيسي مع وجود الشريط الجانبي */
      .main-content {
        transition: margin-left 0.3s ease; /* تغيير من margin-right إلى margin-left */
      }
      
      .main-content.with-sidebar {
        margin-left: 280px; /* تغيير من margin-right إلى margin-left */
        margin-right: 0; /* إعادة تعيين margin-right */
      }
      
      .main-content.with-collapsed-sidebar {
        margin-left: 30px; /* تغيير من margin-right إلى margin-left */
        margin-right: 0; /* إعادة تعيين margin-right */
      }
      
      /* أنماط للوضع المتنقل */
      @media (max-width: 768px) {
        .sidebar-container {
          transform: translateX(-100%); /* تغيير من +100% إلى -100% */
          width: 100%;
          max-width: 320px;
          top: 0;
          height: 100vh;
        }
        
        .sidebar-container.active {
          transform: translateX(0);
        }
        
        .sidebar-toggle {
          left: 0; /* تغيير من right إلى left */
          border-radius: 0 5px 5px 0; /* عكس اتجاه الحواف المستديرة */
        }
        
        .main-content.with-sidebar, 
        .main-content.with-collapsed-sidebar {
          margin-left: 0; /* تغيير من margin-right إلى margin-left */
        }
      }
    `;
  }
  
  // تنفيذ التكامل عند تحميل الصفحة
  document.addEventListener('DOMContentLoaded', function() {
    integrateLeftSidebarWithUi();
  });
  
  // تكامل الشريط الجانبي الأيسر مع واجهة المستخدم
function integrateLeftSidebarWithUi() {
  // إضافة أنماط CSS للشريط الجانبي الأيسر
  const styleElement = document.createElement('style');
  styleElement.id = 'left-sidebar-styles';
  styleElement.textContent = getLeftSidebarStyles();
  document.head.appendChild(styleElement);
  
  // إضافة مستمع لتهيئة الشريط الجانبي عند عرض صفحة تفاصيل المستثمر
  const originalRenderInvestorDetailsPage = window.renderInvestorDetailsPage;
  window.renderInvestorDetailsPage = function() {
    originalRenderInvestorDetailsPage();
    
    // بعد رسم الصفحة، تهيئة الشريط الجانبي
    setTimeout(() => {
      // التأكد من وجود الشريط الجانبي
      if (!document.getElementById('settings-sidebar')) {
        // إضافة الشريط الجانبي إذا لم يكن موجوداً
        document.body.insertAdjacentHTML('beforeend', createSidebarTemplate());
      }
      
      // تهيئة الشريط الجانبي
      initSidebar();
    }, 100);
  };
  
  // تنفيذ الكود عند تحميل الصفحة
  document.addEventListener('DOMContentLoaded', function() {
    // إضافة مستمع للتنقل بين الصفحات
    const originalNavigateTo = window.navigateTo;
    window.navigateTo = function(page) {
      originalNavigateTo(page);
      
      // إزالة الشريط الجانبي عند الانتقال من صفحة تفاصيل المستثمر
      if (page !== 'investorDetails' && document.getElementById('settings-sidebar')) {
        document.getElementById('settings-sidebar').remove();
        document.getElementById('mobile-backdrop')?.remove();
      }
    };
  });
}

// دالة للحصول على أنماط CSS للشريط الجانبي الأيسر
function getLeftSidebarStyles() {
  return `
    /* تحسينات الشريط الجانبي من اليسار */
    .sidebar-container {
      position: fixed;
      top: 60px; /* لإبقاء الشريط أسفل شريط العنوان */
      left: 0; /* تغيير من right إلى left للظهور في اليسار */
      width: 280px;
      height: calc(100vh - 60px); /* تعديل الارتفاع ليناسب شريط العنوان */
      background-color: var(--white, #ffffff);
      border-left: 1px solid var(--gray-200, #e5e7eb); /* تغيير من border-right إلى border-left */
      z-index: 39; /* تأكد من أن الرقم أقل من شريط العنوان (40) */
      overflow-y: auto;
      transition: transform 0.3s ease;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1); /* تغيير اتجاه الظل */
      direction: rtl;
    }
    
    .sidebar-container.collapsed {
      transform: translateX(-250px); /* تغيير من +250px إلى -250px */
    }
    
    .sidebar-toggle {
      position: absolute;
      top: 50%;
      left: 280px; /* تغيير من right إلى left */
      transform: translateY(-50%);
      width: 30px;
      height: 50px;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      color: white;
      border: none;
      border-radius: 0 5px 5px 0; /* عكس اتجاه الحواف المستديرة */
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 39;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); /* تغيير اتجاه الظل */
    }
    
    .sidebar-toggle i {
      transform: rotate(180deg); /* عكس اتجاه السهم */
      transition: transform 0.3s ease;
    }
    
    .sidebar-container.collapsed .sidebar-toggle i {
      transform: rotate(0deg); /* عكس اتجاه السهم عند الطي */
    }
    
    /* تكييف المحتوى الرئيسي مع وجود الشريط الجانبي */
    .main-content {
      transition: margin-left 0.3s ease; /* تغيير من margin-right إلى margin-left */
    }
    
    .main-content.with-sidebar {
      margin-left: 280px; /* تغيير من margin-right إلى margin-left */
      margin-right: 0; /* إعادة تعيين margin-right */
    }
    
    .main-content.with-collapsed-sidebar {
      margin-left: 30px; /* تغيير من margin-right إلى margin-left */
      margin-right: 0; /* إعادة تعيين margin-right */
    }
    
    /* أنماط للوضع المتنقل */
    @media (max-width: 768px) {
      .sidebar-container {
        transform: translateX(-100%); /* تغيير من +100% إلى -100% */
        width: 100%;
        max-width: 320px;
        top: 0;
        height: 100vh;
      }
      
      .sidebar-container.active {
        transform: translateX(0);
      }
      
      .sidebar-toggle {
        left: 0; /* تغيير من right إلى left */
        border-radius: 0 5px 5px 0; /* عكس اتجاه الحواف المستديرة */
      }
      
      .main-content.with-sidebar, 
      .main-content.with-collapsed-sidebar {
        margin-left: 0; /* تغيير من margin-right إلى margin-left */
      }
    }
  `;
}

// تنفيذ التكامل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  integrateLeftSidebarWithUi();
});