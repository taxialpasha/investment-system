/**
 * حل شامل لمشكلة التكرارات وأخطاء DOM
 * 
 * هذا الكود يجب إضافته في ملف منفصل (fix-all.js) وربطه قبل إغلاق وسم body
 */
(function() {
    console.log("تشغيل الإصلاح الشامل للتكرارات وأخطاء DOM");
    
    // دالة آمنة للتعامل مع عناصر DOM
    window.safeDOM = {
      // الحصول على عنصر بشكل آمن
      get: function(selector) {
        return document.querySelector(selector);
      },
      
      // تعيين نص في عنصر بشكل آمن
      setText: function(selector, text) {
        const element = this.get(selector);
        if (element) {
          element.textContent = text;
          return true;
        }
        return false;
      },
      
      // إضافة مستمع حدث بشكل آمن
      addEvent: function(selector, event, handler) {
        const element = this.get(selector);
        if (element) {
          element.addEventListener(event, handler);
          return true;
        }
        console.warn(`محاولة إضافة مستمع للعنصر غير الموجود: ${selector}`);
        return false;
      },
      
      // تنظيف العناصر المكررة بناءً على منتقي
      cleanupDuplicates: function(selector) {
        const elements = document.querySelectorAll(selector);
        if (elements.length <= 1) return;
        
        for (let i = 1; i < elements.length; i++) {
          if (elements[i] && elements[i].parentNode) {
            elements[i].parentNode.removeChild(elements[i]);
          }
        }
      }
    };
    
    // 1. إصلاح مشكلة initApp
    if (typeof window.initApp === 'function') {
      const originalInitApp = window.initApp;
      window.initApp = function() {
        try {
          // التحقق من وجود العناصر الأساسية أولاً
          const requiredElements = [
            '#nav-home', '#nav-investors', '#nav-transactions', 
            '#nav-reports', '#nav-settings'
          ];
          
          const missingElements = requiredElements.filter(sel => !document.querySelector(sel));
          if (missingElements.length > 0) {
            console.warn("العناصر المفقودة:", missingElements.join(', '));
            return;
          }
          
          // استدعاء الدالة الأصلية إذا وجدت جميع العناصر
          originalInitApp.apply(this, arguments);
        } catch (error) {
          console.error("خطأ في تهيئة التطبيق:", error);
        }
      };
    }
    
    // 2. إصلاح مشكلة setupRegisterListeners
    if (typeof window.setupRegisterListeners === 'function') {
      const originalSetupRegisterListeners = window.setupRegisterListeners;
      window.setupRegisterListeners = function() {
        try {
          // التحقق من وجود العناصر اللازمة للتسجيل
          const requiredElements = [
            '#close-register-modal', '#cancel-register-btn', '#verify-admin-btn', 
            '#register-btn', '#admin-password'
          ];
          
          const missingElements = requiredElements.filter(sel => !document.querySelector(sel));
          if (missingElements.length > 0) {
            console.warn("عناصر التسجيل المفقودة:", missingElements.join(', '));
            return;
          }
          
          // استدعاء الدالة الأصلية
          originalSetupRegisterListeners.apply(this, arguments);
        } catch (error) {
          console.error("خطأ في إعداد مستمعات التسجيل:", error);
        }
      };
    }
    
    // 3. إصلاح مشكلة showAddInvestorModal
    if (typeof window.showAddInvestorModal === 'function') {
      const originalShowAddInvestorModal = window.showAddInvestorModal;
      window.showAddInvestorModal = function() {
        try {
          // التحقق من وجود العناصر اللازمة
          if (!document.querySelector('#investor-modal-title') || 
              !document.querySelector('#confirm-add-investor')) {
            console.warn("بعض عناصر نافذة إضافة المستثمر غير موجودة");
            return;
          }
          
          // استدعاء الدالة الأصلية
          originalShowAddInvestorModal.apply(this, arguments);
        } catch (error) {
          console.error("خطأ في عرض نافذة إضافة المستثمر:", error);
        }
      };
    }
    
    // 4. إصلاح مشكلة updateTransactionModalForWithdrawal
    if (typeof window.updateTransactionModalForWithdrawal === 'function') {
      const originalUpdateTransactionModal = window.updateTransactionModalForWithdrawal;
      window.updateTransactionModalForWithdrawal = function() {
        try {
          // التحقق من وجود العناصر اللازمة
          const transactionTypeSelect = document.querySelector('#transaction-type');
          if (!transactionTypeSelect) {
            console.warn("عنصر نوع المعاملة غير موجود");
            return;
          }
          
          // استدعاء الدالة الأصلية
          originalUpdateTransactionModal.apply(this, arguments);
        } catch (error) {
          console.error("خطأ في تحديث نافذة المعاملة للسحب:", error);
        }
      };
    }
    
    // 5. إصلاح مشكلة showWithdrawalModal
    if (typeof window.showWithdrawalModal === 'function') {
      const originalShowWithdrawalModal = window.showWithdrawalModal;
      window.showWithdrawalModal = function() {
        try {
          // التحقق من وجود العناصر اللازمة
          const modalTitle = document.querySelector('#transaction-modal-title');
          const transactionTypeSelect = document.querySelector('#transaction-type');
          
          if (!modalTitle || !transactionTypeSelect) {
            console.warn("بعض عناصر نافذة السحب غير موجودة");
            return;
          }
          
          // استدعاء الدالة الأصلية
          originalShowWithdrawalModal.apply(this, arguments);
        } catch (error) {
          console.error("خطأ في عرض نافذة السحب:", error);
        }
      };
    }
    
    // 6. حماية الدوال الأساسية من التكرار
    const protectFromDuplication = function(functionName, timeout = 500) {
      if (typeof window[functionName] !== 'function') return;
      
      const original = window[functionName];
      let lastCallTime = 0;
      
      window[functionName] = function() {
        const now = Date.now();
        if (now - lastCallTime < timeout) {
          console.log(`تم منع تكرار استدعاء: ${functionName}`);
          return;
        }
        
        lastCallTime = now;
        return original.apply(this, arguments);
      };
    };
    
    // حماية الدوال المهمة
    [
      'renderHomePage', 'renderInvestorsPage', 'renderTransactionsPage',
      'renderReportsPage', 'renderSettingsPage', 'renderInvestorDetailsPage',
      'showAddTransactionModal', 'showWithdrawalModal', 'implementWithdrawalFeature',
      'applyAllWithdrawalFeatures'
    ].forEach(funcName => protectFromDuplication(funcName, 1000));
    
    // 7. تنظيف العناصر المكررة
    const cleanupDuplicates = function() {
      const selectorsToClean = [
        '#sidebar', '#show-sidebar', '#sidebar-overlay',
        '.modal-overlay', '#add-investor-modal', '#add-transaction-modal',
        '#profit-calculator-modal', '#change-password-modal',
        '.floating-action-btn'
      ];
      
      selectorsToClean.forEach(selector => {
        window.safeDOM.cleanupDuplicates(selector);
      });
    };
    
    // تنفيذ التنظيف عند تحميل الصفحة وبشكل دوري
    setTimeout(cleanupDuplicates, 1000);
    setInterval(cleanupDuplicates, 5000);
    
    console.log("تم تطبيق الإصلاح الشامل بنجاح");
  })();