// استيراد الوحدات الأخرى
import * as Data from './data.js';

// تحويل الأرقام إلى تنسيق مقروء مع فواصل
function numberWithCommas(x) {
    return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// حساب الربح الشهري للمستثمر
function calculateMonthlyProfit(amount, profitRate) {
    return (amount / 1000000) * profitRate * 1000;
}

// الحصول على عدد معاملات الدفع
function getPayoutTransactionsCount(transactions) {
    return transactions.filter(t => t.type === 'payout').length;
}

// الحصول على عدد المصروفات الإدارية
function getAdminExpensesCount(transactions) {
    return transactions.filter(t => t.type === 'admin').length;
}

// الحصول على أيقونة المعاملة حسب النوع
function getTransactionIcon(type) {
    switch (type) {
        case 'investment':
            return 'fa-coins';
        case 'payout':
            return 'fa-hand-holding-usd';
        case 'admin':
            return 'fa-file-invoice-dollar';
        default:
            return 'fa-exchange-alt';
    }
}

// الحصول على فئة اللون للمعاملة
function getTransactionColorClass(type) {
    switch (type) {
        case 'investment':
            return 'text-blue-600';
        case 'payout':
            return 'text-red-600';
        case 'admin':
            return 'text-red-600';
        default:
            return 'text-gray-500';
    }
}

// الحصول على فئة الشارة للمعاملة
function getTransactionBadgeClass(type) {
    switch (type) {
        case 'investment':
            return 'badge-primary';
        case 'payout':
            return 'badge-red';
        case 'admin':
            return 'badge-red';
        default:
            return 'badge-gray';
    }
}

// الحصول على اسم المعاملة بالعربية
function getTransactionTypeName(type) {
    switch (type) {
        case 'investment':
            return 'استثمار';
        case 'payout':
            return 'ربح';
        case 'admin':
            return 'مصروف إداري';
        default:
            return type;
    }
}

// تنسيق التاريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
}

// الحصول على اسم الشهر الحالي
function getCurrentMonthName() {
    const months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    return months[new Date().getMonth()];
}

// الحصول على التاريخ الحالي بتنسيق YYYY-MM-DD
function getCurrentDate() {
    const now = new Date();
    return now.toISOString().substr(0, 10);
}

// تصدير الوظائف
export {
    numberWithCommas,
    calculateMonthlyProfit,
    getPayoutTransactionsCount,
    getAdminExpensesCount,
    getTransactionIcon,
    getTransactionColorClass,
    getTransactionBadgeClass,
    getTransactionTypeName,
    formatDate,
    getCurrentMonthName,
    getCurrentDate
};