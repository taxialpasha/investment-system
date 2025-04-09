/**
 * حل محسن لمشكلة التكرارات في تطبيق نظام إدارة الاستثمارات
 * يجب إضافة هذا الكود في ملف منفصل وربطه في ملف HTML، أو إضافته في نهاية الصفحة
 */

// التنفيذ الفوري للكود لمنع التصادم مع أكواد أخرى
(function() {
    console.log("بدء تشغيل منع التكرارات - النسخة المحسنة");
    
    // مدير لمنع التكرارات
    window.DuplicateManager = {
      // سجل لتتبع استدعاءات الدوال
      callRegistry: {},
      
      // مؤقتات الاستدعاءات
      callTimers: {},
      
      // التحقق من إمكانية تنفيذ دالة معينة
      canExecute: function(functionName, uniqueId = '', timeout = 500) {
        const key = functionName + (uniqueId ? '_' + uniqueId : '');
        
        if (this.callRegistry[key]) {
          console.log(`تم منع تكرار استدعاء: ${functionName}`);
          return false;
        }
        
        this.callRegistry[key] = true;
        
        clearTimeout(this.callTimers[key]);
        this.callTimers[key] = setTimeout(() => {
          this.callRegistry[key] = false;
        }, timeout);
        
        return true;
      },
      
      // تغليف دالة لمنع تكرارها
      preventDuplication: function(originalFunction, functionName, timeout = 500) {
        if (typeof originalFunction !== 'function') {
          console.log(`الدالة ${functionName} ليست دالة صالحة، سيتم تجاهلها`);
          return function() {};
        }
        
        return function(...args) {
          if (window.DuplicateManager.canExecute(functionName, '', timeout)) {
            try {
              return originalFunction.apply(this, args);
            } catch (error) {
              console.error(`خطأ في تنفيذ الدالة ${functionName}:`, error);
            }
          }
          return undefined;
        };
      }
    };
    
    // إصلاح مشكلة العناصر المكررة في الواجهة
    const fixDuplicateElements = function() {
      // تنظيف العناصر المكررة
      const cleanupElementsBySelector = function(selector) {
        const elements = document.querySelectorAll(selector);
        if (elements.length <= 1) return;
        
        console.log(`تنظيف العناصر المكررة: ${selector} (${elements.length} عنصر)`);
        for (let i = 1; i < elements.length; i++) {
          if (elements[i] && elements[i].parentNode) {
            elements[i].parentNode.removeChild(elements[i]);
          }
        }
      };
      
      // قائمة العناصر المكررة للتنظيف
      [
        '#sidebar', 
        '#show-sidebar', 
        '#sidebar-overlay',
        '.modal-overlay',
        '.floating-action-btn',
        '#add-investor-modal',
        '#add-transaction-modal',
        '#profit-calculator-modal',
        '#change-password-modal',
        '#lock-screen-overlay'
      ].forEach(cleanupElementsBySelector);
    };
    
    // إصلاح مشكلة البيانات المكررة
    const fixDuplicateData = function() {
      // تحديد العناصر الفريدة في قائمة استنادًا إلى معيار معين
      const getUniqueElements = function(array, keyFunction) {
        const seen = new Map();
        return array.filter(item => {
          const key = keyFunction(item);
          if (seen.has(key)) {
            return false;
          }
          seen.set(key, true);
          return true;
        });
      };
      
      // فحص قوائم البيانات المعروفة وإزالة التكرارات
      if (window.investors) {
        window.investors = getUniqueElements(window.investors, inv => inv.id);
      }
      
      if (window.transactions) {
        window.transactions = getUniqueElements(window.transactions, trans => trans.id);
      }
      
      if (window.notifications) {
        window.notifications = getUniqueElements(window.notifications, notif => notif.id);
      }
      
      if (window.users) {
        window.users = getUniqueElements(window.users, user => user.username);
      }
    };
    
    // تغليف الدوال الرئيسية لمنع تكرارها
    const wrapMainFunctions = function() {
      // قائمة بالدوال التي يجب تغليفها لمنع التكرار
      const functionsToWrap = [
        'renderHomePage',
        'renderInvestorsPage',
        'renderTransactionsPage',
        'renderReportsPage',
        'renderSettingsPage',
        'renderInvestorDetailsPage',
        'showAddTransactionModal',
        'showWithdrawalModal',
        'addTransaction',
        'implementWithdrawalFeature',
        'initApp',
        'initForms',
        'initEventListeners',
        'applyAllWithdrawalFeatures'
      ];
      
      // تغليف كل دالة بأمان
      functionsToWrap.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
          window[funcName] = window.DuplicateManager.preventDuplication(window[funcName], funcName, 1000);
        }
      });
      
      // معالجة خاصة لدالة navigateTo
      if (typeof window.navigateTo === 'function') {
        const originalNavigateTo = window.navigateTo;
        window.navigateTo = function(page) {
          // عدم تحميل نفس الصفحة مرتين
          if (page === window.currentPage) {
            console.log(`الصفحة ${page} مفتوحة بالفعل`);
            return;
          }
          
          if (window.DuplicateManager.canExecute('navigateTo_' + page, '', 500)) {
            originalNavigateTo.apply(this, arguments);
          }
        };
      }
    };
    
    // دالة أمان لإضافة مستمعي الأحداث
    window.safeAddEventListener = function(selector, eventType, handler) {
      try {
        const element = document.querySelector(selector);
        if (!element) {
          console.warn(`العنصر ${selector} غير موجود لإضافة مستمع الحدث`);
          return false;
        }
        
        // إزالة المستمع القديم إن وجد
        element.removeEventListener(eventType, handler);
        
        // إضافة المستمع الجديد
        element.addEventListener(eventType, handler);
        return true;
      } catch (error) {
        console.error(`خطأ في إضافة مستمع الحدث للعنصر ${selector}:`, error);
        return false;
      }
    };
    
    // دالة آمنة للتعامل مع initApp
    const safeInitApp = function() {
      // تغطية محاولة تنفيذ دالة initApp
      try {
        if (typeof window.initApp === 'function') {
          // التحقق من وجود العناصر المطلوبة قبل الاستدعاء
          const requiredElements = [
            '#nav-home', 
            '#nav-investors', 
            '#nav-transactions', 
            '#nav-reports', 
            '#nav-settings'
          ];
          
          // التحقق من وجود جميع العناصر المطلوبة
          const allElementsExist = requiredElements.every(selector => {
            const exists = !!document.querySelector(selector);
            if (!exists) {
              console.warn(`العنصر ${selector} غير موجود ومطلوب لتهيئة التطبيق`);
            }
            return exists;
          });
          
          if (allElementsExist) {
            window.initApp();
          } else {
            console.error("لا يمكن تهيئة التطبيق: بعض العناصر المطلوبة غير موجودة");
          }
        }
      } catch (error) {
        console.error("خطأ في تهيئة التطبيق:", error);
      }
    };
    
    // إصلاح مشكلة المستمعات المكررة
    const fixDuplicateEventListeners = function() {
      // إعادة ربط الأحداث الأساسية
      const rebindBasicEvents = function() {
        // أحداث التنقل
        try {
          document.querySelectorAll('.nav-item').forEach(item => {
            // إزالة المستمعات القديمة عن طريق استبدال العنصر
            const cloned = item.cloneNode(true);
            if (item.parentNode) {
              item.parentNode.replaceChild(cloned, item);
            }
            
            // إعادة ربط المستمع الجديد
            if (cloned.id === 'nav-home') {
              cloned.addEventListener('click', () => window.navigateTo('home'));
            } else if (cloned.id === 'nav-investors') {
              cloned.addEventListener('click', () => {
                window.selectedInvestor = null;
                window.navigateTo('investors');
              });
            } else if (cloned.id === 'nav-transactions') {
              cloned.addEventListener('click', () => window.navigateTo('transactions'));
            } else if (cloned.id === 'nav-reports') {
              cloned.addEventListener('click', () => window.navigateTo('reports'));
            } else if (cloned.id === 'nav-settings') {
              cloned.addEventListener('click', () => window.navigateTo('settings'));
            }
          });
        } catch (e) {
          console.error("خطأ في إعادة ربط أحداث التنقل:", e);
        }
      };
      
      // محاولة إعادة ربط الأحداث
      try {
        rebindBasicEvents();
      } catch (error) {
        console.error("خطأ في إصلاح المستمعات المكررة:", error);
      }
    };
    
    // دالة لتنفيذ جميع الإصلاحات
    const applyAllFixes = function() {
      // تطبيق الإصلاحات بشكل ملائم للمتصفح
      setTimeout(() => {
        console.log("تطبيق جميع إصلاحات التكرارات...");
        
        fixDuplicateElements();
        fixDuplicateData();
        wrapMainFunctions();
        
        // إجراءات إضافية
        window.implementWithdrawalFeature = window.DuplicateManager.preventDuplication(
          window.implementWithdrawalFeature, 
          'implementWithdrawalFeature', 
          10000
        );
        
        // التعامل مع مشكلة الشريط الجانبي
        if (document.querySelector('#sidebar')) {
          const sidebarItems = document.querySelectorAll('.sidebar-menu-item');
          sidebarItems.forEach(item => {
            const page = item.getAttribute('data-page');
            if (page) {
              // إزالة المستمعات القديمة
              const cloned = item.cloneNode(true);
              if (item.parentNode) {
                item.parentNode.replaceChild(cloned, item);
              }
              
              // إضافة المستمع الجديد
              cloned.addEventListener('click', function(e) {
                e.preventDefault();
                if (page === 'home' || page === 'investors' || page === 'transactions' || 
                    page === 'reports' || page === 'settings') {
                  window.navigateTo(page);
                }
              });
            }
          });
        }
        
        // إصلاح مشكلة المستمعات المكررة
        fixDuplicateEventListeners();
        
        console.log("تم الانتهاء من تطبيق الإصلاحات!");
      }, 500);
    };
    
    // تشغيل الإصلاحات عند تحميل المستند
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyAllFixes);
    } else {
      applyAllFixes();
    }
    
    // مراقبة التغييرات في DOM للتنظيف عند الحاجة
    try {
      const observer = new MutationObserver(function(mutations) {
        let shouldCleanup = false;
        
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 3) {
            shouldCleanup = true;
            break;
          }
        }
        
        if (shouldCleanup) {
          fixDuplicateElements();
        }
      });
      
      // بدء المراقبة
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (error) {
      console.error("خطأ في إعداد مراقب DOM:", error);
    }
    
    console.log("تم تهيئة نظام منع التكرارات بنجاح!");
  })();