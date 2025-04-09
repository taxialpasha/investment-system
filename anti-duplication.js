// anti-duplication.js - ملف لمنع تكرار العناصر والأحداث في الواجهة

// =================== مساحة تخزين لتتبع حالة التطبيق ===================
// يساعد في تتبع العناصر التي تم إنشاؤها بالفعل وتجنب تكرارها
const DuplicationTracker = {
    // تتبع الصفحات التي تم تقديمها
    renderedPages: new Set(),
    
    // تتبع العناصر التي تم إضافة مستمعات الأحداث لها
    elementsWithListeners: new Set(),
    
    // تتبع العمليات الجارية
    ongoingOperations: {
      addingInvestor: false,
      addingTransaction: false,
      updatingInvestor: false,
      renderingPage: false
    },
    
    // جلسة المستخدم الفريدة لتمييز العمليات
    sessionId: Date.now().toString(),
    
    // عداد لتوليد معرفات فريدة للعناصر
    counter: 0
  };
  
  // =================== دوال المساعدة لإدارة الأحداث ===================
  
  /**
   * إزالة جميع مستمعات الأحداث من عنصر واستبداله بنسخة جديدة
   * @param {string} elementId معرف العنصر
   * @param {function} callback الدالة التي سيتم تنفيذها بعد الإزالة
   * @returns نسخة جديدة من العنصر
   */
  function replaceElementAndAddListener(elementId, eventType, callback) {
    const element = document.getElementById(elementId);
    if (!element) return null;
    
    // إنشاء نسخة جديدة من العنصر لإزالة جميع مستمعات الأحداث
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
    
    // إضافة مستمع الحدث الجديد
    newElement.addEventListener(eventType, callback);
    
    // تسجيل العنصر في متتبع التكرار
    DuplicationTracker.elementsWithListeners.add(elementId);
    
    return newElement;
  }
  
  /**
   * تنفيذ دالة مرة واحدة فقط وتمنع التكرار
   * @param {string} operationName اسم العملية
   * @param {function} callback الدالة المراد تنفيذها
   */
  function executeOnce(operationName, callback) {
    if (DuplicationTracker.ongoingOperations[operationName]) {
      console.warn(`العملية "${operationName}" قيد التنفيذ بالفعل`);
      return;
    }
    
    DuplicationTracker.ongoingOperations[operationName] = true;
    
    try {
      // تنفيذ الدالة
      callback();
    } catch (error) {
      console.error(`حدث خطأ أثناء تنفيذ العملية "${operationName}":`, error);
    } finally {
      // إعادة تعيين حالة العملية بعد الانتهاء
      setTimeout(() => {
        DuplicationTracker.ongoingOperations[operationName] = false;
      }, 500); // تأخير بسيط لتجنب التكرار السريع
    }
  }
  
  /**
   * تقديم صفحة مرة واحدة فقط خلال دورة التحديث الحالية
   * @param {string} pageName اسم الصفحة
   * @param {function} renderFunction دالة التقديم
   */
  function renderPageOnce(pageName, renderFunction) {
    const renderKey = `${pageName}_${DuplicationTracker.sessionId}`;
    
    if (DuplicationTracker.renderedPages.has(renderKey)) {
      console.warn(`الصفحة "${pageName}" تم عرضها بالفعل`);
      return;
    }
    
    executeOnce('renderingPage', () => {
      // مسح محتوى الصفحة الحالية
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.innerHTML = '';
      }
      
      // تنفيذ دالة التقديم
      renderFunction();
      
      // تسجيل الصفحة كمعروضة
      DuplicationTracker.renderedPages.add(renderKey);
      
      // إعادة تعيين المتتبع بعد فترة قصيرة للسماح بعرض الصفحة مرة أخرى في المستقبل
      setTimeout(() => {
        DuplicationTracker.renderedPages.delete(renderKey);
      }, 1000);
    });
  }
  
  /**
   * تنظيف مصفوفات البيانات من التكرارات
   * @param {Array} investors مصفوفة المستثمرين
   * @param {Array} transactions مصفوفة المعاملات
   * @returns {Object} مصفوفات نظيفة
   */
  function cleanArraysFromDuplicates(investors, transactions) {
    // تنظيف المستثمرين
    const uniqueInvestorIds = new Set();
    const cleanInvestors = [];
    
    investors.forEach(investor => {
      if (!uniqueInvestorIds.has(investor.id)) {
        uniqueInvestorIds.add(investor.id);
        cleanInvestors.push(investor);
      }
    });
    
    // تنظيف المعاملات
    const uniqueTransactionIds = new Set();
    const cleanTransactions = [];
    
    transactions.forEach(transaction => {
      if (!uniqueTransactionIds.has(transaction.id)) {
        uniqueTransactionIds.add(transaction.id);
        cleanTransactions.push(transaction);
      }
    });
    
    return {
      investors: cleanInvestors,
      transactions: cleanTransactions
    };
  }
  
  /**
   * تسجيل معرف فريد لكل عنصر سيتم إنشاؤه
   * @returns {string} معرف فريد
   */
  function generateUniqueId() {
    return `el_${DuplicationTracker.sessionId}_${++DuplicationTracker.counter}`;
  }
  
  // =================== دوال معدلة للتطبيق الأصلي ===================
  
  /**
   * إضافة مستثمر جديد مع منع التكرار
   */
  function addInvestorSafely() {
    executeOnce('addingInvestor', () => {
      // الكود الأصلي لإضافة مستثمر هنا
      addInvestor();
      
      // تنظيف البيانات بعد الإضافة
      const cleanData = cleanArraysFromDuplicates(investors, transactions);
      investors = cleanData.investors;
      transactions = cleanData.transactions;
      
      // حفظ البيانات النظيفة
      saveData();
    });
  }
  
  /**
   * إضافة معاملة جديدة مع منع التكرار
   */
  function addTransactionSafely() {
    executeOnce('addingTransaction', () => {
      // الكود الأصلي لإضافة معاملة هنا
      addTransaction();
      
      // تنظيف البيانات بعد الإضافة
      const cleanData = cleanArraysFromDuplicates(investors, transactions);
      investors = cleanData.investors;
      transactions = cleanData.transactions;
      
      // حفظ البيانات النظيفة
      saveData();
    });
  }
  
  /**
   * تعديل دالة navigateTo لمنع التكرار
   * @param {string} page اسم الصفحة
   */
  function navigateToSafely(page) {
    // تجنب إعادة تحميل نفس الصفحة (باستثناء الرئيسية)
    if (currentPage === page && page !== 'home') {
      return;
    }
    
    // تحديث الصفحة الحالية
    currentPage = page;
    updateNavigation();
    
    // إعادة تعيين متتبع الصفحات المعروضة
    DuplicationTracker.renderedPages.clear();
    
    // عرض الصفحة المطلوبة مرة واحدة فقط
    switch (page) {
      case 'home':
        renderPageOnce('home', renderHomePage);
        break;
      case 'investors':
        renderPageOnce('investors', renderInvestorsPage);
        break;
      case 'investorDetails':
        renderPageOnce('investorDetails', renderInvestorDetailsPage);
        break;
      case 'transactions':
        renderPageOnce('transactions', renderTransactionsPage);
        break;
      case 'reports':
        renderPageOnce('reports', renderReportsPage);
        break;
      case 'settings':
        renderPageOnce('settings', renderSettingsPage);
        break;
      default:
        renderPageOnce('home', renderHomePage);
    }
    
    // إعادة تهيئة الأحداث للصفحة الجديدة
    setTimeout(setupNewPageEventListeners, 100);
  }
  
  /**
   * إعداد مستمعات الأحداث للصفحة الجديدة
   */
  function setupNewPageEventListeners() {
    // إعادة تعيين متتبع العناصر
    DuplicationTracker.elementsWithListeners.clear();
    
    // إعداد مستمعات الأحداث حسب الصفحة الحالية
    switch (currentPage) {
      case 'home':
        setupHomePageListeners();
        break;
      case 'investors':
        setupInvestorsPageListeners();
        break;
      case 'investorDetails':
        setupInvestorDetailsPageListeners();
        break;
      case 'transactions':
        setupTransactionsPageListeners();
        break;
      case 'reports':
        setupReportsPageListeners();
        break;
      case 'settings':
        setupSettingsPageListeners();
        break;
    }
    
    // إعداد الأزرار العامة والقائمة السفلية
    setupCommonListeners();
  }
  
  /**
   * إعداد مستمعات أحداث الصفحة الرئيسية
   */
  function setupHomePageListeners() {
    replaceElementAndAddListener('view-all-transactions', 'click', () => navigateToSafely('transactions'));
    replaceElementAndAddListener('view-all-investors', 'click', () => navigateToSafely('investors'));
    replaceElementAndAddListener('add-investor-sidebar', 'click', showAddInvestorModal);
    replaceElementAndAddListener('add-first-investor', 'click', showAddInvestorModal);
    
    // ربط الأحداث ببطاقات المستثمرين
    const investorCards = document.querySelectorAll('.investor-card');
    investorCards.forEach(card => {
      // إنشاء معرف فريد لكل بطاقة
      const uniqueId = generateUniqueId();
      card.id = uniqueId;
      
      card.addEventListener('click', function() {
        const investorId = this.getAttribute('data-id');
        const investor = investors.find(inv => inv.id === investorId);
        if (investor) {
          viewInvestorDetails(investor);
        }
      });
    });
  }
  
  // وظائف إعداد مستمعات الأحداث للصفحات الأخرى...
  
  /**
   * إعداد مستمعات الأحداث المشتركة بين جميع الصفحات
   */
  function setupCommonListeners() {
    // إعداد أزرار القائمة السفلية
    replaceElementAndAddListener('nav-home', 'click', () => navigateToSafely('home'));
    replaceElementAndAddListener('nav-investors', 'click', () => {
      selectedInvestor = null;
      navigateToSafely('investors');
    });
    replaceElementAndAddListener('nav-transactions', 'click', () => navigateToSafely('transactions'));
    replaceElementAndAddListener('nav-reports', 'click', () => navigateToSafely('reports'));
    replaceElementAndAddListener('nav-settings', 'click', () => navigateToSafely('settings'));
    
    // إعداد أزرار الرأس
    replaceElementAndAddListener('toggle-theme', 'click', toggleTheme);
    replaceElementAndAddListener('refresh-data', 'click', () => {
      navigateToSafely(currentPage);
      showNotification('تم تحديث البيانات', 'success');
    });
    
    // إعداد زر الإجراء العائم
    replaceElementAndAddListener('floating-action', 'click', () => {
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
  
  /**
   * إعداد نوافذ المستثمر
   */
  function setupInvestorModalListeners() {
    replaceElementAndAddListener('close-investor-modal', 'click', () => hideModal('add-investor-modal'));
    replaceElementAndAddListener('cancel-add-investor', 'click', () => hideModal('add-investor-modal'));
    
    // تحديد الزر المناسب حسب وضع التعديل أو الإضافة
    const isEditMode = document.getElementById('edit-investor-id')?.value;
    const confirmButton = replaceElementAndAddListener('confirm-add-investor', 'click', isEditMode ? updateInvestorSafely : addInvestorSafely);
    
    if (confirmButton) {
      confirmButton.textContent = isEditMode ? 'حفظ التعديلات' : 'إضافة';
    }
  }
  
  /**
   * إعداد نافذة المعاملات
   */
  function setupTransactionModalListeners() {
    replaceElementAndAddListener('close-transaction-modal', 'click', () => hideModal('add-transaction-modal'));
    replaceElementAndAddListener('cancel-add-transaction', 'click', () => hideModal('add-transaction-modal'));
    replaceElementAndAddListener('confirm-add-transaction', 'click', addTransactionSafely);
  }
  
  // =================== تعديلات خاصة بنوافذ العرض ===================
  
  /**
   * عرض نافذة إضافة مستثمر مع منع التكرار
   */
  function showAddInvestorModal() {
    // إعادة تعيين حقول النموذج
    document.getElementById('new-investor-name').value = '';
    document.getElementById('new-investor-phone').value = '';
    document.getElementById('new-investor-address').value = '';
    document.getElementById('new-investor-amount').value = '';
    document.getElementById('new-investor-start-date').value = getCurrentDate();
    document.getElementById('new-investor-start-time').value = '12:00';
    document.getElementById('new-investor-id-card').value = '';
    document.getElementById('new-investor-notes').value = '';
    document.getElementById('edit-investor-id').value = '';
    
    // تغيير عنوان النافذة
    document.getElementById('investor-modal-title').textContent = 'إضافة مستثمر جديد';
    
    // إظهار النافذة
    showModal('add-investor-modal');
    
    // إعداد مستمعات الأحداث للنافذة
    setupInvestorModalListeners();
  }
  
  /**
   * تحديث المستثمر مع منع التكرار
   */
  function updateInvestorSafely() {
    executeOnce('updatingInvestor', () => {
      // الكود الأصلي لتحديث مستثمر هنا
      updateInvestor();
      
      // تنظيف البيانات بعد التحديث
      const cleanData = cleanArraysFromDuplicates(investors, transactions);
      investors = cleanData.investors;
      transactions = cleanData.transactions;
      
      // حفظ البيانات النظيفة
      saveData();
    });
  }
  
  /**
   * وظيفة التهيئة المعدلة
   */
  function initAppSafely() {
    // التحقق مما إذا كان التطبيق قد تمت تهيئته بالفعل
    if (window.appInitialized) {
      console.log('تم تهيئة التطبيق بالفعل');
      return;
    }
    
    console.log('تهيئة التطبيق...');
    
    // مسح أي بيانات موجودة في الذاكرة لتجنب التكرار
    investors = [];
    transactions = [];
    dailySummary = {
      totalInvestments: 0,
      totalPayouts: 0,
      adminExpenses: 0
    };
    notifications = [];
    
    // تحميل البيانات من التخزين المحلي
    const savedData = localStorage.getItem('investmentAppData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        investors = data.investors || [];
        transactions = data.transactions || [];
        profitRate = data.profitRate || 17.5;
        
        // تنظيف البيانات المحملة
        const cleanData = cleanArraysFromDuplicates(investors, transactions);
        investors = cleanData.investors;
        transactions = cleanData.transactions;
        
        // إعادة حساب الملخص
        recalculateSummary();
      } catch (e) {
        console.error('خطأ في قراءة البيانات المحفوظة', e);
      }
    }
    
    // حساب الإشعارات
    calculateUpcomingPayments();
    
    // وضع علامة أن التطبيق تمت تهيئته
    window.appInitialized = true;
    
    console.log('تم تهيئة التطبيق بنجاح');
  }
  
  // =================== استبدال الدوال الأصلية بالنسخ الآمنة ===================
  
  // احتفظ بنسخ من الدوال الأصلية
  const originalNavigateTo = window.navigateTo;
  const originalAddInvestor = window.addInvestor;
  const originalAddTransaction = window.addTransaction;
  const originalUpdateInvestor = window.updateInvestor;
  const originalInitApp = window.initApp;
  const originalShowAddInvestorModal = window.showAddInvestorModal;
  const originalShowAddTransactionModal = window.showAddTransactionModal;
  
  // استبدال الدوال الأصلية بالنسخ الآمنة
  window.navigateTo = navigateToSafely;
  window.addInvestor = addInvestorSafely;
  window.addTransaction = addTransactionSafely;
  window.updateInvestor = updateInvestorSafely;
  window.initApp = initAppSafely;
  window.showAddInvestorModal = showAddInvestorModal;
  
  // تصدير وظائف التنظيف للاستخدام الخارجي
  window.cleanDataArrays = function() {
    const cleanData = cleanArraysFromDuplicates(investors, transactions);
    investors = cleanData.investors;
    transactions = cleanData.transactions;
    saveData();
    return { investors, transactions };
  }
  
  // بدء التطبيق بشكل آمن
  document.addEventListener('DOMContentLoaded', function() {
    initAppSafely();
    
    // تنظيف البيانات قبل عرض أي صفحة
    const cleanData = cleanArraysFromDuplicates(investors, transactions);
    investors = cleanData.investors;
    transactions = cleanData.transactions;
    
    // عرض الصفحة الرئيسية
    navigateToSafely('home');
    
    console.log('تم تحميل الصفحة وتهيئة التطبيق بشكل آمن');
  });