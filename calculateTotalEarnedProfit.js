// تعديل دالة renderInvestorDetailsPage لإضافة لوحة الإعدادات بالجانب الأيمن
function renderInvestorDetailsPage() {
  if (!selectedInvestor) {
    navigateTo('investors');
    return;
  }
  mainContent.classList.add('main-content');
  
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

  // حساب إجمالي الأرباح المستحقة منذ بداية الاستثمار
  const totalEarnedProfit = calculateTotalEarnedProfit(selectedInvestor.id);
  
  // حساب الربح المتبقي (غير المدفوع)
  const remainingProfit = totalEarnedProfit - totalPayouts;

  // حساب الأرباح المتوقعة للسنة
  const annualExpectedProfit = (selectedInvestor.amount / 1000000) * profitRate * 1000 * 12;
  
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
    <div class="container animate-fadeIn">
      <div class="flex items-center mb-4">
        <button 
          class="btn btn-icon btn-gray ml-2"
          id="back-to-investors"
        >
        
        
         <div class="container animate-fadeIn main-content">
          <i class="fas fa-arrow-right"></i>
        </button>
        <h1 class="text-xl font-bold">تفاصيل المستثمر</h1>
      </div>
      
      <!-- تقسيم الصفحة إلى عمودين رئيسيين -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- العمود الأيسر - البيانات الرئيسية (يشغل ثلثي الشاشة) -->
        <div class="md:col-span-2">
          <!-- بطاقة بيانات المستثمر -->
          <div class="card mb-4">
            <div class="flex justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="badge badge-primary" style="width: 40px; height: 40px; font-size: 1.25rem;">
                  ${selectedInvestor.name.charAt(0)}
                </div>
                
                ${document.getElementById('settings-sidebar') ? '' : createSidebarTemplate
                <h2 class="text-lg font-bold">${selectedInvestor.name}</h2>
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
              <div class="mt-2">
                <button id="show-profit-details" class="text-sm text-blue-600 flex items-center gap-1">
                  <i class="fas fa-chart-line"></i> عرض تفاصيل حساب الأرباح
                </button>
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
        <!-- نهاية العمود الأيسر -->
        
        <!-- العمود الأيمن - لوحة الإعدادات والتحليلات (يشغل ثلث الشاشة) -->
        <div class="md:col-span-1">
          <!-- ملخص الاستثمار -->
          <div class="card mb-4">
            <div class="p-3 bg-primary text-white rounded-t-lg">
              <h3 class="font-bold text-center">ملخص الاستثمار</h3>
            </div>
            <div class="p-4">
              <div class="flex flex-col gap-3">
                <!-- ملخص الأرباح المستحقة وغير المدفوعة -->
                <div class="card-yellow-light p-3 rounded-lg">
                  <h4 class="text-sm font-bold mb-2">الأرباح المستحقة</h4>
                  <div class="flex justify-between items-center">
                    <p class="text-sm">الإجمالي المستحق:</p>
                    <p class="font-bold text-green-600">${numberWithCommas(totalEarnedProfit)} د.ع</p>
                  </div>
                  <div class="flex justify-between items-center">
                    <p class="text-sm">المدفوع:</p>
                    <p class="font-bold text-blue-600">${numberWithCommas(totalPayouts)} د.ع</p>
                  </div>
                  <div class="flex justify-between items-center pt-1 border-t mt-1">
                    <p class="text-sm font-bold">المتبقي:</p>
                    <p class="font-bold text-red-600">${numberWithCommas(remainingProfit)} د.ع</p>
                  </div>
                </div>
                
                <!-- مؤشر نسبة العائد السنوي -->
                <div class="card-blue-light p-3 rounded-lg">
                  <h4 class="text-sm font-bold mb-2">الأرباح المتوقعة</h4>
                  <div class="flex flex-col gap-1">
                    <div class="flex justify-between items-center">
                      <p class="text-sm">شهرياً:</p>
                      <p class="font-bold text-blue-600">${numberWithCommas(calculateMonthlyProfit(selectedInvestor.amount))} د.ع</p>
                    </div>
                    <div class="flex justify-between items-center">
                      <p class="text-sm">سنوياً:</p>
                      <p class="font-bold text-green-600">${numberWithCommas(annualExpectedProfit)} د.ع</p>
                    </div>
                    <div class="flex justify-between items-center">
                      <p class="text-sm">العائد السنوي:</p>
                      <p class="font-bold text-yellow-600">${profitRate * 12}%</p>
                    </div>
                  </div>
                </div>
                
                <!-- تخطيط الأرباح (قسم صغير للرسم البياني) -->
                <div class="card bg-white p-3 rounded-lg border">
                  <h4 class="text-sm font-bold mb-2">تحليل الأرباح</h4>
                  <div class="profit-chart-placeholder h-32 bg-gray-50 rounded flex items-center justify-center mb-2"
                       id="profit-chart-container">
                    <button id="show-profit-chart" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-chart-line ml-1"></i>
                      عرض الرسم البياني
                    </button>
                  </div>
                  <div class="flex text-xs text-gray-500 justify-between">
                    <span>${formatDate(new Date(new Date().setMonth(new Date().getMonth() - 5)))}</span>
                    <span>الشهر الحالي</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- الإعدادات والإجراءات السريعة -->
          <div class="card mb-4">
            <div class="p-3 bg-secondary text-white rounded-t-lg">
              <h3 class="font-bold text-center">الإجراءات السريعة</h3>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-1 gap-3">
                <!-- إجراءات دفع الأرباح المستحقة -->
                <button id="pay-due-profits" class="btn btn-outline-success">
                  <i class="fas fa-money-bill-wave ml-1"></i>
                  دفع جميع الأرباح المستحقة
                </button>
                
                <!-- طباعة كشف حساب -->
                <button id="print-statement" class="btn btn-outline-primary">
                  <i class="fas fa-print ml-1"></i>
                  طباعة كشف حساب
                </button>
                
                <!-- إرسال تقرير عبر الواتساب -->
                <button id="send-whatsapp-report" class="btn btn-outline-secondary">
                  <i class="fab fa-whatsapp ml-1"></i>
                  إرسال تقرير عبر الواتساب
                </button>
                
                <!-- جدولة تذكير -->
                <button id="schedule-reminder" class="btn btn-outline-info">
                  <i class="fas fa-bell ml-1"></i>
                  جدولة تذكير بالدفع
                </button>
              </div>
            </div>
          </div>
          
          <!-- الإعدادات المتقدمة -->
          <div class="card mb-4">
            <div class="p-3 bg-gray-700 text-white rounded-t-lg">
              <h3 class="font-bold text-center">الإعدادات المتقدمة</h3>
            </div>
            <div class="p-4">
              <div class="flex flex-col gap-3">
                <!-- تغيير نسبة الربح لهذا المستثمر -->
                <div class="custom-profit-rate">
                  <label class="text-sm font-bold mb-1 block">نسبة الربح الخاصة:</label>
                  <div class="flex gap-2">
                    <input 
                      type="number" 
                      id="custom-profit-rate" 
                      value="${selectedInvestor.customProfitRate || profitRate}" 
                      class="form-control flex-1" 
                      step="0.1" 
                      min="0" 
                      max="100"
                    >
                    <button id="save-custom-profit-rate" class="btn btn-sm btn-primary">
                      <i class="fas fa-save"></i>
                    </button>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    النسبة العامة: ${profitRate}%
                  </div>
                </div>
                
                <!-- ضبط تنبيهات الدفع -->
                <div class="payment-alerts">
                  <label class="text-sm font-bold mb-1 block">تنبيهات الدفع:</label>
                  <div class="flex gap-2 mb-2">
                    <select id="payment-alert-cycle" class="form-control flex-1">
                      <option value="monthly" ${selectedInvestor.paymentCycle === 'monthly' ? 'selected' : ''}>شهري</option>
                      <option value="quarterly" ${selectedInvestor.paymentCycle === 'quarterly' ? 'selected' : ''}>ربع سنوي</option>
                      <option value="biannual" ${selectedInvestor.paymentCycle === 'biannual' ? 'selected' : ''}>نصف سنوي</option>
                      <option value="annual" ${selectedInvestor.paymentCycle === 'annual' ? 'selected' : ''}>سنوي</option>
                    </select>
                    <button id="save-payment-cycle" class="btn btn-sm btn-primary">
                      <i class="fas fa-save"></i>
                    </button>
                  </div>
                </div>
                
                <!-- إعدادات متقدمة أخرى -->
                <div class="flex flex-col gap-2 mt-2">
                  <button id="export-investor-data" class="btn btn-sm btn-outline-secondary">
                    <i class="fas fa-file-export ml-1"></i>
                    تصدير بيانات المستثمر
                  </button>
                  
                  <button id="investment-calculator" class="btn btn-sm btn-outline-secondary">
                    <i class="fas fa-calculator ml-1"></i>
                    حاسبة الاستثمار
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- مؤشر صحة الاستثمار -->
          <div class="card mb-4">
            <div class="p-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
              <h3 class="font-bold text-center">مؤشر صحة الاستثمار</h3>
            </div>
            <div class="p-4">
              <div class="flex flex-col items-center">
                <!-- قياس صحة الاستثمار بناءً على انتظام الدفعات وغيرها -->
                <div class="investment-health-meter w-full h-6 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div class="investment-health-value h-full bg-green-500" style="width: 85%"></div>
                </div>
                <div class="text-center">
                  <span class="font-bold text-green-600">85%</span>
                  <p class="text-xs text-gray-500">استثمار صحي</p>
                </div>
                
                <!-- ملاحظات حول صحة الاستثمار -->
                <div class="mt-3 w-full">
                  <ul class="text-xs">
                    <li class="flex items-center gap-1 text-green-600 mb-1">
                      <i class="fas fa-check-circle"></i>
                      نمو مستمر للاستثمار
                    </li>
                    <li class="flex items-center gap-1 text-yellow-600 mb-1">
                      <i class="fas fa-exclamation-circle"></i>
                      تأخر دفعة واحدة سابقاً
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- نهاية العمود الأيمن -->
      </div>
    </div>
  `;
  
  mainContent.innerHTML = html;
  
  // إضافة المستمعين للأحداث
  document.getElementById('back-to-investors').addEventListener('click', () => {
    selectedInvestor = null;
    navigateTo('investors');
  });
  
  document.getElementById('edit-investor').addEventListener('click', () => {
    editInvestor(selectedInvestor);
  });
  
  document.getElementById('delete-investor').addEventListener('click', () => {
    deleteInvestor(selectedInvestor.id);
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
  
  // إضافة مستمع لزر عرض تفاصيل الأرباح
  document.getElementById('show-profit-details').addEventListener('click', () => {
    showProfitDetailsModal(selectedInvestor.id);
  });
  
  // إضافة مستمعات الأحداث للأزرار الجديدة في لوحة الإعدادات
  document.getElementById('pay-due-profits').addEventListener('click', () => {
    payDueProfits(selectedInvestor.id);
  });
  
  document.getElementById('print-statement').addEventListener('click', () => {
    printInvestorStatement(selectedInvestor.id);
  });
  
  document.getElementById('send-whatsapp-report').addEventListener('click', () => {
    sendWhatsappReport(selectedInvestor.id);
  });
  
  document.getElementById('schedule-reminder').addEventListener('click', () => {
    showScheduleReminderModal(selectedInvestor.id);
  });
  
  document.getElementById('save-custom-profit-rate').addEventListener('click', () => {
    saveCustomProfitRate(selectedInvestor.id);
  });
  
  document.getElementById('save-payment-cycle').addEventListener('click', () => {
    savePaymentCycle(selectedInvestor.id);
  });
  
  document.getElementById('export-investor-data').addEventListener('click', () => {
    exportInvestorData(selectedInvestor.id);
  });
  
  document.getElementById('investment-calculator').addEventListener('click', () => {
    showInvestmentCalculator(selectedInvestor.id);
  });
  
  document.getElementById('show-profit-chart').addEventListener('click', () => {
    showProfitChart(selectedInvestor.id);
  });
}

// دالة لحساب إجمالي الأرباح المستحقة للمستثمر منذ بداية الاستثمار
function calculateTotalEarnedProfit(investorId) {
  const investor = investors.find(inv => inv.id === investorId);
  if (!investor) return 0;
  
  // الحصول على كل معاملات الاستثمار للمستثمر
  const investmentTransactions = transactions.filter(
    trans => trans.investorId === investorId && trans.type === 'investment'
  );
  
  let totalProfit = 0;
  
  for (const investment of investmentTransactions) {
    const investmentDate = new Date(investment.date);
    const currentDate = new Date();
    
    // حساب عدد الأيام منذ الاستثمار
    const daysSinceInvestment = Math.floor((currentDate - investmentDate) / (1000 * 60 * 60 * 24));
    
    // حساب الربح النسبي لهذا الاستثمار فقط
    const dailyRate = (investor.customProfitRate || profitRate) / 30 / 100;
    const accumulatedProfit = (investment.amount / 1000000) * dailyRate * 1000 * daysSinceInvestment;
    
    totalProfit += accumulatedProfit;
  }
  
  return Math.round(totalProfit);
}

// دالة لدفع جميع الأرباح المستحقة
function payDueProfits(investorId) {
  const investor = investors.find(inv => inv.id === investorId);
  if (!investor) return;
  
  // حساب الأرباح المستحقة
  const totalEarnedProfit = calculateTotalEarnedProfit(investorId);
  
  // حساب الأرباح المدفوعة بالفعل
  const payoutTransactions = transactions.filter(
    trans => trans.investorId === investorId && trans.type === 'payout'
  );
  const totalPayouts = payoutTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // حساب الربح المتبقي (غير المدفوع)
  const remainingProfit = totalEarnedProfit - totalPayouts;
  
  if (remainingProfit <= 0) {
    showNotification('لا توجد أرباح مستحقة للدفع', 'warning');
    return;
  }
  
  // إنشاء نافذة تأكيد الدفع
  showConfirmModal({
    title: 'تأكيد دفع الأرباح المستحقة',
    message: `هل تريد تسجيل دفعة بقيمة ${numberWithCommas(remainingProfit)} د.ع للمستثمر ${investor.name}؟`,
    confirmText: 'نعم، سجل الدفع',
    cancelText: 'إلغاء',
    confirmCallback: () => {
      // إنشاء معاملة دفع جديدة
      const newTransaction = {
        id: generateId(),
        investorId: investorId,
        type: 'payout',
        amount: remainingProfit,
        date: new Date().toISOString().split('T')[0],
        notes: 'دفع تلقائي للأرباح المستحقة'
      };
      
      // إضافة المعاملة إلى قائمة المعاملات
      transactions.push(newTransaction);
      
      // حفظ البيانات
      saveData();
      
      // إظهار إشعار بنجاح العملية
      showNotification('تم تسجيل دفع الأرباح المستحقة بنجاح', 'success');
      
      // تحديث الواجهة
      renderInvestorDetailsPage();
    }
  });
}

// دالة لطباعة كشف حساب المستثمر
function printInvestorStatement(investorId) {
  const investor = investors.find(inv => inv.id === investorId);
  if (!investor) return;
  
  // الحصول على معاملات المستثمر مرتبة حسب التاريخ
  const investorTransactions = transactions.filter(
    trans => trans.investorId === investorId
  ).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // إنشاء نافذة طباعة جديدة
  const printWindow = window.open('', '_blank');
  
  // تحضير محتوى الطباعة
  let printContent = `
    <html dir="rtl">
    <head>
      <title>كشف حساب المستثمر: ${investor.name}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          direction: rtl;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #333;
        }
        .investor-info {
          margin-bottom: 20px;
        }
        .info-item {
          margin-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: right;
        }
        th {
          background-color: #f2f2f2;
        }
        .transaction-row-investment {
          background-color: #e6f7ff;
        }
        .transaction-row-payout {
          background-color: #f6ffed;
        }
        .transaction-row-withdrawal {
          background-color: #fff1f0;
        }
        .amount-cell {
          text-align: left;
          direction: ltr;
        }
        .summary {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }
        }
          
      </style>
    </head>
    <body>
      <div class="header">
        <h1>كشف حساب المستثمر</h1>
        <p>تاريخ الإصدار: ${formatDate(new Date().toISOString().split('T')[0])}</p>
      </div>
      
      <div class="investor-info">
        <h2>${investor.name}</h2>
        <p class="info-item"><strong>رقم الهاتف:</strong> ${investor.phone || "غير متوفر"}</p>
        <p class="info-item"><strong>العنوان:</strong> ${investor.address || "غير متوفر"}</p>
        <p class="info-item"><strong>رقم الهوية:</strong> ${investor.idCard || "غير متوفر"}</p>
        <p class="info-item"><strong>تاريخ البدء:</strong> ${formatDate(investor.startDate)}</p>
        <p class="info-item"><strong>المبلغ الإجمالي المستثمر:</strong> ${numberWithCommas(investor.amount)} د.ع</p>
      </div>
      
      <h3>سجل المعاملات</h3>
      <table>
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>نوع المعاملة</th>
            <th>المبلغ</th>
            <th>ملاحظات</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  // إضافة المعاملات إلى الجدول
  let totalInvestments = 0;
  let totalPayouts = 0;
  let totalWithdrawals = 0;
  
  for (const transaction of investorTransactions) {
    const rowClass = `transaction-row-${transaction.type}`;
    
    // حساب الإجماليات
    if (transaction.type === 'investment') {
      totalInvestments += transaction.amount;
    } else if (transaction.type === 'payout') {
      totalPayouts += transaction.amount;
    } else if (transaction.type === 'withdrawal') {
      totalWithdrawals += transaction.amount;
    }
    
    printContent += `
      <tr class="${rowClass}">
        <td>${formatDate(transaction.date)}</td>
        <td>${getTransactionTypeName(transaction.type)}</td>
        <td class="amount-cell">${numberWithCommas(transaction.amount)} د.ع</td>
        <td>${transaction.notes || ""}</td>
      </tr>
    `;
  }
  
  // حساب الأرباح المستحقة
  const totalEarnedProfit = calculateTotalEarnedProfit(investorId);
  const remainingProfit = totalEarnedProfit - totalPayouts;
  
  // إضافة ملخص الكشف
  printContent += `
        </tbody>
      </table>
      
      <div class="summary">
        <h3>ملخص الكشف</h3>
        <p><strong>إجمالي الاستثمارات:</strong> ${numberWithCommas(totalInvestments)} د.ع</p>
        <p><strong>إجمالي الأرباح المدفوعة:</strong> ${numberWithCommas(totalPayouts)} د.ع</p>
        <p><strong>إجمالي السحوبات:</strong> ${numberWithCommas(totalWithdrawals)} د.ع</p>
        <p><strong>الأرباح المستحقة المتبقية:</strong> ${numberWithCommas(remainingProfit)} د.ع</p>
      </div>
      
      <div class="footer">
        <p>هذا الكشف تم إصداره بواسطة نظام إدارة الاستثمارات. للاستفسار يرجى التواصل مع مدير النظام.</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;
  
  // كتابة المحتوى في نافذة الطباعة
  printWindow.document.write(printContent);
  printWindow.document.close();
}

// دالة لإرسال تقرير عبر الواتساب
function sendWhatsappReport(investorId) {
  const investor = investors.find(inv => inv.id === investorId);
  if (!investor || !investor.phone) {
    showNotification('لا يوجد رقم هاتف للمستثمر', 'error');
    return;
  }
  
  // تحضير نص الرسالة
  const investorTransactions = transactions.filter(
    trans => trans.investorId === investorId
  );
  
  const investmentTransactions = investorTransactions.filter(t => t.type === 'investment');
  const payoutTransactions = investorTransactions.filter(t => t.type === 'payout');
  
  const totalInvestments = investmentTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalPayouts = payoutTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyProfit = calculateMonthlyProfit(investor.amount);
  const totalEarnedProfit = calculateTotalEarnedProfit(investorId);
  const remainingProfit = totalEarnedProfit - totalPayouts;
  
  let message = `
*تقرير الاستثمار*
الاسم: ${investor.name}
المبلغ المستثمر: ${numberWithCommas(investor.amount)} د.ع
الربح الشهري المتوقع: ${numberWithCommas(monthlyProfit)} د.ع

*ملخص الحساب:*
- إجمالي الاستثمارات: ${numberWithCommas(totalInvestments)} د.ع
- إجمالي الأرباح المدفوعة: ${numberWithCommas(totalPayouts)} د.ع
- الأرباح المستحقة حالياً: ${numberWithCommas(remainingProfit)} د.ع

تاريخ التقرير: ${formatDate(new Date().toISOString().split('T')[0])}
  `;
  
  // تنظيف رقم الهاتف من أي رموز غير ضرورية
  const phoneNumber = investor.phone.replace(/[\s()-]/g, '');
  
  // إنشاء رابط الواتساب
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
  // فتح الرابط في نافذة جديدة
  window.open(whatsappLink, '_blank');
}

// دالة لعرض نافذة جدولة تذكير
function showScheduleReminderModal(investorId) {
  const investor = investors.find(inv => inv.id === investorId);
  if (!investor) return;
  
  // إنشاء نافذة الجدولة
  showModal({
    title: 'جدولة تذكير للدفع',
    content: `
      <div class="form-group mb-3">
        <label class="block text-sm font-bold mb-1">تاريخ التذكير</label>
        <input type="date" id="reminder-date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group mb-3">
        <label class="block text-sm font-bold mb-1">نوع التذكير</label>
        <select id="reminder-type" class="form-control">
          <option value="profit">دفع أرباح</option>
          <option value="info">تحديث معلومات</option>
          <option value="general">تذكير عام</option>
        </select>
      </div>
      <div class="form-group mb-3">
        <label class="block text-sm font-bold mb-1">ملاحظات</label>
        <textarea id="reminder-notes" class="form-control" rows="3" placeholder="أدخل ملاحظات إضافية هنا"></textarea>
      </div>
    `,
    onConfirm: () => {
      // الحصول على قيم الحقول
      const date = document.getElementById('reminder-date').value;
      const type = document.getElementById('reminder-type').value;
      const notes = document.getElementById('reminder-notes').value;
      
      // إنشاء التذكير
      createReminder(investorId, date, type, notes);
    }
  });
}

// دالة لإنشاء تذكير جديد
function createReminder(investorId, date, type, notes) {
  // افتراض وجود مصفوفة للتذكيرات في التخزين المحلي
  const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
  
  // إنشاء تذكير جديد
  const newReminder = {
    id: generateId(),
    investorId,
    date,
    type,
    notes,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  // إضافة التذكير إلى المصفوفة
  reminders.push(newReminder);
  
  // حفظ المصفوفة في التخزين المحلي
  localStorage.setItem('reminders', JSON.stringify(reminders));
  
  // إظهار إشعار بنجاح العملية
  showNotification('تم جدولة التذكير بنجاح', 'success');
}

// دالة لحفظ نسبة الربح المخصصة للمستثمر
function saveCustomProfitRate(investorId) {
  const investor = investors.find(inv => inv.id === investorId);
  if (!investor) return;
  
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
}

// دالة لحفظ دورة الدفع للمستثمر
function savePaymentCycle(investorId) {
  const investor = investors.find(inv => inv.id === investorId);
  if (!investor) return;
  
  // الحصول على القيمة من قائمة الاختيار
  const cycleSelect = document.getElementById('payment-alert-cycle');
  const paymentCycle = cycleSelect.value;
  
  // تحديث دورة الدفع للمستثمر
  investor.paymentCycle = paymentCycle;
  
  // حفظ البيانات
  saveData();
  
  // إظهار إشعار بنجاح العملية
  showNotification('تم حفظ دورة الدفع بنجاح', 'success');
}

// دالة لتصدير بيانات المستثمر
function exportInvestorData(investorId) {
  const investor = investors.find(inv => inv.id === investorId);
  if (!investor) return;
  
  // الحصول على معاملات المستثمر
  const investorTransactions = transactions.filter(
    trans => trans.investorId === investorId
  );
  
  // إنشاء كائن يحتوي على بيانات المستثمر ومعاملاته
  const exportData = {
    investor,
    transactions: investorTransactions
  };
  
  // تحويل البيانات إلى نص JSON
  const jsonData = JSON.stringify(exportData, null, 2);
  
  // إنشاء رابط للتنزيل
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonData);
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `investor_${investor.id}_${investor.name}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

// دالة لعرض حاسبة الاستثمار
function showInvestmentCalculator(investorId) {
  const investor = investors.find(inv => inv.id === investorId);
  if (!investor) return;
  
  // إنشاء نافذة الحاسبة
  showModal({
    title: 'حاسبة الاستثمار',
    size: 'lg',
    content: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="form-group">
          <label class="block text-sm font-bold mb-1">المبلغ المستثمر</label>
          <input type="number" id="calc-amount" class="form-control" value="${investor.amount}">
        </div>
        <div class="form-group">
          <label class="block text-sm font-bold mb-1">نسبة الربح (%)</label>
          <input type="number" id="calc-rate" class="form-control" value="${investor.customProfitRate || profitRate}" step="0.1">
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div class="card p-3 rounded-lg bg-blue-50">
          <h3 class="text-sm font-bold mb-2">الربح الشهري</h3>
          <p id="calc-monthly" class="text-xl font-bold text-blue-600">0 د.ع</p>
        </div>
        <div class="card p-3 rounded-lg bg-green-50">
          <h3 class="text-sm font-bold mb-2">الربح السنوي</h3>
          <p id="calc-yearly" class="text-xl font-bold text-green-600">0 د.ع</p>
        </div>
        <div class="card p-3 rounded-lg bg-yellow-50">
          <h3 class="text-sm font-bold mb-2">العائد بعد 5 سنوات</h3>
          <p id="calc-five-years" class="text-xl font-bold text-yellow-600">0 د.ع</p>
        </div>
      </div>
      
      <div class="form-group mb-4">
        <label class="block text-sm font-bold mb-1">فترة الاستثمار (بالأشهر)</label>
        <input type="range" id="calc-period" class="form-control" min="1" max="60" value="12">
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>شهر</span>
          <span id="calc-period-value">12 شهر</span>
          <span>5 سنوات</span>
        </div>
      </div>
      
      <div class="card p-3 rounded-lg bg-purple-50 mb-4">
        <h3 class="text-sm font-bold mb-2">إجمالي الربح المتوقع</h3>
        <p id="calc-total-profit" class="text-xl font-bold text-purple-600">0 د.ع</p>
        <p id="calc-total-amount" class="text-sm text-gray-600">إجمالي المبلغ بعد الفترة: 0 د.ع</p>
      </div>
    `,
    onRender: () => {
      // الحصول على عناصر الإدخال والإخراج
      const amountInput = document.getElementById('calc-amount');
      const rateInput = document.getElementById('calc-rate');
      const periodInput = document.getElementById('calc-period');
      const periodValueElement = document.getElementById('calc-period-value');
      
      const monthlyElement = document.getElementById('calc-monthly');
      const yearlyElement = document.getElementById('calc-yearly');
      const fiveYearsElement = document.getElementById('calc-five-years');
      const totalProfitElement = document.getElementById('calc-total-profit');
      const totalAmountElement = document.getElementById('calc-total-amount');
      
      // دالة لحساب الأرباح وتحديث العناصر
      const calculateProfits = () => {
        const amount = parseFloat(amountInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        const period = parseInt(periodInput.value) || 0;
        
        // حساب الأرباح
        const monthlyProfit = (amount / 1000000) * rate * 1000;
        const yearlyProfit = monthlyProfit * 12;
        const fiveYearsProfit = yearlyProfit * 5;
        const totalProfit = monthlyProfit * period;
        const totalAmount = amount + totalProfit;
        
        // تحديث العناصر
        monthlyElement.textContent = `${numberWithCommas(Math.round(monthlyProfit))} د.ع`;
        yearlyElement.textContent = `${numberWithCommas(Math.round(yearlyProfit))} د.ع`;
        fiveYearsElement.textContent = `${numberWithCommas(Math.round(fiveYearsProfit))} د.ع`;
        totalProfitElement.textContent = `${numberWithCommas(Math.round(totalProfit))} د.ع`;
        totalAmountElement.textContent = `إجمالي المبلغ بعد الفترة: ${numberWithCommas(Math.round(totalAmount))} د.ع`;
        
        // تحديث عرض قيمة الفترة
        periodValueElement.textContent = `${period} شهر`;
      };
      
      // إضافة مستمعات الأحداث
      amountInput.addEventListener('input', calculateProfits);
      rateInput.addEventListener('input', calculateProfits);
      periodInput.addEventListener('input', calculateProfits);
      
      // حساب الأرباح الأولية
      calculateProfits();
    }
  });
}

// دالة لعرض الرسم البياني للأرباح
function showProfitChart(investorId) {
  // استعراض بيانات الأرباح للمستثمر
  const profitChartContainer = document.getElementById('profit-chart-container');
  
  // إنشاء قماش الرسم البياني
  profitChartContainer.innerHTML = `
    <canvas id="investor-profit-chart" width="100%" height="100%"></canvas>
  `;
  
  // تحضير البيانات للرسم البياني (مثال)
  const months = [];
  const profitData = [];
  const payoutData = [];
  
  // الحصول على آخر 6 أشهر
  const currentDate = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = new Intl.DateTimeFormat('ar-EG', { month: 'short' }).format(date);
    months.push(monthName);
    
    // حساب الأرباح لكل شهر (هذه بيانات تجريبية - يمكن استبدالها بالبيانات الفعلية)
    const monthlyProfit = calculateMonthlyProfit(investor.amount);
    profitData.push(monthlyProfit);
    
    // حساب الدفعات لكل شهر (هذه بيانات تجريبية - يمكن استبدالها بالبيانات الفعلية)
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthPayouts = transactions.filter(
      t => t.investorId === investorId && 
      t.type === 'payout' && 
      t.date.startsWith(yearMonth)
    ).reduce((sum, t) => sum + t.amount, 0);
    
    payoutData.push(monthPayouts);
  }
  
  // إنشاء الرسم البياني باستخدام Chart.js
  const ctx = document.getElementById('investor-profit-chart').getContext('2d');
  
  // يمكن إضافة مكتبة Chart.js في ملف HTML الرئيسي
  if (typeof Chart !== 'undefined') {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'الربح المتوقع',
            data: profitData,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'الدفعات الفعلية',
            data: payoutData,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  } else {
    profitChartContainer.innerHTML = `
      <div class="text-center py-3">
        <p class="text-gray-500">لا يمكن عرض الرسم البياني. يرجى التأكد من تحميل مكتبة Chart.js</p>
      </div>
    `;
  }
}

// دالة لعرض تفاصيل حساب الأرباح
function showProfitDetailsModal(investorId) {
  const investor = investors.find(inv => inv.id === investorId);
  if (!investor) return;
  
  // الحصول على معاملات الاستثمار للمستثمر
  const investmentTransactions = transactions.filter(
    trans => trans.investorId === investorId && trans.type === 'investment'
  ).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // تحضير جدول تفاصيل الأرباح
  let profitDetailsTable = '';
  let totalMonthlyProfit = 0;
  
  for (const investment of investmentTransactions) {
    const investmentDate = new Date(investment.date);
    const currentDate = new Date();
    
    // حساب عدد الأيام منذ الاستثمار
    const daysSinceInvestment = Math.floor((currentDate - investmentDate) / (1000 * 60 * 60 * 24));
    
    // حساب الربح الشهري لهذا الاستثمار
    const monthlyRate = (investor.customProfitRate || profitRate) / 100;
    const monthlyProfit = (investment.amount / 1000000) * monthlyRate * 1000;
    
    // حساب الربح اليومي
    const dailyProfit = monthlyProfit / 30;
    
    // حساب الربح المتراكم
    const accumulatedProfit = dailyProfit * daysSinceInvestment;
    
    // إضافة الربح الشهري إلى الإجمالي
    totalMonthlyProfit += monthlyProfit;
    
    profitDetailsTable += `
      <tr>
        <td>${formatDate(investment.date)}</td>
        <td>${numberWithCommas(investment.amount)} د.ع</td>
        <td>${numberWithCommas(Math.round(monthlyProfit))} د.ع</td>
        <td>${numberWithCommas(Math.round(dailyProfit))} د.ع</td>
        <td>${daysSinceInvestment} يوم</td>
        <td>${numberWithCommas(Math.round(accumulatedProfit))} د.ع</td>
      </tr>
    `;
  }
  
  // حساب الأرباح النسبية للشهر الحالي
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const profitData = calculateProportionalProfit(
    investorId, 
    firstDayOfMonth.toISOString().split('T')[0], 
    today.toISOString().split('T')[0]
  );
  
  // إنشاء نافذة تفاصيل الأرباح
  showModal({
    title: 'تفاصيل حساب الأرباح',
    size: 'lg',
    content: `
      <div class="mb-4">
        <h3 class="font-bold text-lg mb-2">ملخص الأرباح</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="card p-3 rounded-lg bg-blue-50">
            <h4 class="text-sm mb-1">الربح الشهري الإجمالي</h4>
            <p class="text-xl font-bold text-blue-600">${numberWithCommas(Math.round(totalMonthlyProfit))} د.ع</p>
          </div>
          <div class="card p-3 rounded-lg bg-green-50">
            <h4 class="text-sm mb-1">الربح المتراكم منذ البداية</h4>
            <p class="text-xl font-bold text-green-600">${numberWithCommas(calculateTotalEarnedProfit(investorId))} د.ع</p>
          </div>
          <div class="card p-3 rounded-lg bg-yellow-50">
            <h4 class="text-sm mb-1">الربح النسبي للشهر الحالي</h4>
            <p class="text-xl font-bold text-yellow-600">${numberWithCommas(profitData.totalProfit)} د.ع</p>
            <p class="text-xs text-gray-500">(${Math.floor((today.getDate() / lastDayOfMonth.getDate()) * 100)}% من الشهر)</p>
          </div>
        </div>
      </div>
      
      <div class="mb-4">
        <h3 class="font-bold text-lg mb-2">كيفية حساب الأرباح</h3>
        <div class="bg-gray-50 p-3 rounded-lg">
          <p class="mb-2">يتم حساب الربح باستخدام المعادلة التالية:</p>
          <div class="bg-white p-2 rounded border mb-2">
            <p class="font-bold">الربح الشهري = (المبلغ المستثمر / 1,000,000) × نسبة الربح × 1000</p>
          </div>
          <p class="mb-2">الربح اليومي = الربح الشهري ÷ 30</p>
          <p>الربح المتراكم = الربح اليومي × عدد الأيام منذ الاستثمار</p>
        </div>
      </div>
      
      <div>
        <h3 class="font-bold text-lg mb-2">تفاصيل الاستثمارات والأرباح</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="border p-2 text-right">تاريخ الاستثمار</th>
                <th class="border p-2 text-right">المبلغ</th>
                <th class="border p-2 text-right">الربح الشهري</th>
                <th class="border p-2 text-right">الربح اليومي</th>
                <th class="border p-2 text-right">الأيام المنقضية</th>
                <th class="border p-2 text-right">الربح المتراكم</th>
              </tr>
            </thead>
            <tbody>
              ${profitDetailsTable}
            </tbody>
          </table>
        </div>
      </div>
    `
  });
}

// دالة لحساب الأرباح النسبية للفترة المحددة
function calculateProportionalProfit(investorId, startDate, endDate) {
  const investor = investors.find(inv => inv.id === investorId);
  if (!investor) return { totalProfit: 0, projectedMonthlyProfit: 0 };
  
  // تحويل التواريخ إلى كائنات Date
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // حساب عدد الأيام في الفترة
  const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  // الحصول على معاملات الاستثمار المفعلة قبل أو خلال الفترة
  const activeInvestments = transactions.filter(
    trans => trans.investorId === investorId && 
    trans.type === 'investment' && 
    new Date(trans.date) <= end
  );
  
  let totalProfit = 0;
  let projectedMonthlyProfit = 0;
  
  for (const investment of activeInvestments) {
    // حساب الربح الشهري لهذا الاستثمار
    const monthlyRate = (investor.customProfitRate || profitRate) / 100;
    const monthlyProfit = (investment.amount / 1000000) * monthlyRate * 1000;
    
    // إضافة الربح الشهري إلى الربح الشهري المتوقع
    projectedMonthlyProfit += monthlyProfit;
    
    // حساب الربح اليومي
    const dailyProfit = monthlyProfit / 30;
    
    // حساب عدد الأيام الفعلية للحساب
    const investmentDate = new Date(investment.date);
    const effectiveStartDate = investmentDate > start ? investmentDate : start;
    const effectiveDays = Math.floor((end - effectiveStartDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // إضافة الربح المحسوب للفترة
    if (effectiveDays > 0) {
      totalProfit += dailyProfit * effectiveDays;
    }
  }
  
  return {
    totalProfit: Math.round(totalProfit),
    projectedMonthlyProfit: Math.round(projectedMonthlyProfit)
  };
}

function renderInvestorDetailsPage() {
  if (!selectedInvestor) {
    navigateTo('investors');
    return;
  }
  
  const mainContent = document.getElementById('main-content');
  
  // ... الكود الحالي لعرض صفحة المستثمر ...
  
  // إضافة فئة main-content للمحتوى الرئيسي لتمكين إزاحته عند ظهور الشريط الجانبي
  mainContent.classList.add('main-content');
  
  // ... شيفرة HTML لصفحة المستثمر ...
  
  // التأكد من إضافة الشريط الجانبي في نهاية HTML
  let html = `
    <div class="container animate-fadeIn main-content">
      <!-- ... محتوى صفحة تفاصيل المستثمر ... -->
    </div>
    
    <!-- إضافة الشريط الجانبي -->
    ${document.getElementById('settings-sidebar') ? '' : createSidebarTemplate()}
  `;
  
  mainContent.innerHTML = html;
  
  // ... مستمعات الأحداث الحالية ...
  
  // تهيئة الشريط الجانبي بعد إنشاء المحتوى
  setTimeout(() => {
    initSidebar();
    
    // تحديث بيانات الشريط الجانبي
    if (selectedInvestor) {
      updateSidebar(selectedInvestor.id);
    }
  }, 100);
}