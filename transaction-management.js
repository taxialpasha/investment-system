// transaction-management.js
// ملف لإدارة المعاملات مع التحقق من صلاحيات المسؤول

/**
 * نافذة التحقق من صلاحيات المسؤول قبل حذف أو تعديل المعاملات
 */
function initAdminVerificationModal() {
  // التحقق من وجود النافذة مسبقاً
  if (document.getElementById('admin-verification-modal')) {
    return;
  }

  // إنشاء HTML للنافذة المنبثقة
  const modalHTML = `
    <div id="admin-verification-modal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">تأكيد صلاحيات المسؤول</h2>
          <button class="modal-close" id="close-admin-verification-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="alert alert-info mb-3">
            <i class="fas fa-shield-alt"></i>
            <div>
              <p class="font-bold">هذه العملية تتطلب صلاحيات المسؤول</p>
              <p class="text-sm">الرجاء إدخال كلمة مرور المسؤول للمتابعة</p>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">كلمة مرور المسؤول</label>
            <input 
              type="password" 
              id="admin-verification-password"
              class="w-full"
              placeholder="أدخل كلمة مرور المسؤول"
            />
          </div>
          
          <div id="admin-verification-error" class="alert alert-danger mb-3 hidden">
            <i class="fas fa-exclamation-circle"></i>
            <div>
              <p>كلمة المرور غير صحيحة</p>
            </div>
          </div>
        </div>
        
        <input type="hidden" id="verification-action-type" value="">
        <input type="hidden" id="verification-transaction-id" value="">
        
        <div class="modal-footer">
          <button id="cancel-admin-verification" class="btn btn-gray">
            إلغاء
          </button>
          <button id="confirm-admin-verification" class="btn btn-primary">
            <i class="fas fa-check ml-1"></i>
            تأكيد
          </button>
        </div>
      </div>
    </div>
  `;
  
  // إضافة النافذة للصفحة
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // إضافة مستمعات الأحداث
  document.getElementById('close-admin-verification-modal').addEventListener('click', () => {
    hideModal('admin-verification-modal');
  });
  
  document.getElementById('cancel-admin-verification').addEventListener('click', () => {
    hideModal('admin-verification-modal');
  });
  
  document.getElementById('confirm-admin-verification').addEventListener('click', () => {
    verifyAdminAndProceed();
  });
  
  // مستمع للضغط على Enter في حقل كلمة المرور
  document.getElementById('admin-verification-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      verifyAdminAndProceed();
    }
  });
}

/**
 * التحقق من كلمة مرور المسؤول والمتابعة بالإجراء المطلوب
 */
function verifyAdminAndProceed() {
  const password = document.getElementById('admin-verification-password').value;
  const actionType = document.getElementById('verification-action-type').value;
  const transactionId = document.getElementById('verification-transaction-id').value;
  
  // البحث عن حساب مسؤول
  const adminUser = users.find(user => user.isAdmin);
  
  // التحقق من كلمة المرور
  if (adminUser && adminUser.password === password) {
    // إخفاء رسالة الخطأ ونافذة التحقق
    document.getElementById('admin-verification-error').classList.add('hidden');
    hideModal('admin-verification-modal');
    
    // تنفيذ الإجراء المطلوب
    if (actionType === 'delete') {
      proceedWithDeleteTransaction(transactionId);
    } else if (actionType === 'edit') {
      proceedWithEditTransaction(transactionId);
    }
  } else {
    // إظهار رسالة الخطأ
    document.getElementById('admin-verification-error').classList.remove('hidden');
  }
}

/**
 * طلب التحقق من صلاحيات المسؤول قبل حذف معاملة
 * @param {string} transactionId معرف المعاملة المراد حذفها
 */
function requestAdminVerificationForDelete(transactionId) {
  // إذا كان المستخدم الحالي مسؤول، المتابعة مباشرة
  if (currentUser && currentUser.isAdmin) {
    if (confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
      proceedWithDeleteTransaction(transactionId);
    }
    return;
  }
  
  // التأكد من وجود النافذة
  initAdminVerificationModal();
  
  // تعيين نوع الإجراء ومعرف المعاملة
  document.getElementById('verification-action-type').value = 'delete';
  document.getElementById('verification-transaction-id').value = transactionId;
  
  // إعادة تعيين حقل كلمة المرور وإخفاء رسالة الخطأ
  document.getElementById('admin-verification-password').value = '';
  document.getElementById('admin-verification-error').classList.add('hidden');
  
  // إظهار النافذة
  showModal('admin-verification-modal');
  
  // تركيز على حقل كلمة المرور
  setTimeout(() => {
    document.getElementById('admin-verification-password').focus();
  }, 300);
}

/**
 * طلب التحقق من صلاحيات المسؤول قبل تعديل معاملة
 * @param {string} transactionId معرف المعاملة المراد تعديلها
 */
function requestAdminVerificationForEdit(transactionId) {
  // إذا كان المستخدم الحالي مسؤول، المتابعة مباشرة
  if (currentUser && currentUser.isAdmin) {
    proceedWithEditTransaction(transactionId);
    return;
  }
  
  // التأكد من وجود النافذة
  initAdminVerificationModal();
  
  // تعيين نوع الإجراء ومعرف المعاملة
  document.getElementById('verification-action-type').value = 'edit';
  document.getElementById('verification-transaction-id').value = transactionId;
  
  // إعادة تعيين حقل كلمة المرور وإخفاء رسالة الخطأ
  document.getElementById('admin-verification-password').value = '';
  document.getElementById('admin-verification-error').classList.add('hidden');
  
  // إظهار النافذة
  showModal('admin-verification-modal');
  
  // تركيز على حقل كلمة المرور
  setTimeout(() => {
    document.getElementById('admin-verification-password').focus();
  }, 300);
}

/**
 * حذف المعاملة بعد التحقق من صلاحيات المسؤول
 * @param {string} transactionId معرف المعاملة المراد حذفها
 */
function proceedWithDeleteTransaction(transactionId) {
  // البحث عن المعاملة
  const transactionIndex = transactions.findIndex(t => t.id === transactionId);
  
  if (transactionIndex === -1) {
    showNotification('لم يتم العثور على المعاملة', 'error');
    return;
  }
  
  const transaction = transactions[transactionIndex];
  
  // التعامل مع المعاملة حسب نوعها وتحديث البيانات بشكل صحيح
  if (transaction.type === 'investment') {
    // البحث عن المستثمر
    const investor = investors.find(inv => inv.id === transaction.investorId);
    
    if (investor) {
      // تحديث مبلغ المستثمر (خصم مبلغ الاستثمار)
      investor.amount -= transaction.amount;
      
      // تحديث ملخص اليوم
      dailySummary.totalInvestments -= transaction.amount;
      
      // تحديث المستثمر المحدد إذا كان هو نفسه
      if (selectedInvestor && selectedInvestor.id === investor.id) {
        selectedInvestor = investor;
      }
    }
  } else if (transaction.type === 'payout') {
    // تحديث ملخص اليوم (خصم مبلغ الدفع)
    dailySummary.totalPayouts -= transaction.amount;
  } else if (transaction.type === 'withdrawal') {
    // البحث عن المستثمر
    const investor = investors.find(inv => inv.id === transaction.investorId);
    
    if (investor) {
      // إعادة المبلغ المسحوب للمستثمر
      investor.amount += transaction.amount;
      
      // تحديث ملخص اليوم
      dailySummary.totalInvestments += transaction.amount;
      
      // تحديث المستثمر المحدد إذا كان هو نفسه
      if (selectedInvestor && selectedInvestor.id === investor.id) {
        selectedInvestor = investor;
      }
    }
  } else if (transaction.type === 'admin') {
    // تحديث ملخص اليوم (خصم المصروف الإداري)
    dailySummary.adminExpenses -= transaction.amount;
  }
  
  // حذف المعاملة من المصفوفة
  transactions.splice(transactionIndex, 1);
  
  // إعادة حساب الإشعارات
  calculateUpcomingPayments();
  
  // حفظ البيانات
  saveData();
  
  // عرض إشعار بنجاح العملية
  showNotification('تم حذف المعاملة بنجاح', 'success');
  
  // تحديث الواجهة حسب الصفحة الحالية
  if (currentPage === 'investorDetails' && selectedInvestor) {
    renderInvestorDetailsPage();
  } else if (currentPage === 'transactions') {
    renderTransactionsPage();
  } else if (currentPage === 'home') {
    renderHomePage();
  }
}

/**
 * تعديل المعاملة بعد التحقق من صلاحيات المسؤول
 * @param {string} transactionId معرف المعاملة المراد تعديلها
 */
function proceedWithEditTransaction(transactionId) {
  // البحث عن المعاملة
  const transaction = transactions.find(t => t.id === transactionId);
  
  if (!transaction) {
    showNotification('لم يتم العثور على المعاملة', 'error');
    return;
  }
  
  // إنشاء نافذة تعديل المعاملة أو عرضها إذا كانت موجودة
  showEditTransactionModal(transaction);
}

/**
 * عرض نافذة تعديل المعاملة
 * @param {Object} transaction المعاملة المراد تعديلها
 */
function showEditTransactionModal(transaction) {
  // التأكد من وجود النافذة
  if (!document.getElementById('edit-transaction-modal')) {
    createEditTransactionModal();
  }
  
  // البحث عن المستثمر
  const investor = investors.find(inv => inv.id === transaction.investorId);
  
  // تحديد عنوان النافذة حسب نوع المعاملة
  let modalTitle = '';
  switch (transaction.type) {
    case 'investment':
      modalTitle = 'تعديل استثمار';
      break;
    case 'payout':
      modalTitle = 'تعديل دفع ربح';
      break;
    case 'withdrawal':
      modalTitle = 'تعديل سحب من الاستثمار';
      break;
    case 'admin':
      modalTitle = 'تعديل مصروف إداري';
      break;
    default:
      modalTitle = 'تعديل معاملة';
  }
  
  document.getElementById('edit-transaction-modal-title').textContent = modalTitle;
  
  // تعبئة حقول النموذج ببيانات المعاملة
  document.getElementById('edit-transaction-amount').value = transaction.amount;
  document.getElementById('edit-transaction-date').value = transaction.date;
  document.getElementById('edit-transaction-notes').value = transaction.notes || '';
  document.getElementById('edit-transaction-id').value = transaction.id;
  
  // تحديث اسم المستثمر وإخفاء قائمة المستثمرين
  if (investor) {
    document.getElementById('edit-transaction-investor-name').textContent = investor.name;
    document.getElementById('edit-transaction-type-display').textContent = getTransactionTypeName(transaction.type);
  } else if (transaction.type === 'admin') {
    document.getElementById('edit-transaction-investor-name').textContent = 'مصروف إداري';
    document.getElementById('edit-transaction-type-display').textContent = getTransactionTypeName(transaction.type);
  }
  
  // إظهار النافذة
  showModal('edit-transaction-modal');
}

/**
 * إنشاء نافذة تعديل المعاملة
 */
function createEditTransactionModal() {
  const modalHTML = `
    <div id="edit-transaction-modal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title" id="edit-transaction-modal-title">تعديل معاملة</h2>
          <button class="modal-close" id="close-edit-transaction-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="card-blue-light p-3 rounded-lg mb-4">
            <div class="flex justify-between mb-1">
              <div>
                <p class="font-medium">المستثمر</p>
                <p id="edit-transaction-investor-name" class="font-bold">اسم المستثمر</p>
              </div>
              <div>
                <p class="font-medium">نوع المعاملة</p>
                <p id="edit-transaction-type-display" class="font-bold">نوع المعاملة</p>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">المبلغ (د.ع)*</label>
            <input 
              type="number" 
              id="edit-transaction-amount"
              class="w-full"
              placeholder="أدخل المبلغ"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">التاريخ</label>
            <input 
              type="date" 
              id="edit-transaction-date"
              class="w-full"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">ملاحظات</label>
            <textarea 
              id="edit-transaction-notes"
              class="w-full"
              placeholder="أي ملاحظات إضافية"
              rows="2"
            ></textarea>
          </div>
          
          <input type="hidden" id="edit-transaction-id" value="" />
        </div>
        
        <div class="modal-footer">
          <button 
            class="btn btn-gray"
            id="cancel-edit-transaction"
          >
            إلغاء
          </button>
          <button 
            class="btn btn-primary"
            id="confirm-edit-transaction"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  `;
  
  // إضافة النافذة للصفحة
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // إضافة مستمعات الأحداث
  document.getElementById('close-edit-transaction-modal').addEventListener('click', () => {
    hideModal('edit-transaction-modal');
  });
  
  document.getElementById('cancel-edit-transaction').addEventListener('click', () => {
    hideModal('edit-transaction-modal');
  });
  
  document.getElementById('confirm-edit-transaction').addEventListener('click', () => {
    saveEditedTransaction();
  });
}

/**
 * حفظ المعاملة المعدلة
 */
function saveEditedTransaction() {
  const transactionId = document.getElementById('edit-transaction-id').value;
  const newAmount = parseFloat(document.getElementById('edit-transaction-amount').value);
  const newDate = document.getElementById('edit-transaction-date').value;
  const newNotes = document.getElementById('edit-transaction-notes').value;
  
  // التحقق من صحة البيانات
  if (isNaN(newAmount) || newAmount <= 0 || !newDate) {
    showNotification('الرجاء إدخال المبلغ والتاريخ بشكل صحيح', 'error');
    return;
  }
  
  // البحث عن المعاملة
  const transactionIndex = transactions.findIndex(t => t.id === transactionId);
  
  if (transactionIndex === -1) {
    showNotification('لم يتم العثور على المعاملة', 'error');
    return;
  }
  
  const transaction = transactions[transactionIndex];
  const oldAmount = transaction.amount;
  
  // تعديل المعاملة حسب نوعها وتحديث البيانات
  if (transaction.type === 'investment') {
    // البحث عن المستثمر
    const investor = investors.find(inv => inv.id === transaction.investorId);
    
    if (investor) {
      // تحديث مبلغ المستثمر (خصم المبلغ القديم وإضافة المبلغ الجديد)
      investor.amount = investor.amount - oldAmount + newAmount;
      
      // تحديث ملخص اليوم
      dailySummary.totalInvestments = dailySummary.totalInvestments - oldAmount + newAmount;
      
      // تحديث المستثمر المحدد إذا كان هو نفسه
      if (selectedInvestor && selectedInvestor.id === investor.id) {
        selectedInvestor = investor;
      }
    }
  } else if (transaction.type === 'payout') {
    // تحديث ملخص اليوم (خصم المبلغ القديم وإضافة المبلغ الجديد)
    dailySummary.totalPayouts = dailySummary.totalPayouts - oldAmount + newAmount;
  } else if (transaction.type === 'withdrawal') {
    // البحث عن المستثمر
    const investor = investors.find(inv => inv.id === transaction.investorId);
    
    if (investor) {
      // تعديل المبلغ المسحوب (إضافة المبلغ القديم وخصم المبلغ الجديد)
      investor.amount = investor.amount + oldAmount - newAmount;
      
      // تحديث ملخص اليوم
      dailySummary.totalInvestments = dailySummary.totalInvestments + oldAmount - newAmount;
      
      // تحديث المستثمر المحدد إذا كان هو نفسه
      if (selectedInvestor && selectedInvestor.id === investor.id) {
        selectedInvestor = investor;
      }
    }
  } else if (transaction.type === 'admin') {
    // تحديث ملخص اليوم (خصم المبلغ القديم وإضافة المبلغ الجديد)
    dailySummary.adminExpenses = dailySummary.adminExpenses - oldAmount + newAmount;
  }
  
  // تحديث بيانات المعاملة
  transactions[transactionIndex] = {
    ...transaction,
    amount: newAmount,
    date: newDate,
    notes: newNotes
  };
  
  // إعادة حساب الإشعارات
  calculateUpcomingPayments();
  
  // حفظ البيانات
  saveData();
  
  // عرض إشعار بنجاح العملية
  showNotification('تم تحديث المعاملة بنجاح', 'success');
  
  // إغلاق النافذة
  hideModal('edit-transaction-modal');
  
  // تحديث الواجهة حسب الصفحة الحالية
  if (currentPage === 'investorDetails' && selectedInvestor) {
    renderInvestorDetailsPage();
  } else if (currentPage === 'transactions') {
    renderTransactionsPage();
  } else if (currentPage === 'home') {
    renderHomePage();
  }
}

/**
 * تهيئة نظام إدارة المعاملات
 */
function initTransactionManagement() {
  // التأكد من وجود نوافذ التحقق والتعديل
  initAdminVerificationModal();
  
  // إضافة أزرار التحكم للمعاملات المعروضة في الصفحات المختلفة
  document.addEventListener('DOMContentLoaded', function() {
    enhanceTransactionsDisplay();
  });
  
  // إضافة مستمع للتغييرات في DOM لإضافة أزرار التحكم للعناصر الجديدة
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        enhanceTransactionsDisplay();
      }
    });
  });
  
  // بدء مراقبة التغييرات
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * تحسين عرض المعاملات بإضافة أزرار تعديل وحذف
 */
function enhanceTransactionsDisplay() {
  // تعديل دالة renderTransactionsPage
  if (typeof window.renderTransactionsPage === 'function' && !window.originalRenderTransactionsPage) {
    window.originalRenderTransactionsPage = window.renderTransactionsPage;
    window.renderTransactionsPage = function() {
      window.originalRenderTransactionsPage();
      addTransactionControls();
    };
  }
  
  // تعديل دالة renderInvestorDetailsPage
  if (typeof window.renderInvestorDetailsPage === 'function' && !window.originalRenderInvestorDetailsPage) {
    window.originalRenderInvestorDetailsPage = window.renderInvestorDetailsPage;
    window.renderInvestorDetailsPage = function() {
      window.originalRenderInvestorDetailsPage();
      addTransactionControls();
    };
  }
  
  // إضافة أزرار التحكم للمعاملات الموجودة حالياً في الصفحة
  addTransactionControls();
}

/**
 * إضافة أزرار تعديل وحذف للمعاملات المعروضة
 */
function addTransactionControls() {
  // البحث عن عناصر المعاملات في صفحة التفاصيل
  const investorTransactions = document.querySelectorAll('#investor-transactions .list-item');
  
  if (investorTransactions.length > 0) {
    investorTransactions.forEach((item, index) => {
      // التحقق من عدم وجود أزرار التحكم مسبقاً
      if (!item.querySelector('.transaction-controls')) {
        // الحصول على معرف المعاملة من البيانات
        const transaction = selectedInvestor ? 
          transactions.filter(t => t.investorId === selectedInvestor.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[index] : null;
        
        if (transaction) {
          // إنشاء أزرار التحكم
          const controlsDiv = document.createElement('div');
          controlsDiv.className = 'transaction-controls flex gap-2 mt-2';
          controlsDiv.innerHTML = `
            <button class="btn btn-sm btn-outline-primary transaction-edit-btn" data-id="${transaction.id}" title="تعديل المعاملة">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger transaction-delete-btn" data-id="${transaction.id}" title="حذف المعاملة">
              <i class="fas fa-trash"></i>
            </button>
          `;
          
          // إضافة الأزرار للعنصر
          item.appendChild(controlsDiv);
          
          // إضافة مستمعات الأحداث
          controlsDiv.querySelector('.transaction-edit-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            const transactionId = this.getAttribute('data-id');
            requestAdminVerificationForEdit(transactionId);
          });
          
          controlsDiv.querySelector('.transaction-delete-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            const transactionId = this.getAttribute('data-id');
            requestAdminVerificationForDelete(transactionId);
          });
        }
      }
    });
  }
  
  // البحث عن عناصر المعاملات في صفحة المعاملات
  const transactionItems = document.querySelectorAll('.transactions-container .transaction-item, .card .transaction-item');
  
  if (transactionItems.length > 0) {
    transactionItems.forEach((item, index) => {
      // التحقق من عدم وجود أزرار التحكم مسبقاً
      if (!item.querySelector('.transaction-controls')) {
        // الحصول على معرف المعاملة من البيانات
        const transaction = item.getAttribute('data-id') ? 
          transactions.find(t => t.id === item.getAttribute('data-id')) : 
          transactions.sort((a, b) => new Date(b.date) - new Date(a.date))[index];
        
        if (transaction) {
          // إنشاء أزرار التحكم
          const controlsDiv = document.createElement('div');
          controlsDiv.className = 'transaction-controls flex gap-2 mt-2';
          
          // وضع معرف المعاملة في العنصر
          item.setAttribute('data-id', transaction.id);
          
          controlsDiv.innerHTML = `
            <button class="btn btn-sm btn-outline-primary transaction-edit-btn" data-id="${transaction.id}" title="تعديل المعاملة">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger transaction-delete-btn" data-id="${transaction.id}" title="حذف المعاملة">
              <i class="fas fa-trash"></i>
            </button>
          `;
          
          // إضافة الأزرار للعنصر
          item.appendChild(controlsDiv);
          
          // إضافة مستمعات الأحداث
          controlsDiv.querySelector('.transaction-edit-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            const transactionId = this.getAttribute('data-id');
            requestAdminVerificationForEdit(transactionId);
          });
          
          controlsDiv.querySelector('.transaction-delete-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            const transactionId = this.getAttribute('data-id');
            requestAdminVerificationForDelete(transactionId);
          });
        }
      }
    });
  }
}

// تهيئة نظام إدارة المعاملات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // تهيئة نظام إدارة المعاملات
  initTransactionManagement();
  
  // إضافة مستمع لتحديثات الصفحة
  document.addEventListener('pageRendered', function() {
    addTransactionControls();
  });
});

// تعزيز صفحة المعاملات بإضافة معرفات للمعاملات وأزرار التحكم
function enhanceTransactionsPage() {
  // تعديل دالة renderTransactionsPage الأصلية لإضافة معرفات للمعاملات
  if (typeof window.renderTransactionsPage === 'function' && !window.originalRenderTransactionsPage) {
    window.originalRenderTransactionsPage = window.renderTransactionsPage;
    
    window.renderTransactionsPage = function() {
      // استدعاء الدالة الأصلية
      window.originalRenderTransactionsPage();
      
      // البحث عن جميع عناصر المعاملات وإضافة معرفات ومعلومات إضافية
      const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      const transactionItems = document.querySelectorAll('.transaction-item');
      
      transactionItems.forEach((item, index) => {
        if (index < sortedTransactions.length) {
          const transaction = sortedTransactions[index];
          
          // إضافة معرف المعاملة للعنصر
          item.setAttribute('data-id', transaction.id);
          
          // إضافة أزرار التحكم
          if (!item.querySelector('.transaction-controls')) {
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'transaction-controls flex justify-end gap-2 mt-2';
            
            controlsDiv.innerHTML = `
              <button class="btn btn-sm btn-outline-primary transaction-edit-btn" data-id="${transaction.id}" title="تعديل المعاملة">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger transaction-delete-btn" data-id="${transaction.id}" title="حذف المعاملة">
                <i class="fas fa-trash"></i>
              </button>
            `;
            
            item.appendChild(controlsDiv);
            
            // إضافة مستمعات الأحداث
            controlsDiv.querySelector('.transaction-edit-btn').addEventListener('click', function(e) {
              e.stopPropagation();
              const transactionId = this.getAttribute('data-id');
              requestAdminVerificationForEdit(transactionId);
            });
            
            controlsDiv.querySelector('.transaction-delete-btn').addEventListener('click', function(e) {
              e.stopPropagation();
              const transactionId = this.getAttribute('data-id');
              requestAdminVerificationForDelete(transactionId);
            });
          }
        }
      });
      
      // إرسال حدث لإبلاغ المكونات الأخرى بتحديث الصفحة
      document.dispatchEvent(new CustomEvent('pageRendered', { detail: { page: 'transactions' } }));
    };
  }
}

// تسجيل الدوال الجديدة في النافذة العالمية للوصول إليها من الشيفرة الأخرى
window.requestAdminVerificationForDelete = requestAdminVerificationForDelete;
window.requestAdminVerificationForEdit = requestAdminVerificationForEdit;
window.initTransactionManagement = initTransactionManagement;
window.addTransactionControls = addTransactionControls;
window.enhanceTransactionsPage = enhanceTransactionsPage;