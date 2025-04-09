/**
 * ملف وظائف القائمة الجانبية للمستثمرين
 * يحتوي على جميع الوظائف المتعلقة بعرض وإدارة القائمة الجانبية
 */

// دالة تهيئة القائمة الجانبية
function initSidebar() {
    console.log('تهيئة القائمة الجانبية...');
    
    // إضافة مستمعات الأحداث للأزرار
    attachSidebarEventListeners();
    
    // تحديث قائمة المستثمرين
    updateSidebarInvestorsList();
  }
  
  // ربط مستمعات الأحداث بأزرار القائمة الجانبية
  function attachSidebarEventListeners() {
    // زر إضافة مستثمر جديد
    const addInvestorBtn = document.getElementById('add-investor-sidebar');
    if (addInvestorBtn) {
      // إزالة مستمعات الأحداث السابقة لتجنب التكرار
      const newAddInvestorBtn = addInvestorBtn.cloneNode(true);
      addInvestorBtn.parentNode.replaceChild(newAddInvestorBtn, addInvestorBtn);
      
      // إضافة مستمع حدث جديد
      newAddInvestorBtn.addEventListener('click', function() {
        console.log('تم النقر على زر إضافة مستثمر من القائمة الجانبية');
        showAddInvestorModal();
      });
    }
    
    // زر عرض جميع المستثمرين
    const viewAllInvestorsBtn = document.getElementById('view-all-investors');
    if (viewAllInvestorsBtn) {
      // إزالة مستمعات الأحداث السابقة
      const newViewAllInvestorsBtn = viewAllInvestorsBtn.cloneNode(true);
      viewAllInvestorsBtn.parentNode.replaceChild(newViewAllInvestorsBtn, viewAllInvestorsBtn);
      
      // إضافة مستمع حدث جديد
      newViewAllInvestorsBtn.addEventListener('click', function() {
        console.log('تم النقر على زر عرض جميع المستثمرين');
        navigateTo('investors');
      });
    }
  }
  
  // تحديث قائمة المستثمرين في القائمة الجانبية
  function updateSidebarInvestorsList() {
    const investorsContainer = document.getElementById('sidebar-investors-container');
    if (!investorsContainer) return;
    
    // مسح المحتوى الحالي
    investorsContainer.innerHTML = '';
    
    // التحقق من وجود مستثمرين للعرض
    if (investors && investors.length > 0) {
      // ترتيب المستثمرين حسب المبلغ (تنازلياً)
      const topInvestors = [...investors]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6); // الحصول على أعلى 6 مستثمرين
        
      // إنشاء عناصر المستثمرين
      topInvestors.forEach((investor, index) => {
        const monthlyProfit = calculateMonthlyProfit(investor.amount);
        
        const investorElement = document.createElement('div');
        investorElement.className = `investor-card ${index === 0 ? 'top-investor' : ''}`;
        investorElement.setAttribute('data-id', investor.id);
        
        investorElement.innerHTML = `
          <div class="investor-rank">${index + 1}</div>
          <div class="investor-info">
            <div class="investor-name">${investor.name}</div>
            <div class="investor-amount">${numberWithCommas(investor.amount)} د.ع</div>
            <div class="investor-profit">${numberWithCommas(monthlyProfit)} د.ع <span>شهرياً</span></div>
          </div>
          <div class="investor-actions">
            <button class="btn-icon view-investor" title="عرض التفاصيل">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        `;
        
        // إضافة مستمع حدث النقر
        investorElement.addEventListener('click', function() {
          const investorId = this.getAttribute('data-id');
          const selectedInvestor = investors.find(inv => inv.id === investorId);
          if (selectedInvestor) {
            viewInvestorDetails(selectedInvestor);
          }
        });
        
        investorsContainer.appendChild(investorElement);
      });
    } else {
      // عرض رسالة عندما لا يوجد مستثمرين
      const noInvestorsElement = document.createElement('div');
      noInvestorsElement.className = 'no-investors';
      noInvestorsElement.innerHTML = `
        <i class="fas fa-users text-gray-400"></i>
        <p>لا يوجد مستثمرين حالياً</p>
        <button class="btn btn-primary btn-sm" id="add-first-investor">
          <i class="fas fa-user-plus ml-1"></i> إضافة مستثمر
        </button>
      `;
      
      investorsContainer.appendChild(noInvestorsElement);
      
      // إضافة مستمع حدث لزر إضافة المستثمر الأول
      const addFirstInvestorBtn = document.getElementById('add-first-investor');
      if (addFirstInvestorBtn) {
        addFirstInvestorBtn.addEventListener('click', showAddInvestorModal);
      }
    }
  }
  
  // إعادة تحميل القائمة الجانبية عند تغيير البيانات
  function reloadSidebar() {
    updateSidebarInvestorsList();
  }
  
  // تصدير الدوال للاستخدام الخارجي
  window.initSidebar = initSidebar;
  window.reloadSidebar = reloadSidebar;
  
  // تهيئة القائمة الجانبية عند تحميل الصفحة
  document.addEventListener('DOMContentLoaded', function() {
    // تهيئة القائمة الجانبية بعد تحميل الصفحة
    setTimeout(initSidebar, 100);
    
    // إعادة تحميل القائمة الجانبية عند تغيير البيانات
    // يمكن استدعاء هذه الدالة بعد إضافة أو تعديل أو حذف مستثمر
    document.addEventListener('investorsUpdated', function() {
      reloadSidebar();
    });
  });
  
  // حدث مخصص يمكن إطلاقه عند تحديث بيانات المستثمرين
  function triggerInvestorsUpdated() {
    const event = new CustomEvent('investorsUpdated');
    document.dispatchEvent(event);
  }