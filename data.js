// ...existing code...
// استيراد الوحدات الأخرى
import * as UI from './ui.js';
import * as Utils from './utils.js';

// بيانات التطبيق
let investors = [];
let transactions = [];
let profitRate = 17.5;
let dailySummary = {
    totalInvestments: 0,
    totalPayouts: 0,
    adminExpenses: 0
};
let notifications = [];

// تحميل البيانات من التخزين المحلي
function loadData() {
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
            UI.showNotification('حدث خطأ أثناء تحميل البيانات المحفوظة', 'error');
        }
    }
    
    // حساب الإشعارات
    calculateUpcomingPayments();
}

// حفظ البيانات في التخزين المحلي
function saveData() {
    const data = {
        investors,
        transactions,
        profitRate
    };
    
    localStorage.setItem('investmentAppData', JSON.stringify(data));
}

// تصدير البيانات
function exportData() {
    const data = {
        investors,
        transactions,
        profitRate,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `investment_backup_${Utils.getCurrentDate()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    UI.showNotification('تم تصدير البيانات بنجاح', 'success');
}

// استيراد البيانات
function importData(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (data.investors && data.transactions && data.profitRate) {
                investors = data.investors;
                transactions = data.transactions;
                profitRate = data.profitRate;
                
                // إعادة حساب ملخص البيانات
                recalculateSummary();
                
                // إعادة حساب الإشعارات
                calculateUpcomingPayments();
                
                // حفظ البيانات
                saveData();
                
                UI.showNotification('تم استيراد البيانات بنجاح', 'success');
                // تحديث الواجهة
                // تم استخدام import.meta.url لجلب الوحدة main
                import('./main.js').then(main => {
                    main.navigateTo(main.currentPage);
                });
            } else {
                UI.showNotification('الملف غير صالح', 'error');
            }
        } catch (error) {
            UI.showNotification('خطأ في قراءة الملف', 'error');
        }
    };
    reader.readAsText(file);
}

// إعادة تعيين البيانات
function resetData() {
    investors = [];
    transactions = [];
    profitRate = 17.5;
    dailySummary = {
        totalInvestments: 0,
        totalPayouts: 0,
        adminExpenses: 0
    };
    notifications = [];
    
    // حفظ البيانات
    saveData();
    
    UI.showNotification('تم إعادة تعيين البيانات بنجاح', 'success');
    
    // تم استخدام import.meta.url لجلب الوحدة main
    import('./main.js').then(main => {
        main.navigateTo('home');
    });
}

// إعادة حساب ملخص البيانات
function recalculateSummary() {
    dailySummary = {
        totalInvestments: 0,
        totalPayouts: 0,
        adminExpenses: 0
    };
    
    for (const trans of transactions) {
        if (trans.type === 'investment') {
            dailySummary.totalInvestments += trans.amount;
        } else if (trans.type === 'payout') {
            dailySummary.totalPayouts += trans.amount;
        } else if (trans.type === 'admin') {
            dailySummary.adminExpenses += trans.amount;
        }
    }
}

// حساب الإشعارات (المدفوعات القادمة)
function calculateUpcomingPayments() {
    const today = new Date();
    const upcomingPayments = [];
    
    investors.forEach(investor => {
        const startDate = new Date(investor.startDate);
        const nextPaymentDate = new Date(startDate);
        
        // تحديد تاريخ الدفعة القادمة
        while (nextPaymentDate <= today) {
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }
        
        // إذا كانت الدفعة القادمة خلال الأسبوع القادم
        const daysUntilPayment = Math.floor((nextPaymentDate - today) / (1000 * 60 * 60 * 24));
        if (daysUntilPayment <= 7) {
            // حساب المبلغ المستحق
            const monthlyProfit = Utils.calculateMonthlyProfit(investor.amount, profitRate);
            
            upcomingPayments.push({
                id: investor.id,
                name: investor.name,
                date: nextPaymentDate.toISOString().substr(0, 10),
                amount: monthlyProfit,
                daysLeft: daysUntilPayment
            });
        }
    });
    
    notifications = upcomingPayments;
}

// تصدير المتغيرات والوظائف
export {
    investors,
    transactions,
    profitRate,
    dailySummary,
    notifications,
    loadData,
    saveData,
    exportData,
    importData,
    resetData,
    recalculateSummary,
    calculateUpcomingPayments
};