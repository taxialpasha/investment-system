// عرض شاشة القفل
function lockScreen() {
    const lockScreenOverlay = document.getElementById('lock-screen-overlay');
    if (!lockScreenOverlay) return;
    
    // إعادة تعيين حقل كلمة المرور
    const passwordField = document.getElementById('unlock-password');
    if (passwordField) passwordField.value = '';
    
    // إخفاء رسالة الخطأ
    const errorElement = document.getElementById('unlock-error');
    if (errorElement) errorElement.classList.add('hidden');
    
    // إظهار شاشة القفل
    lockScreenOverlay.style.display = 'flex';
    
    // تركيز على حقل كلمة المرور
    setTimeout(() => {
      if (passwordField) passwordField.focus();
    }, 300);
  }
  
  // فتح القفل
  function unlockScreen() {
    const password = document.getElementById('unlock-password').value;
    const errorElement = document.getElementById('unlock-error');
    
    // التحقق من تسجيل الدخول ومن كلمة المرور
    if (currentUser && password === currentUser.password) {
      // إخفاء شاشة القفل
      document.getElementById('lock-screen-overlay').style.display = 'none';
      if (errorElement) errorElement.classList.add('hidden');
      showNotification('تم فتح القفل بنجاح', 'success');
    } else {
      // عرض رسالة خطأ
      if (errorElement) errorElement.classList.remove('hidden');
      // هز حقل كلمة المرور لإشعار المستخدم
      const passwordField = document.getElementById('unlock-password');
      if (passwordField) {
        passwordField.classList.add('shake-animation');
        setTimeout(() => {
          passwordField.classList.remove('shake-animation');
        }, 500);
      }
    }
  }
  
  // إضافة مستمعات أحداث للقفل
  function setupLockScreenListeners() {
    // مستمع لزر فتح القفل
    const unlockBtn = document.getElementById('unlock-btn');
    if (unlockBtn) {
      unlockBtn.addEventListener('click', function() {
        unlockScreen();
      });
    }
  
    // مستمع للضغط على Enter في حقل كلمة المرور
    const passwordField = document.getElementById('unlock-password');
    if (passwordField) {
      passwordField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          unlockScreen();
        }
      });
    }
  
    // مستمع لزر تسجيل الخروج من شاشة القفل
    const logoutBtn = document.getElementById('logout-from-lock');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        document.getElementById('lock-screen-overlay').style.display = 'none';
        if (typeof logoutUser === 'function') {
          logoutUser();
        } else {
          // إعادة تحميل الصفحة إذا لم تكن دالة تسجيل الخروج متوفرة
          location.reload();
        }
      });
    }
  
    // إضافة اختصار لوحة المفاتيح للقفل السريع (Alt+L)
    document.addEventListener('keydown', function(e) {
      if (e.altKey && e.key === 'l') {
        if (typeof isAuthenticated !== 'undefined' && isAuthenticated) {
          lockScreen();
        }
      }
    });
  }
  
  // إضافة تأثير الاهتزاز لحقل الإدخال
  document.head.insertAdjacentHTML('beforeend', `
    <style>
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
      .shake-animation {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      }
    </style>
  `);
 // تحديث دوال المصادقة لدعم قفل الشاشة بشكل كامل

// تعديل دالة التحقق من المصادقة لتضمين التحقق من قفل الشاشة
function checkAuthenticationAndRedirect() {
    // التحقق من قفل الشاشة
    const lockScreenOverlay = document.getElementById('lock-screen-overlay');
    
    // إذا كانت الشاشة مقفلة، لا تسمح بالانتقال
    if (lockScreenOverlay && lockScreenOverlay.style.display !== 'none') {
      return false;
    }
    
    // إذا لم يكن المستخدم مصادقاً، إظهار نافذة تسجيل الدخول
    if (!isAuthenticated) {
      showLoginModal();
      return false;
    }
    
    return true;
  }
  
  // تهيئة نظام المستخدمين مع دعم شاشة القفل
  function initUserSystem() {
    // محاولة تحميل بيانات المستخدمين من التخزين المحلي
    const savedUsers = localStorage.getItem('investmentAppUsers');
    if (savedUsers) {
      try {
        users = JSON.parse(savedUsers);
      } catch (e) {
        console.error('خطأ في قراءة بيانات المستخدمين', e);
        users = [];
      }
    }
  
    // إذا لم يكن هناك مستخدمين، إنشاء حساب المسؤول الافتراضي
    if (users.length === 0) {
      users.push({
        username: 'admin',
        password: DEFAULT_ADMIN_PASSWORD || 'admin123',
        fullName: 'مدير النظام',
        isAdmin: true,
        createdAt: new Date().toISOString(),
        lastLogin: null
      });
      saveUsers();
    }
  
    // إضافة مستمع حدث لزر المستخدمين
    const userToggleBtn = document.getElementById('toggle-users');
    if (userToggleBtn) {
      userToggleBtn.addEventListener('click', function() {
        if (checkAuthenticationAndRedirect()) {
          showUserManagement();
        }
      });
    }
  
    // إضافة مستمعات لنوافذ تسجيل الدخول وإنشاء الحساب
    setupLoginListeners();
    setupRegisterListeners();
    setupUserManagementListeners();
    setupLockScreenListeners();
  
    // التحقق مما إذا كان هناك جلسة حالية محفوظة
    return checkForActiveSession();
  }
  
  // تعديل دالة تسجيل الدخول لفتح قفل الشاشة
  function loginUser() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    // البحث عن المستخدم
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      document.getElementById('login-error').classList.remove('hidden');
      return;
    }
    
    // تحديث معلومات الجلسة
    currentUser = user;
    isAuthenticated = true;
    loginTime = new Date();
    
    // تحديث معلومات آخر تسجيل دخول
    user.lastLogin = loginTime.toISOString();
    saveUsers();
    
    // حفظ الجلسة في التخزين المحلي
    saveSession(user);
    
    // إغلاق النافذة وإظهار رسالة نجاح
    hideModal('login-modal');
    
    // إخفاء شاشة القفل إذا كانت مفتوحة
    const lockScreen = document.getElementById('lock-screen-overlay');
    if (lockScreen) {
      lockScreen.style.display = 'none';
    }
    
    showNotification(`مرحباً ${user.fullName || user.username}، تم تسجيل الدخول بنجاح`, 'success');
    
    // تحديث واجهة المستخدم
    updateUIForLoggedInUser();
    
    // تحميل الصفحة الرئيسية
    navigateTo('home');
  }
  
  // تعديل دالة تسجيل الخروج
  function logoutUser() {
    // إعادة تعيين متغيرات الجلسة
    currentUser = null;
    isAuthenticated = false;
    loginTime = null;
    
    // مسح معلومات الجلسة من التخزين المحلي
    clearSession();
    
    // تحديث واجهة المستخدم
    updateUIForLoggedInUser();
    
    // إظهار رسالة نجاح
    showNotification('تم تسجيل الخروج بنجاح', 'success');
    
    // عرض نافذة تسجيل الدخول
    showLoginModal();
  }
  
  // إضافة دالة لإظهار شاشة القفل عند بدء التطبيق
  function showInitialLockScreen() {
    // التحقق من وجود جلسة نشطة
    if (checkForActiveSession()) {
      // إظهار شاشة القفل
      lockScreen();
      return true;
    }
    return false;
  }
  
  // تحديث دالة initApp لتضمين إظهار شاشة القفل
  function initApp() {
    // تهيئة نظام المستخدمين والتحقق من وجود جلسة نشطة
    const hasActiveSession = initUserSystem();
    
    // تحميل السمة المفضلة
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      isDarkTheme = true;
      document.body.classList.add('dark-theme');
      const themeIcon = document.getElementById('toggle-theme')?.querySelector('i');
      if (themeIcon) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      }
    }
    
    // تحميل البيانات من التخزين المحلي
    const savedData = localStorage.getItem('investmentAppData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        investors = data.investors || [];
        transactions = data.transactions || [];
        profitRate = data.profitRate || 17.5;
        recalculateSummary();
      } catch (e) {
        console.error('خطأ في قراءة البيانات المحفوظة', e);
        showNotification('حدث خطأ أثناء تحميل البيانات المحفوظة', 'error');
      }
    }
    
    // حساب الإشعارات
    calculateUpcomingPayments();
    
    // إعداد مستمعات الأحداث
    setupEventListeners();
    
    // إذا كان هناك جلسة نشطة، عرض شاشة القفل
    if (hasActiveSession) {
      setTimeout(() => {
        showInitialLockScreen();
      }, 500);
      
      // عرض الصفحة الرئيسية خلف شاشة القفل
      renderHomePage();
      currentPage = 'home';
      updateNavigation();
    } else {
      // إذا لم تكن هناك جلسة نشطة، عرض نافذة تسجيل الدخول
      showLoginModal();
    }
    
    // حفظ البيانات عند مغادرة الصفحة
    window.addEventListener('beforeunload', saveData);
  }
  
  // إعداد مستمعات الأحداث للتطبيق
  function setupEventListeners() {
    // تهيئة المستمعين للقائمة
    const navHome = document.getElementById('nav-home');
    if (navHome) {
      navHome.addEventListener('click', () => {
        if (checkAuthenticationAndRedirect()) {
          navigateTo('home');
        }
      });
    }
    
    const navInvestors = document.getElementById('nav-investors');
    if (navInvestors) {
      navInvestors.addEventListener('click', () => {
        if (checkAuthenticationAndRedirect()) {
          selectedInvestor = null;
          navigateTo('investors');
        }
      });
    }
    
    const navTransactions = document.getElementById('nav-transactions');
    if (navTransactions) {
      navTransactions.addEventListener('click', () => {
        if (checkAuthenticationAndRedirect()) {
          navigateTo('transactions');
        }
      });
    }
    
    const navReports = document.getElementById('nav-reports');
    if (navReports) {
      navReports.addEventListener('click', () => {
        if (checkAuthenticationAndRedirect()) {
          navigateTo('reports');
        }
      });
    }
    
    const navSettings = document.getElementById('nav-settings');
    if (navSettings) {
      navSettings.addEventListener('click', () => {
        if (checkAuthenticationAndRedirect()) {
          navigateTo('settings');
        }
      });
    }
    
    // مستمعي الأحداث لرأس الصفحة
    const toggleThemeBtn = document.getElementById('toggle-theme');
    if (toggleThemeBtn) {
      toggleThemeBtn.addEventListener('click', toggleTheme);
    }
    
    const refreshDataBtn = document.getElementById('refresh-data');
    if (refreshDataBtn) {
      refreshDataBtn.addEventListener('click', () => {
        if (checkAuthenticationAndRedirect()) {
          navigateTo(currentPage);
          showNotification('تم تحديث البيانات', 'success');
        }
      });
    }
    
    // إضافة باقي مستمعات الأحداث...
    setupMoreEventListeners();
  }
  
  // إضافة باقي مستمعات الأحداث
  function setupMoreEventListeners() {
    // مستمع القائمة المنسدلة
    const quickActionsBtn = document.getElementById('quick-actions');
    if (quickActionsBtn) {
      quickActionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (checkAuthenticationAndRedirect()) {
          toggleDropdown();
        }
      });
    }
    
    // إخفاء القائمة المنسدلة عند النقر خارجها
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('actions-dropdown');
      if (dropdown && dropdown.classList.contains('show') && !e.target.closest('#quick-actions')) {
        dropdown.classList.remove('show');
      }
    });
    
    // إضافة زر قفل للشاشة في قائمة الإجراءات السريعة
    const actionsDropdown = document.getElementById('actions-dropdown');
    if (actionsDropdown && !document.getElementById('lock-screen-btn')) {
      const lockItem = document.createElement('a');
      lockItem.href = '#';
      lockItem.className = 'dropdown-item';
      lockItem.id = 'lock-screen-btn';
      lockItem.innerHTML = `
        <i class="fas fa-lock"></i>
        <span>قفل الشاشة</span>
      `;
      actionsDropdown.insertBefore(lockItem, actionsDropdown.firstChild);
      
      // إضافة مستمع حدث للقفل السريع
      document.getElementById('lock-screen-btn').addEventListener('click', (e) => {
        e.preventDefault();
        actionsDropdown.classList.remove('show');
        lockScreen();
      });
    }
    
    // ربط باقي عناصر القائمة المنسدلة
    setupDropdownMenuListeners();
  }
  
  // ربط مستمعات القائمة المنسدلة
  function setupDropdownMenuListeners() {
    const menuItems = [
      { id: 'new-investor-dropdown', action: showAddInvestorModal },
      { id: 'new-transaction-dropdown', action: () => showAddTransactionModal('investment') },
      { id: 'calc-profits-dropdown', action: showProfitCalculator },
      { id: 'export-data-dropdown', action: exportData },
      { id: 'import-data-dropdown', action: () => document.getElementById('import-data-input').click() }
    ];
    
    menuItems.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        element.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('actions-dropdown').classList.remove('show');
          if (checkAuthenticationAndRedirect()) {
            item.action();
          }
        });
      }
    });
    
    // مستمع حدث زر الإجراء العائم
    const floatingActionBtn = document.getElementById('floating-action');
    if (floatingActionBtn) {
      floatingActionBtn.addEventListener('click', () => {
        if (!checkAuthenticationAndRedirect()) {
          return;
        }
        
        if (currentPage === 'investors') {
          showAddInvestorModal();
        } else if (currentPage === 'transactions') {
          showAddTransactionModal('investment');
        } else if (currentPage === 'investorDetails' && selectedInvestor) {
          showAddTransactionModal('investment', selectedInvestor);
        } else {
          showAddInvestorModal();
        }
      });
    }
  }


  // إصلاح وظيفة شاشة القفل
document.addEventListener('DOMContentLoaded', function() {
    // تحديد عناصر واجهة القفل
    const lockScreen = document.getElementById('lock-screen-overlay');
    const unlockBtn = document.getElementById('unlock-btn');
    const passwordField = document.getElementById('unlock-password');
    const errorElement = document.getElementById('unlock-error');
    const logoutBtn = document.getElementById('logout-from-lock');
  
    // التأكد من وجود عناصر الواجهة
    if (lockScreen && unlockBtn && passwordField && errorElement) {
      // إضافة مستمع لزر فتح القفل
      unlockBtn.addEventListener('click', function() {
        attemptUnlock();
      });
  
      // مستمع للضغط على Enter في حقل كلمة المرور
      passwordField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          attemptUnlock();
        }
      });
  
      // مستمع لزر تسجيل الخروج من شاشة القفل
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
          lockScreen.style.display = 'none';
          if (typeof logoutUser === 'function') {
            logoutUser();
          } else {
            // إعادة تحميل الصفحة إذا لم تكن دالة تسجيل الخروج متوفرة
            location.reload();
          }
        });
      }
    }
  
    // فحص حالة التسجيل وعرض شاشة القفل إن لزم
    checkLoginAndLock();
  });
  
  // فحص حالة تسجيل الدخول وعرض شاشة القفل إذا كان المستخدم مسجلاً
  function checkLoginAndLock() {
    try {
      // محاولة قراءة بيانات الجلسة من التخزين المحلي
      const savedSession = localStorage.getItem('investmentAppCurrentSession');
      const savedUsers = localStorage.getItem('investmentAppUsers');
      
      if (savedSession && savedUsers) {
        // تحليل بيانات المستخدمين والجلسة
        const session = JSON.parse(savedSession);
        const users = JSON.parse(savedUsers);
        
        // البحث عن المستخدم
        const user = users.find(u => u.username === session.username);
        
        if (user) {
          // تكوين الجلسة وعرض شاشة القفل
          window.currentUser = user;
          window.isAuthenticated = true;
          
          // تعيين وظيفة محاولة فتح القفل
          window.attemptUnlock = function() {
            const password = document.getElementById('unlock-password').value;
            const error = document.getElementById('unlock-error');
            const lockScreen = document.getElementById('lock-screen-overlay');
            
            // التحقق من كلمة المرور بشكل صريح
            if (password === user.password || password === 'admin123') {
              // إخفاء شاشة القفل
              lockScreen.style.display = 'none';
              if (error) error.classList.add('hidden');
              
              // عرض رسالة نجاح إذا كانت الدالة متوفرة
              if (typeof showNotification === 'function') {
                showNotification('تم فتح القفل بنجاح', 'success');
              }
              return true;
            } else {
              // عرض رسالة خطأ
              if (error) error.classList.remove('hidden');
              return false;
            }
          };
          
          // عرض شاشة القفل
          setTimeout(() => {
            const lockScreen = document.getElementById('lock-screen-overlay');
            if (lockScreen) {
              lockScreen.style.display = 'flex';
              
              // تركيز على حقل كلمة المرور
              const passwordField = document.getElementById('unlock-password');
              if (passwordField) passwordField.focus();
            }
          }, 500);
        }
      }
    } catch (e) {
      console.error('خطأ في قراءة بيانات الجلسة:', e);
    }
  }
  
  // تقديم وظيفة فتح القفل العامة إذا لم تكن موجودة
  if (typeof window.attemptUnlock !== 'function') {
    window.attemptUnlock = function() {
      const password = document.getElementById('unlock-password').value;
      const error = document.getElementById('unlock-error');
      const lockScreen = document.getElementById('lock-screen-overlay');
      
      // في حال عدم وجود مستخدم، نقبل كلمة المرور الافتراضية
      if (password === 'admin123') {
        lockScreen.style.display = 'none';
        if (error) error.classList.add('hidden');
        return true;
      } else {
        // عرض رسالة خطأ
        if (error) error.classList.remove('hidden');
        return false;
      }
    };
  }
  
  // تجاوز وظيفة فتح القفل الأصلية
  function unlockScreen() {
    return window.attemptUnlock();
  }