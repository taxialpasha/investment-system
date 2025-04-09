// أكواد التحكم بالنافذة
document.addEventListener('DOMContentLoaded', function() {
  // التأكد من وجود عناصر التحكم قبل إضافة المستمعين
  const minimizeBtn = document.getElementById('minimize-btn');
  const maximizeBtn = document.getElementById('maximize-btn');
  const closeBtn = document.getElementById('close-btn');
  const themeToggle = document.getElementById('toggle-theme');
  
  // إضافة مستمعين للأحداث لأزرار التحكم بالنافذة
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      window.electronAPI.minimizeWindow();
    });
  }
  
  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', () => {
      window.electronAPI.maximizeWindow().then(({ isMaximized }) => {
        // تحديث أيقونة الزر
        if (maximizeBtn.querySelector('i')) {
          maximizeBtn.querySelector('i').className = isMaximized 
            ? 'fas fa-compress' 
            : 'fas fa-expand';
        }
      });
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.electronAPI.closeWindow();
    });
  }
  
  // التحكم بالسمة
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      toggleTheme();
    });
    
    // الاستماع لتغييرات السمة من النظام
    if (window.electronAPI && window.electronAPI.onThemeUpdate) {
      window.electronAPI.onThemeUpdate((isDark) => {
        document.body.classList.toggle('dark-theme', isDark);
        updateThemeIcon(isDark);
      });
    }
  }
  
  // تحديث أيقونة السمة
  function updateThemeIcon(isDark) {
    if (!themeToggle) return;
    
    const themeIcon = themeToggle.querySelector('i');
    if (themeIcon) {
      if (isDark) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
      }
    }
  }
  
  // تبديل السمة
  function toggleTheme() {
    const isDarkTheme = document.body.classList.contains('dark-theme');
    const newTheme = !isDarkTheme;
    
    if (window.electronAPI && window.electronAPI.toggleTheme) {
      window.electronAPI.toggleTheme(newTheme).then(({ isDark }) => {
        document.body.classList.toggle('dark-theme', isDark);
        updateThemeIcon(isDark);
      });
    } else {
      // بديل إذا لم تكن واجهة برمجة التطبيقات متاحة
      document.body.classList.toggle('dark-theme', newTheme);
      updateThemeIcon(newTheme);
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    }
  }
  
  // إضافة فئة انتقال الصفحة لعناصر المحتوى
  function addPageTransitions() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.add('page-transition');
    }
  }
  
  // إضافة تأثيرات انتقال للصفحات
  const navButtons = document.querySelectorAll('.nav-item, .header-icon, .dropdown-item');
  navButtons.forEach(button => {
    if (button) {
      button.addEventListener('click', () => {
        setTimeout(addPageTransitions, 50);
      });
    }
  });
});