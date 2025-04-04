// ...existing code...
// استيراد الوحدات الأخرى
import * as UI from './ui.js';
import * as Data from './data.js';
import * as Investors from './investors.js';
import * as Transactions from './transactions.js';
import * as Reports from './reports.js';
import * as Utils from './utils.js';

// المتغيرات العامة
let currentPage = 'home';
let selectedInvestor = null;
let isDarkTheme = false;

// وظيفة تهيئة التطبيق
function initApp() {
    // تحميل السمة المفضلة
    loadTheme();
    
    // تحميل البيانات
    Data.loadData();
    
    // تهيئة مستمعي الأحداث للقائمة
    initNavigationListeners();
    
    // مستمعات أحداث أخرى
    initOtherListeners();
    
    // عرض الصفحة الرئيسية
    navigateTo('home');
}

// وظائف التنقل
function navigateTo(page) {
    currentPage = page;
    updateNavigation();
    
    switch (page) {
        case 'home':
            UI.renderHomePage();
            break;
        case 'investors':
            Investors.renderInvestorsPage();
            break;
        case 'investorDetails':
            Investors.renderInvestorDetailsPage();
            break;
        case 'transactions':
            Transactions.renderTransactionsPage();
            break;
        case 'reports':
            Reports.renderReportsPage();
            break;
        case 'settings':
            UI.renderSettingsPage();
            break;
        default:
            UI.renderHomePage();
    }
}

// مستمعي أحداث التنقل
function initNavigationListeners() {
    document.getElementById('nav-home').addEventListener('click', () => navigateTo('home'));
    document.getElementById('nav-investors').addEventListener('click', () => {
        selectedInvestor = null;
        navigateTo('investors');
    });
    document.getElementById('nav-transactions').addEventListener('click', () => navigateTo('transactions'));
    document.getElementById('nav-reports').addEventListener('click', () => navigateTo('reports'));
    document.getElementById('nav-settings').addEventListener('click', () => navigateTo('settings'));
}

// تحديث عناصر التنقل
function updateNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    let activeNavId;
    
    switch (currentPage) {
        case 'home':
            activeNavId = 'nav-home';
            break;
        case 'investors':
        case 'investorDetails':
            activeNavId = 'nav-investors';
            break;
        case 'transactions':
            activeNavId = 'nav-transactions';
            break;
        case 'reports':
            activeNavId = 'nav-reports';
            break;
        case 'settings':
            activeNavId = 'nav-settings';
            break;
    }
    
    if (activeNavId) {
        document.getElementById(activeNavId).classList.add('active');
    }
}

// مستمعات أحداث أخرى
function initOtherListeners() {
    // مستمعي رأس الصفحة
    document.getElementById('toggle-theme').addEventListener('click', UI.toggleTheme);
    document.getElementById('refresh-data').addEventListener('click', () => {
        navigateTo(currentPage);
        UI.showNotification('تم تحديث البيانات', 'success');
    });
    
    // القائمة المنسدلة
    document.getElementById('quick-actions').addEventListener('click', (e) => {
        e.stopPropagation();
        UI.toggleDropdown();
    });
    
    // إخفاء القائمة المنسدلة عند النقر خارجها
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('actions-dropdown');
        if (dropdown && dropdown.classList.contains('show') && !e.target.closest('#quick-actions')) {
            dropdown.classList.remove('show');
        }
    });
    
    // مستمعات القائمة المنسدلة
    initDropdownListeners();
    
    // زر الإجراء العائم
    document.getElementById('floating-action').addEventListener('click', handleFloatingAction);
    
    // زر حفظ ملف
    window.addEventListener('beforeunload', Data.saveData);
}

// مستمعات القائمة المنسدلة
function initDropdownListeners() {
    document.getElementById('new-investor-dropdown').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('actions-dropdown').classList.remove('show');
        Investors.showAddInvestorModal();
    });
    
    document.getElementById('new-transaction-dropdown').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('actions-dropdown').classList.remove('show');
        Transactions.showAddTransactionModal('investment');
    });
    
    document.getElementById('calc-profits-dropdown').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('actions-dropdown').classList.remove('show');
        Reports.showProfitCalculator();
    });
    
    document.getElementById('export-data-dropdown').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('actions-dropdown').classList.remove('show');
        Data.exportData();
    });
    
    document.getElementById('import-data-dropdown').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('actions-dropdown').classList.remove('show');
        document.getElementById('import-data-input').click();
    });
}

// معالجة زر الإجراء العائم
function handleFloatingAction() {
    if (currentPage === 'investors') {
        Investors.showAddInvestorModal();
    } else if (currentPage === 'transactions') {
        Transactions.showAddTransactionModal('investment');
    } else if (currentPage === 'investorDetails' && selectedInvestor) {
        Transactions.showAddTransactionModal('investment', selectedInvestor);
    } else {
        Investors.showAddInvestorModal();
    }
}

// تحميل السمة المفضلة
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        isDarkTheme = true;
        document.body.classList.add('dark-theme');
        const themeIcon = document.getElementById('toggle-theme').querySelector('i');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);

// تصدير الوظائف والمتغيرات للوحدات الأخرى
export {
    currentPage,
    selectedInvestor,
    isDarkTheme,
    navigateTo,
    updateNavigation
};