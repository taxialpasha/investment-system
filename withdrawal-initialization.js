

// تهيئة نظام السحب عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة النوافذ المنبثقة للسحب إلى الصفحة
    addWithdrawalModals();
    
    // إضافة أنماط CSS الخاصة بالسحوبات
    addWithdrawalStyles();
    
    // دمج نظام السحب مع النظام الرئيسي
    setTimeout(integrateWithdrawalSystem, 500);
  });
  
  // إضافة النوافذ المنبثقة للسحب
  function addWithdrawalModals() {
    // التحقق من عدم وجود النوافذ سابقاً
    if (document.getElementById('withdrawal-modal')) {
      return;
    }
    
    // محتوى نافذة السحب الرئيسية
    const withdrawalModalHTML = `
      <!-- نافذة السحب من الاستثمار -->
      <div id="withdrawal-modal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title" id="withdrawal-modal-title">
              سحب من الاستثمار
            </h2>
            <button class="modal-close" id="close-withdrawal-modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">المستثمر*</label>
              <select 
                id="withdrawal-investor-id"
                class="w-full"
              >
                <option value="">اختر المستثمر</option>
                <!-- يتم إضافة الخيارات ديناميكيًا -->
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">المبلغ (د.ع)*</label>
              <input 
                type="number" 
                id="withdrawal-amount"
                class="w-full"
                placeholder="أدخل المبلغ"
              />
            </div>
            
            <!-- معلومات الرصيد المتاح ستظهر هنا -->
            
            <div class="form-group">
              <label class="form-label">تاريخ السحب</label>
              <input 
                type="date" 
                id="withdrawal-date"
                class="w-full"
              />
            </div>
            
            <div class="form-group">
              <div class="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  id="withdrawal-scheduled"
                />
                <label class="form-label m-0">جدولة السحب لتاريخ لاحق</label>
              </div>
              <div id="scheduled-date-container" class="hidden">
                <label class="form-label">تاريخ التنفيذ المجدول*</label>
                <input 
                  type="date" 
                  id="scheduled-withdrawal-date"
                  class="w-full"
                />
                <p class="text-xs text-gray-500 mt-1">سيتم تنفيذ السحب تلقائيًا عند حلول هذا التاريخ</p>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">ملاحظات</label>
              <textarea 
                id="withdrawal-notes"
                class="w-full"
                placeholder="أي ملاحظات إضافية"
                rows="2"
              ></textarea>
            </div>
          </div>
          
          <div class="modal-footer">
            <button 
              class="btn btn-gray"
              id="cancel-add-withdrawal"
            >
              إلغاء
            </button>
            <button 
              class="btn btn-danger"
              id="confirm-add-withdrawal"
            >
              تسجيل السحب
            </button>
          </div>
        </div>
      </div>
    `;
    
    // محتوى نافذة تعديل السحب المجدول
    const editWithdrawalModalHTML = `
      <!-- نافذة تعديل السحب المجدول -->
      <div id="edit-withdrawal-modal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title">
              تعديل سحب مجدول
            </h2>
            <button class="modal-close" id="close-edit-withdrawal-modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="card-blue-light p-3 rounded-lg mb-4">
              <div class="flex justify-between mb-1">
                <div>
                  <p class="font-medium">المستثمر</p>
                  <p id="edit-withdrawal-investor-name" class="font-bold">اسم المستثمر</p>
                </div>
                <div>
                  <p class="font-medium">الرصيد الحالي</p>
                  <p id="edit-withdrawal-balance" class="font-bold">0 د.ع</p>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">المبلغ (د.ع)*</label>
              <input 
                type="number" 
                id="edit-withdrawal-amount"
                class="w-full"
                placeholder="أدخل المبلغ"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">تاريخ السحب</label>
              <input 
                type="date" 
                id="edit-withdrawal-date"
                class="w-full"
                disabled
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">تاريخ التنفيذ المجدول*</label>
              <input 
                type="date" 
                id="edit-withdrawal-scheduled-date"
                class="w-full"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">ملاحظات</label>
              <textarea 
                id="edit-withdrawal-notes"
                class="w-full"
                placeholder="أي ملاحظات إضافية"
                rows="2"
              ></textarea>
            </div>
            
            <input type="hidden" id="edit-withdrawal-id" value="" />
          </div>
          
          <div class="modal-footer">
            <button 
              class="btn btn-gray"
              id="cancel-edit-withdrawal"
            >
              إلغاء
            </button>
            <button 
              class="btn btn-primary"
              id="confirm-edit-withdrawal"
            >
              حفظ التغييرات
            </button>
          </div>
        </div>
      </div>
    `;
    
    // إضافة النوافذ إلى الصفحة
    document.body.insertAdjacentHTML('beforeend', withdrawalModalHTML);
    document.body.insertAdjacentHTML('beforeend', editWithdrawalModalHTML);
  }
  
  // إضافة أنماط CSS الخاصة بالسحوبات
  function addWithdrawalStyles() {
    // التحقق من عدم وجود الأنماط سابقاً
    if (document.getElementById('withdrawal-styles')) {
      return;
    }
    
    // محتوى أنماط CSS
    const withdrawalStylesCSS = `
      /* أنماط للسحوبات */
      .scheduled-withdrawal-card {
        border-right: 4px solid var(--danger-color);
        background-color: rgba(239, 68, 68, 0.1);
      }
      
      /* بطاقة السحب في صفحة المستثمر */
      .withdrawal-transaction {
        border-right: 4px solid var(--danger-color);
      }
      
      /* تنسيق مبلغ السحب */
      .withdrawal-amount {
        color: var(--danger-color);
        font-weight: bold;
      }
      
      /* تنسيق حالة السحب */
      .withdrawal-status {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      
      /* جدولة السحب */
      #scheduled-date-container.show {
        display: block;
        animation: fadeIn 0.3s ease;
      }
      
      /* أنماط إضافية للسحوبات */
      .scheduled-withdrawal {
        border-right: 4px solid var(--danger-color);
        background-color: rgba(239, 68, 68, 0.1);
      }
      
      .notification-amount.amount-out {
        color: var(--danger-color);
      }
      
      .scheduled-withdrawal .notification-timeframe.urgent {
        color: var(--danger-color);
      }
      
      .withdrawal-icon {
        color: var(--danger-color);
      }
      
      /* للوضع الداكن */
      .dark-theme .scheduled-withdrawal {
        background-color: rgba(239, 68, 68, 0.2);
      }
    `;
    
    // إنشاء عنصر style
    const styleElement = document.createElement('style');
    styleElement.id = 'withdrawal-styles';
    styleElement.textContent = withdrawalStylesCSS;
    
    // إضافة عنصر style إلى الصفحة
    document.head.appendChild(styleElement);
  }
  
  