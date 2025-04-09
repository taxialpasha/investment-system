// ملف دمج نظام السحب مع النظام الرئيسي (integration.js)

// إضافة نظام السحب إلى تطبيق إدارة الاستثمارات
function integrateWithdrawalSystem() {
    // إضافة زر السحب في صفحة تفاصيل المستثمر
    modifyInvestorDetailsPage();
    
    // إضافة إدراج السحوبات في القائمة الرئيسية
    addWithdrawalToMainMenu();
    
    // إضافة مستمعي أحداث لنافذة السحب
    setupWithdrawalModalListeners();
    
    // إضافة مستمعات للتحقق من السحوبات المجدولة
    setupScheduledWithdrawalChecks();
    
    // تعديل عرض الإشعارات لتمييز السحوبات
    enhanceNotificationsDisplay();
    
    // تعديل دالة التنقل لإضافة صفحة السحوبات
    updateNavigationFunction();
    
    console.log('تم دمج نظام السحب بنجاح');
  }
  
  // إعداد مستمعي أحداث لنافذة السحب
  function setupWithdrawalModalListeners() {
    // مستمع للنقر على زر الإغلاق
    document.getElementById('close-withdrawal-modal')?.addEventListener('click', () => {
      hideModal('withdrawal-modal');
    });
    
    // مستمع للنقر على زر الإلغاء
    document.getElementById('cancel-add-withdrawal')?.addEventListener('click', () => {
      hideModal('withdrawal-modal');
    });
    
    // مستمع للنقر على زر التأكيد
    document.getElementById('confirm-add-withdrawal')?.addEventListener('click', () => {
      addWithdrawal();
    });
    
    // مستمع لتبديل حالة الجدولة
    document.getElementById('withdrawal-scheduled')?.addEventListener('change', function() {
      const scheduledDateContainer = document.getElementById('scheduled-date-container');
      if (this.checked) {
        scheduledDateContainer.classList.remove('hidden');
        scheduledDateContainer.classList.add('show');
      } else {
        scheduledDateContainer.classList.add('hidden');
        scheduledDateContainer.classList.remove('show');
      }
    });
    
    // مستمعات لنافذة تعديل السحب المجدول
    document.getElementById('close-edit-withdrawal-modal')?.addEventListener('click', () => {
      hideModal('edit-withdrawal-modal');
    });
    
    document.getElementById('cancel-edit-withdrawal')?.addEventListener('click', () => {
      hideModal('edit-withdrawal-modal');
    });
    
    document.getElementById('confirm-edit-withdrawal')?.addEventListener('click', () => {
      updateScheduledWithdrawal();
    });
  }
  
  // إضافة مستمعات للتحقق من السحوبات المجدولة
  function setupScheduledWithdrawalChecks() {
    // التحقق من السحوبات المجدولة عند بدء التطبيق
    setTimeout(checkScheduledWithdrawals, 3000);
    
    // التحقق من السحوبات المجدولة كل دقيقة
    setInterval(checkScheduledWithdrawals, 60000);
  }
  
  // تعديل عرض الإشعارات لتمييز السحوبات
  function enhanceNotificationsDisplay() {
    // تعديل دالة renderHomePage
    const originalRenderHomePage = window.renderHomePage;
    
    window.renderHomePage = function() {
      // استدعاء الدالة الأصلية
      originalRenderHomePage();
      
      // تحسين عرض الإشعارات
      const notificationsContainer = document.querySelector('.notifications-container');
      if (notificationsContainer) {
        const notificationItems = notificationsContainer.querySelectorAll('.notification-item');
        
        notificationItems.forEach(item => {
          // التحقق مما إذا كانت إشعارات السحب
          const notificationText = item.textContent;
          if (notificationText.includes('سحب') || notificationText.includes('withdrawal')) {
            // إضافة فئة للتمييز البصري
            item.classList.add('scheduled-withdrawal');
            
            // تغيير الأيقونة
            const notificationIndicator = item.querySelector('.notification-indicator');
            if (notificationIndicator) {
              const timeframeElement = notificationIndicator.querySelector('.notification-timeframe');
              if (timeframeElement) {
                timeframeElement.classList.add('urgent');
                
                // تغيير الأيقونة
                const iconElement = timeframeElement.querySelector('i');
                if (iconElement) {
                  iconElement.className = 'fas fa-wallet';
                }
              }
              
              // تغيير لون المبلغ
              const amountElement = notificationIndicator.querySelector('.notification-amount');
              if (amountElement) {
                amountElement.classList.add('amount-out');
              }
            }
          }
        });
      }
    };
  }
  
  // تعديل دالة التنقل لإضافة صفحة السحوبات
  function updateNavigationFunction() {
    // الحصول على دالة التنقل الأصلية
    const originalNavigateTo = window.navigateTo;
    
    // تعديل دالة التنقل
    window.navigateTo = function(page) {
      currentPage = page;
      updateNavigation();
      
      switch (page) {
        case 'home':
          renderHomePage();
          break;
        case 'investors':
          renderInvestorsPage();
          break;
        case 'investorDetails':
          renderInvestorDetailsPage();
          break;
        case 'transactions':
          renderTransactionsPage();
          break;
        case 'reports':
          renderReportsPage();
          break;
        case 'settings':
          renderSettingsPage();
          break;
        case 'withdrawals':
          renderWithdrawalsPage();
          break;
        default:
          renderHomePage();
          break;
      }
    };
    
    // تعديل دالة تحديث التنقل لتشمل صفحة السحوبات
    const originalUpdateNavigation = window.updateNavigation;
    
    window.updateNavigation = function() {
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(item => {
        item.classList.remove('active');
      });
      
      let activeNavId;
      
      switch (currentPage) {
        case 'home':
          activeNavId = 'nav-home';
          break;
        case 'investors':
        case 'investorDetails':
          activeNavId = 'nav-investors';
          break;
        case 'transactions':
          activeNavId = 'nav-transactions';
          break;
        case 'reports':
          activeNavId = 'nav-reports';
          break;
        case 'settings':
          activeNavId = 'nav-settings';
          break;
        case 'withdrawals':
          activeNavId = 'nav-withdrawals';
          break;
      }
      
      if (activeNavId) {
        document.getElementById(activeNavId)?.classList.add('active');
      }
      
      // تحديث العنصر النشط في الشريط الجانبي
      const sidebarMenuItems = document.querySelectorAll('.sidebar-menu-item');
      sidebarMenuItems.forEach(item => {
        item.classList.remove('active');
        
        if (item.getAttribute('data-page') === currentPage) {
          item.classList.add('active');
        }
      });
    };
  }
  
  // تعديل صفحة تفاصيل المستثمر لإضافة زر السحب
  function modifyInvestorDetailsPage() {
    // تعديل دالة renderInvestorDetailsPage
    const originalRenderInvestorDetailsPage = renderInvestorDetailsPage;
    
    renderInvestorDetailsPage = function() {
      originalRenderInvestorDetailsPage();
      
      // التحقق من وجود أزرار الإجراءات
      const actionsContainer = document.querySelector('.card .flex.gap-2');
      if (actionsContainer) {
        // البحث عن زر الدفع وزر الإضافة
        const payoutBtn = document.getElementById('add-payout-btn');
        const investmentBtn = document.getElementById('add-investment-btn');
        
        // إذا لم يكن زر السحب موجودًا بالفعل، أضفه بين زر الدفع وزر الإضافة
        if (!document.getElementById('add-withdrawal-btn')) {
          const withdrawalBtn = document.createElement('button');
          withdrawalBtn.className = 'flex-1 btn btn-danger';
          withdrawalBtn.id = 'add-withdrawal-btn';
          withdrawalBtn.innerHTML = '<i class="fas fa-money-bill-alt ml-1"></i> سحب أموال';
          
          // إضافة زر السحب بين زر الدفع وزر الإضافة
          if (payoutBtn && investmentBtn) {
            actionsContainer.insertBefore(withdrawalBtn, investmentBtn);
          } else {
            actionsContainer.appendChild(withdrawalBtn);
          }
          
          // إضافة مستمع حدث للزر
          withdrawalBtn.addEventListener('click', () => {
            showWithdrawalModal(selectedInvestor);
          });
        }
      }
      
      // إضافة عرض معاملات السحب في قسم المعاملات
      enhanceTransactionsDisplay();
    };
  }
  
  // تحسين عرض المعاملات لتمييز عمليات السحب
  function enhanceTransactionsDisplay() {
    const transactionsContainer = document.getElementById('investor-transactions');
    if (!transactionsContainer) return;
    
    // البحث عن معاملات السحب الخاصة بالمستثمر المحدد
    const withdrawalTransactions = transactions.filter(
      t => t.investorId === selectedInvestor.id && t.type === 'withdrawal'
    );
    
    // إذا كانت هناك معاملات سحب، تحديث العناصر المرئية لعرضها بشكل مميز
    withdrawalTransactions.forEach(withdrawal => {
      const transactionItem = Array.from(transactionsContainer.querySelectorAll('.list-item')).find(item => {
        return item.textContent.includes(formatDate(withdrawal.date)) && 
               item.textContent.includes(numberWithCommas(withdrawal.amount));
      });
      
      if (transactionItem) {
        // إضافة الفئة المميزة لمعاملات السحب
        transactionItem.classList.add('withdrawal-transaction');
        
        // تحديث أيقونة المعاملة بأيقونة السحب
        const icon = transactionItem.querySelector('i');
        if (icon) {
          icon.className = 'fas fa-money-bill-alt withdrawal-icon';
        }
        
        // تحديث نص نوع المعاملة
        const typeText = transactionItem.querySelector('.text-xs:last-child');
        if (typeText) {
          typeText.textContent = withdrawal.isScheduled ? 'سحب مجدول' : 'سحب فوري';
        }
        
        // إضافة بيان حالة السحب إذا كان مجدولاً
        if (withdrawal.isScheduled) {
          const detailsSection = transactionItem.querySelector('div:first-child');
          if (detailsSection) {
            const statusElement = document.createElement('div');
            statusElement.className = 'text-xs mt-1';
            
            if (withdrawal.processed) {
              statusElement.innerHTML = '<span class="badge badge-green">تم التنفيذ</span>';
            } else if (withdrawal.processingError) {
              statusElement.innerHTML = '<span class="badge badge-red">فشل التنفيذ</span>';
            } else {
              const scheduledDate = new Date(withdrawal.scheduledWithdrawalDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              const daysLeft = Math.floor((scheduledDate - today) / (1000 * 60 * 60 * 24));
              
              if (daysLeft <= 0) {
                statusElement.innerHTML = '<span class="badge badge-yellow">مستحق اليوم</span>';
              } else {
                statusElement.innerHTML = `<span class="badge badge-primary">متبقي ${daysLeft} أيام</span>`;
              }
            }
            
            detailsSection.appendChild(statusElement);
          }
        }
      }
    });
  }
  
  // إضافة السحوبات في القائمة الرئيسية
  function addWithdrawalToMainMenu() {
    // 1. إضافة السحوبات في القائمة السفلية
    const navContainer = document.querySelector('.bottom-nav .flex.justify-around');
    if (navContainer) {
      const reportBtn = document.getElementById('nav-reports');
      const settingsBtn = document.getElementById('nav-settings');
      
      // إنشاء زر السحوبات
      const withdrawalsBtn = document.createElement('button');
      withdrawalsBtn.id = 'nav-withdrawals';
      withdrawalsBtn.className = 'nav-item';
      withdrawalsBtn.innerHTML = `
        <i class="fas fa-money-bill-alt"></i>
        <span class="text-xs mt-1">السحوبات</span>
      `;
      
      // إضافة الزر قبل زر الإعدادات
      if (settingsBtn) {
        navContainer.insertBefore(withdrawalsBtn, settingsBtn);
      } else if (reportBtn) {
        navContainer.insertBefore(withdrawalsBtn, reportBtn.nextSibling);
      } else {
        navContainer.appendChild(withdrawalsBtn);
      }
      
      // إضافة مستمع حدث
      withdrawalsBtn.addEventListener('click', () => {
        navigateTo('withdrawals');
      });
    }
    
    // 2. إضافة السحوبات في القائمة المنسدلة
    const actionsDropdown = document.getElementById('actions-dropdown');
    if (actionsDropdown) {
      // إضافة عنصر القائمة بعد القائمة المنسدلة الحالية
      const exportDataItem = actionsDropdown.querySelector('#export-data-dropdown');
      
      if (exportDataItem) {
        const withdrawalsItem = document.createElement('a');
        withdrawalsItem.href = '#';
        withdrawalsItem.className = 'dropdown-item';
        withdrawalsItem.id = 'manage-withdrawals-dropdown';
        withdrawalsItem.innerHTML = `
          <i class="fas fa-money-bill-alt"></i>
          <span>إدارة السحوبات</span>
        `;
        
        // إدراج العنصر بعد حاسبة الأرباح
        actionsDropdown.insertBefore(withdrawalsItem, exportDataItem);
        
        // إضافة مستمع الحدث
        withdrawalsItem.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('actions-dropdown').classList.remove('show');
          navigateTo('withdrawals');
        });
      }
    }
    
    // 3. إضافة السحوبات في الشريط الجانبي (إذا وجد)
    const sidebarMenu = document.querySelector('.sidebar-menu');
    if (sidebarMenu) {
      const reportsMenuItem = Array.from(sidebarMenu.querySelectorAll('.sidebar-menu-item')).find(item => 
        item.getAttribute('data-page') === 'reports'
      );
      
      if (reportsMenuItem) {
        const withdrawalsMenuItem = document.createElement('li');
        withdrawalsMenuItem.className = 'sidebar-menu-item';
        withdrawalsMenuItem.setAttribute('data-page', 'withdrawals');
        withdrawalsMenuItem.innerHTML = `
          <a href="#">
            <i class="fas fa-money-bill-alt"></i>
            <span>إدارة السحوبات</span>
          </a>
        `;
        
        // إدراج العنصر بعد تقارير
        sidebarMenu.insertBefore(withdrawalsMenuItem, reportsMenuItem.nextSibling);
        
        // إضافة مستمع الحدث
        withdrawalsMenuItem.addEventListener('click', function(e) {
          e.preventDefault();
          
          // إغلاق الشريط الجانبي
          const sidebar = document.getElementById('sidebar');
          const sidebarOverlay = document.getElementById('sidebar-overlay');
          if (sidebar && sidebarOverlay) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.classList.remove('sidebar-expanded');
          }
          
          navigateTo('withdrawals');
        });
      }
    }
  }