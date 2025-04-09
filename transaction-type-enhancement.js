// transaction-management-integration.js
// ملف التكامل لربط نظام إدارة المعاملات مع التطبيق الرئيسي

/**
 * دالة التكامل الرئيسية - تقوم بإضافة نظام إدارة المعاملات إلى التطبيق
 */
function integrateTransactionManagement() {
  console.log('بدء تكامل نظام إدارة المعاملات...');
  
  // التحقق من تحميل الملفات اللازمة
  if (!window.requestAdminVerificationForDelete || !window.initTransactionManagement) {
    console.error('لم يتم تحميل ملف إدارة المعاملات بشكل صحيح. يرجى التحقق من استيراد transaction-management.js');
    return;
  }
  
  // تسجيل الدالات في النظام الرئيسي
  
  // تعديل دالة renderInvestorDetailsPage
  if (typeof window.renderInvestorDetailsPage === 'function' && !window.originalRenderInvestorDetailsPage) {
    window.originalRenderInvestorDetailsPage = window.renderInvestorDetailsPage;
    
    window.renderInvestorDetailsPage = function() {
      // استدعاء الدالة الأصلية
      window.originalRenderInvestorDetailsPage();
      
      // إضافة أزرار التحكم للمعاملات
      setTimeout(() => {
        enhanceInvestorTransactions();
      }, 100);
      
      // إرسال حدث لإبلاغ المكونات الأخرى بتحديث الصفحة
      document.dispatchEvent(new CustomEvent('pageRendered', { detail: { page: 'investorDetails' } }));
    };
  }
  
  // تعديل دالة renderTransactionsPage
  if (typeof window.renderTransactionsPage === 'function' && !window.originalRenderTransactionsPage) {
    window.originalRenderTransactionsPage = window.renderTransactionsPage;
    
    window.renderTransactionsPage = function() {
      // استدعاء الدالة الأصلية
      window.originalRenderTransactionsPage();
      
      // إضافة أزرار التحكم للمعاملات
      setTimeout(() => {
        enhanceAllTransactions();
      }, 100);
      
      // إرسال حدث لإبلاغ المكونات الأخرى بتحديث الصفحة
      document.dispatchEvent(new CustomEvent('pageRendered', { detail: { page: 'transactions' } }));
    };
  }
  
  // تعديل دالة renderHomePage
  if (typeof window.renderHomePage === 'function' && !window.originalRenderHomePage) {
    window.originalRenderHomePage = window.renderHomePage;
    
    window.renderHomePage = function() {
      // استدعاء الدالة الأصلية
      window.originalRenderHomePage();
      
      // إضافة أزرار التحكم للمعاملات الأخيرة في الصفحة الرئيسية
      setTimeout(() => {
        enhanceHomePageTransactions();
      }, 100);
      
      // إرسال حدث لإبلاغ المكونات الأخرى بتحديث الصفحة
      document.dispatchEvent(new CustomEvent('pageRendered', { detail: { page: 'home' } }));
    };
  }
  
  console.log('تم تكامل نظام إدارة المعاملات بنجاح.');
}

/**
 * إضافة أزرار التحكم للمعاملات في صفحة تفاصيل المستثمر
 */
function enhanceInvestorTransactions() {
  // البحث عن العنصر الذي يحتوي على المعاملات
  const transactionsContainer = document.getElementById('investor-transactions');
  if (!transactionsContainer) return;
  
  // الحصول على جميع عناصر المعاملات
  const transactionItems = transactionsContainer.querySelectorAll('.list-item');
  if (transactionItems.length === 0) return;
  
  // الحصول على معاملات المستثمر المحدد
  const investorTransactions = transactions.filter(t => t.investorId === selectedInvestor.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // إضافة معرفات وأزرار التحكم لكل معاملة
  transactionItems.forEach((item, index) => {
    if (index < investorTransactions.length) {
      const transaction = investorTransactions[index];
      
      // إضافة معرف المعاملة للعنصر
      item.setAttribute('data-id', transaction.id);
      item.classList.add('enhanced-transaction');
      
      // إضافة أزرار التحكم إذا لم تكن موجودة
      if (!item.querySelector('.transaction-controls')) {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'transaction-controls';
        
        controlsDiv.innerHTML = `
          <button class="transaction-edit-btn" data-id="${transaction.id}" title="تعديل المعاملة">
            <i class="fas fa-edit"></i>
          </button>
          <button class="transaction-delete-btn" data-id="${transaction.id}" title="حذف المعاملة">
            <i class="fas fa-trash"></i>
          </button>
        `;
        
        item.appendChild(controlsDiv);
        
        // إضافة مستمعات الأحداث
        const editBtn = controlsDiv.querySelector('.transaction-edit-btn');
        const deleteBtn = controlsDiv.querySelector('.transaction-delete-btn');
        
        editBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          const transactionId = this.getAttribute('data-id');
          window.requestAdminVerificationForEdit(transactionId);
        });
        
        deleteBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          const transactionId = this.getAttribute('data-id');
          window.requestAdminVerificationForDelete(transactionId);
        });
      }
    }
  });
}

/**
 * إضافة أزرار التحكم لجميع المعاملات في صفحة المعاملات
 */
function enhanceAllTransactions() {
  // البحث عن جميع عناصر المعاملات
  const transactionItems = document.querySelectorAll('.transaction-item');
  if (transactionItems.length === 0) return;
  
  // ترتيب المعاملات (الأحدث أولاً)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  // إضافة معرفات وأزرار التحكم لكل معاملة
  transactionItems.forEach((item, index) => {
    if (index < sortedTransactions.length) {
      const transaction = sortedTransactions[index];
      
      // إضافة معرف المعاملة للعنصر
      item.setAttribute('data-id', transaction.id);
      item.classList.add('enhanced-transaction');
      
      // إضافة أزرار التحكم إذا لم تكن موجودة
      if (!item.querySelector('.transaction-controls')) {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'transaction-controls';
        
        controlsDiv.innerHTML = `
          <button class="transaction-edit-btn" data-id="${transaction.id}" title="تعديل المعاملة">
            <i class="fas fa-edit"></i>
          </button>
          <button class="transaction-delete-btn" data-id="${transaction.id}" title="حذف المعاملة">
            <i class="fas fa-trash"></i>
          </button>
        `;
        
        item.appendChild(controlsDiv);
        
        // إضافة مستمعات الأحداث
        const editBtn = controlsDiv.querySelector('.transaction-edit-btn');
        const deleteBtn = controlsDiv.querySelector('.transaction-delete-btn');
        
        editBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          const transactionId = this.getAttribute('data-id');
          window.requestAdminVerificationForEdit(transactionId);
        });
        
        deleteBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          const transactionId = this.getAttribute('data-id');
          window.requestAdminVerificationForDelete(transactionId);
        });
      }
    }
  });
}

/**
 * إضافة أزرار التحكم للمعاملات الأخيرة في الصفحة الرئيسية
 */
function enhanceHomePageTransactions() {
  // البحث عن حاوية المعاملات الأخيرة
  const transactionsContainer = document.querySelector('.transactions-container');
  if (!transactionsContainer) return;
  
  // الحصول على جميع عناصر المعاملات
  const transactionItems = transactionsContainer.querySelectorAll('.transaction-item');
  if (transactionItems.length === 0) return;
  
  // الحصول على المعاملات الأخيرة
  const recentTransactions = [...transactions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  ).slice(0, transactionItems.length);
  
  // إضافة معرفات وأزرار التحكم لكل معاملة
  transactionItems.forEach((item, index) => {
    if (index < recentTransactions.length) {
      const transaction = recentTransactions[index];
      
      // إضافة معرف المعاملة للعنصر
      item.setAttribute('data-id', transaction.id);
      item.classList.add('enhanced-transaction');
      
      // إضافة أزرار التحكم إذا لم تكن موجودة
      if (!item.querySelector('.transaction-controls')) {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'transaction-controls';
        
        controlsDiv.innerHTML = `
          <button class="transaction-edit-btn" data-id="${transaction.id}" title="تعديل المعاملة">
            <i class="fas fa-edit"></i>
          </button>
          <button class="transaction-delete-btn" data-id="${transaction.id}" title="حذف المعاملة">
            <i class="fas fa-trash"></i>
          </button>
        `;
        
        item.appendChild(controlsDiv);
        
        // إضافة مستمعات الأحداث
        const editBtn = controlsDiv.querySelector('.transaction-edit-btn');
        const deleteBtn = controlsDiv.querySelector('.transaction-delete-btn');
        
        editBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          const transactionId = this.getAttribute('data-id');
          window.requestAdminVerificationForEdit(transactionId);
        });
        
        deleteBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          const transactionId = this.getAttribute('data-id');
          window.requestAdminVerificationForDelete(transactionId);
        });
      }
    }
  });
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // التحقق من وجود الدوال الضرورية
  if (typeof window.initTransactionManagement === 'function') {
    // تهيئة نظام إدارة المعاملات
    window.initTransactionManagement();
    
    // دمج النظام مع التطبيق
    integrateTransactionManagement();
    
    console.log('تم تهيئة نظام إدارة المعاملات بنجاح.');
  } else {
    console.error('لم يتم العثور على دوال نظام إدارة المعاملات. تأكد من استيراد الملفات بشكل صحيح.');
  }
});