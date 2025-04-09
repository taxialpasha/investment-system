// أدوات تشخيص وتصحيح الأخطاء للنظام
// قم بإضافة هذا الملف أو تضمينه في نهاية index.html

// الألوان المستخدمة في وحدة التحكم
const DEBUG_COLORS = {
    error: '#FF5252',
    warn: '#FFC107',
    info: '#2196F3',
    success: '#4CAF50',
    auth: '#9C27B0',
    system: '#FF9800'
  };
  
  // كائن التصحيح الرئيسي
  const SystemDebugger = {
    // مستوى التصحيح (1 = أساسي، 2 = متوسط، 3 = مفصل)
    level: 3,
    
    // تسجيل رسالة خطأ
    error: function(message, data = null) {
      console.error(`%c❌ خطأ: ${message}`, `color: ${DEBUG_COLORS.error}; font-weight: bold;`);
      if (data && this.level >= 2) console.error(data);
      this._saveLog('error', message, data);
    },
    
    // تسجيل تحذير
    warn: function(message, data = null) {
      console.warn(`%c⚠️ تحذير: ${message}`, `color: ${DEBUG_COLORS.warn}; font-weight: bold;`);
      if (data && this.level >= 2) console.warn(data);
      this._saveLog('warn', message, data);
    },
    
    // تسجيل معلومات
    info: function(message, data = null) {
      console.info(`%cℹ️ معلومات: ${message}`, `color: ${DEBUG_COLORS.info};`);
      if (data && this.level >= 3) console.info(data);
      this._saveLog('info', message, data);
    },
    
    // تسجيل نجاح
    success: function(message, data = null) {
      console.log(`%c✅ نجاح: ${message}`, `color: ${DEBUG_COLORS.success}; font-weight: bold;`);
      if (data && this.level >= 2) console.log(data);
      this._saveLog('success', message, data);
    },
    
    // تسجيل رسائل المصادقة
    auth: function(message, data = null) {
      console.log(`%c🔐 مصادقة: ${message}`, `color: ${DEBUG_COLORS.auth}; font-weight: bold;`);
      if (data && this.level >= 2) console.log(data);
      this._saveLog('auth', message, data);
    },
    
    // تسجيل حالة النظام
    system: function(message, data = null) {
      console.log(`%c🔧 النظام: ${message}`, `color: ${DEBUG_COLORS.system}; font-weight: bold;`);
      if (data && this.level >= 2) console.log(data);
      this._saveLog('system', message, data);
    },
    
    // عرض حالة النظام
    dumpSystemState: function() {
      console.group('%c📊 حالة النظام', 'font-size: 14px; font-weight: bold; color: #2196F3;');
      
      try {
        // عرض معلومات المستخدمين
        const savedUsers = localStorage.getItem('investmentAppUsers');
        const users = savedUsers ? JSON.parse(savedUsers) : [];
        console.log('%c👥 المستخدمون:', 'font-weight: bold;');
        console.table(users.map(u => ({
          اسم_المستخدم: u.username,
          كلمة_المرور: u.password,
          الاسم_الكامل: u.fullName || '-',
          نوع_الحساب: u.isAdmin ? 'مدير' : 'مستخدم عادي',
          تاريخ_الإنشاء: u.createdAt,
          آخر_دخول: u.lastLogin || '-'
        })));
        
        // عرض معلومات الجلسة الحالية
        const savedSession = localStorage.getItem('investmentAppCurrentSession');
        console.log('%c🔐 الجلسة الحالية:', 'font-weight: bold;');
        if (savedSession) {
          const session = JSON.parse(savedSession);
          console.table([{
            اسم_المستخدم: session.username,
            وقت_الدخول: session.loginTime,
            المدة: this._getTimeDifference(new Date(session.loginTime), new Date())
          }]);
        } else {
          console.log('لا توجد جلسة نشطة');
        }
        
        // عرض متغيرات النظام إذا كانت متاحة
        if (typeof currentUser !== 'undefined') {
          console.log('%c🔄 متغيرات النظام:', 'font-weight: bold;');
          console.log('currentUser:', currentUser);
          console.log('isAuthenticated:', isAuthenticated);
          console.log('loginTime:', loginTime);
        }
        
        // عرض حالة عناصر واجهة المستخدم
        this._checkUIElements();
        
      } catch (e) {
        console.error('حدث خطأ أثناء عرض حالة النظام:', e);
      }
      
      console.groupEnd();
    },
    
    // فحص عناصر واجهة المستخدم المهمة
    _checkUIElements: function() {
      console.log('%c🖥️ عناصر واجهة المستخدم:', 'font-weight: bold;');
      
      const elementsToCheck = [
        'login-modal', 'login-username', 'login-password', 'login-btn',
        'lock-screen-overlay', 'unlock-password', 'unlock-btn', 'unlock-error',
        'header-user-info'
      ];
      
      const results = {};
      
      elementsToCheck.forEach(id => {
        const element = document.getElementById(id);
        results[id] = {
          موجود: !!element,
          مرئي: element ? !this._isHidden(element) : false,
          نوع: element ? element.tagName : null
        };
      });
      
      console.table(results);
    },
    
    // حساب الفرق الزمني بصيغة مقروءة
    _getTimeDifference: function(startDate, endDate) {
      const diff = Math.floor((endDate - startDate) / 1000);
      
      if (diff < 60) return `${diff} ثانية`;
      if (diff < 3600) return `${Math.floor(diff / 60)} دقيقة`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} ساعة`;
      return `${Math.floor(diff / 86400)} يوم`;
    },
    
    // التحقق مما إذا كان العنصر مخفيًا
    _isHidden: function(el) {
      return (el.offsetParent === null);
    },
    
    // تخزين السجلات
    _saveLog: function(type, message, data) {
      const logs = JSON.parse(localStorage.getItem('systemDebugLogs') || '[]');
      logs.push({
        time: new Date().toISOString(),
        type,
        message,
        data: data ? JSON.stringify(data) : null
      });
      
      // الاحتفاظ بآخر 100 سجل فقط
      if (logs.length > 100) logs.shift();
      localStorage.setItem('systemDebugLogs', JSON.stringify(logs));
    },
    
    // طباعة السجلات المخزنة
    showLogs: function() {
      const logs = JSON.parse(localStorage.getItem('systemDebugLogs') || '[]');
      
      console.group('%c📜 سجلات النظام', 'font-size: 14px; font-weight: bold; color: #2196F3;');
      
      if (logs.length === 0) {
        console.log('لا توجد سجلات');
      } else {
        logs.forEach(log => {
          const time = new Date(log.time).toLocaleTimeString();
          let color = DEBUG_COLORS[log.type] || '#000';
          
          console.log(`%c[${time}] ${log.type}: ${log.message}`, `color: ${color};`);
          if (log.data) {
            try {
              console.log(JSON.parse(log.data));
            } catch {
              console.log(log.data);
            }
          }
        });
      }
      
      console.groupEnd();
    },
    
    // مسح السجلات
    clearLogs: function() {
      localStorage.removeItem('systemDebugLogs');
      console.log('%c🧹 تم مسح جميع السجلات', `color: ${DEBUG_COLORS.success};`);
    },
    
    // اختبار وظائف المصادقة
    testAuth: function() {
      console.group('%c🔍 اختبار وظائف المصادقة', 'font-size: 14px; font-weight: bold; color: #9C27B0;');
      
      try {
        // اختبار وجود وظائف المصادقة
        const authFunctions = [
          { name: 'loginUser', exists: typeof loginUser === 'function' },
          { name: 'logoutUser', exists: typeof logoutUser === 'function' },
          { name: 'lockScreen', exists: typeof lockScreen === 'function' },
          { name: 'unlockScreen', exists: typeof unlockScreen === 'function' },
          { name: 'showLoginModal', exists: typeof showLoginModal === 'function' },
          { name: 'checkAuthenticationAndRedirect', exists: typeof checkAuthenticationAndRedirect === 'function' }
        ];
        
        console.log('%c⚙️ وظائف المصادقة:', 'font-weight: bold;');
        console.table(authFunctions);
        
        // اختبار حالة المصادقة
        if (typeof isAuthenticated !== 'undefined' && typeof currentUser !== 'undefined') {
          console.log('%c👤 حالة المصادقة الحالية:', 'font-weight: bold;');
          console.log('- مصادق:', isAuthenticated);
          console.log('- المستخدم الحالي:', currentUser);
        } else {
          console.warn('متغيرات حالة المصادقة غير متاحة');
        }
        
        // اختبار وظائف التخزين المحلي
        console.log('%c💾 وظائف التخزين المحلي:', 'font-weight: bold;');
        [
          'investmentAppUsers',
          'investmentAppCurrentSession'
        ].forEach(key => {
          const value = localStorage.getItem(key);
          console.log(`- ${key}: ${value ? '✅ موجود' : '❌ غير موجود'}`);
        });
        
      } catch (e) {
        console.error('حدث خطأ أثناء اختبار وظائف المصادقة:', e);
      }
      
      console.groupEnd();
    },
    
    // اختبار شاشة القفل
    testLockScreen: function() {
      console.group('%c🔒 اختبار شاشة القفل', 'font-size: 14px; font-weight: bold; color: #FF9800;');
      
      try {
        const lockScreenOverlay = document.getElementById('lock-screen-overlay');
        const unlockPassword = document.getElementById('unlock-password');
        const unlockBtn = document.getElementById('unlock-btn');
        const unlockError = document.getElementById('unlock-error');
        
        console.log('%c🔍 عناصر شاشة القفل:', 'font-weight: bold;');
        console.log('- شاشة القفل:', lockScreenOverlay ? '✅ موجودة' : '❌ غير موجودة');
        console.log('- حقل كلمة المرور:', unlockPassword ? '✅ موجود' : '❌ غير موجود');
        console.log('- زر فتح القفل:', unlockBtn ? '✅ موجود' : '❌ غير موجود');
        console.log('- رسالة الخطأ:', unlockError ? '✅ موجودة' : '❌ غير موجودة');
        
        if (lockScreenOverlay) {
          console.log('- حالة الظهور:', this._isHidden(lockScreenOverlay) ? 'مخفية' : 'ظاهرة');
          console.log('- الفئات:', lockScreenOverlay.className);
        }
        
        // عرض مستمعات الأحداث إذا أمكن (مدعوم في بعض المتصفحات فقط)
        if (unlockBtn && getEventListeners) {
          const listeners = getEventListeners(unlockBtn);
          console.log('- مستمعات زر فتح القفل:', listeners);
        }
        
        // نصائح وإرشادات
        console.log('%c💡 نصائح لإصلاح مشاكل شاشة القفل:', 'font-weight: bold;');
        console.log('1. تأكد من وجود جميع العناصر في HTML');
        console.log('2. تأكد من تعيين مستمعات الأحداث بشكل صحيح');
        console.log('3. تأكد من أن كلمة المرور المدخلة تتطابق مع كلمة مرور المستخدم الحالي');
        console.log('4. تأكد من عدم وجود أخطاء في دالة unlockScreen()');
        
      } catch (e) {
        console.error('حدث خطأ أثناء اختبار شاشة القفل:', e);
      }
      
      console.groupEnd();
    },
    
    // التعليمات
    help: function() {
      console.group('%c📚 تعليمات أدوات التشخيص', 'font-size: 14px; font-weight: bold; color: #4CAF50;');
      
      console.log(`%cSystemDebugger.error(message, data)`, `color: ${DEBUG_COLORS.error}; font-weight: bold;`);
      console.log('  تسجيل رسالة خطأ');
      
      console.log(`%cSystemDebugger.warn(message, data)`, `color: ${DEBUG_COLORS.warn}; font-weight: bold;`);
      console.log('  تسجيل تحذير');
      
      console.log(`%cSystemDebugger.info(message, data)`, `color: ${DEBUG_COLORS.info}; font-weight: bold;`);
      console.log('  تسجيل معلومات');
      
      console.log(`%cSystemDebugger.success(message, data)`, `color: ${DEBUG_COLORS.success}; font-weight: bold;`);
      console.log('  تسجيل نجاح');
      
      console.log(`%cSystemDebugger.auth(message, data)`, `color: ${DEBUG_COLORS.auth}; font-weight: bold;`);
      console.log('  تسجيل رسائل المصادقة');
      
      console.log(`%cSystemDebugger.system(message, data)`, `color: ${DEBUG_COLORS.system}; font-weight: bold;`);
      console.log('  تسجيل حالة النظام');
      
      console.log('%cSystemDebugger.dumpSystemState()', 'font-weight: bold;');
      console.log('  عرض حالة النظام الحالية');
      
      console.log('%cSystemDebugger.showLogs()', 'font-weight: bold;');
      console.log('  عرض سجلات التشخيص المخزنة');
      
      console.log('%cSystemDebugger.clearLogs()', 'font-weight: bold;');
      console.log('  مسح سجلات التشخيص المخزنة');
      
      console.log('%cSystemDebugger.testAuth()', 'font-weight: bold;');
      console.log('  اختبار وظائف المصادقة');
      
      console.log('%cSystemDebugger.testLockScreen()', 'font-weight: bold;');
      console.log('  اختبار شاشة القفل');
      
      console.groupEnd();
    }
  };
  
  // تسجيل الدخول المعدل مع تسجيل الأخطاء
  function enhancedLoginUser() {
    SystemDebugger.auth("بدء محاولة تسجيل الدخول");
    
    const usernameField = document.getElementById('login-username');
    const passwordField = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');
    
    if (!usernameField || !passwordField || !loginError) {
      SystemDebugger.error("عناصر نموذج تسجيل الدخول غير متوفرة");
      return;
    }
    
    const username = usernameField.value.trim();
    const password = passwordField.value;
    
    SystemDebugger.auth(`محاولة تسجيل الدخول باسم المستخدم: ${username}`);
    
    // التحقق من وجود المستخدم
    const foundUser = users.find(u => u.username === username);
    
    if (!foundUser) {
      SystemDebugger.warn(`لم يتم العثور على مستخدم باسم: ${username}`);
      loginError.classList.remove('hidden');
      return;
    }
    
    // التحقق من كلمة المرور
    if (foundUser.password !== password) {
      SystemDebugger.warn(`كلمة المرور غير صحيحة لـ ${username}`);
      SystemDebugger.info(`كلمة المرور المتوقعة: ${foundUser.password}, الكلمة المدخلة: ${password}`);
      loginError.classList.remove('hidden');
      return;
    }
    
    // تسجيل دخول المستخدم
    currentUser = foundUser;
    isAuthenticated = true;
    loginTime = new Date();
    
    SystemDebugger.auth(`تم تسجيل الدخول بنجاح للمستخدم: ${foundUser.username}`);
    
    // تحديث وقت آخر تسجيل دخول
    foundUser.lastLogin = loginTime.toISOString();
    saveUsers();
    
    // حفظ الجلسة في التخزين المحلي
    saveSession(foundUser);
    
    // إغلاق نافذة تسجيل الدخول
    hideModal('login-modal');
    
    // إظهار رسالة ترحيب
    showNotification(`مرحباً ${foundUser.fullName || foundUser.username}، تم تسجيل الدخول بنجاح`, 'success');
    
    // تحديث واجهة المستخدم
    updateUIForLoggedInUser();
    
    // تحديث صفحة الواجهة الحالية
    navigateTo(currentPage);
  }
  
  // فتح القفل المعدل مع تسجيل الأخطاء
  function enhancedUnlockScreen() {
    SystemDebugger.auth("بدء محاولة فتح القفل");
    
    const unlockPassword = document.getElementById('unlock-password');
    const unlockError = document.getElementById('unlock-error');
    const lockScreenOverlay = document.getElementById('lock-screen-overlay');
    
    if (!unlockPassword || !unlockError || !lockScreenOverlay) {
      SystemDebugger.error("عناصر شاشة القفل غير متوفرة", {
        unlockPassword: !!unlockPassword,
        unlockError: !!unlockError,
        lockScreenOverlay: !!lockScreenOverlay
      });
      return;
    }
    
    const passwordValue = unlockPassword.value;
    
    // التحقق من وجود مستخدم
    if (!currentUser) {
      SystemDebugger.error("لا يوجد مستخدم حالي - لا يمكن فتح القفل");
      unlockError.classList.remove('hidden');
      return;
    }
    
    SystemDebugger.auth(`محاولة فتح القفل للمستخدم: ${currentUser.username}`);
    SystemDebugger.info(`كلمة المرور المدخلة: ${passwordValue}, كلمة المرور المتوقعة: ${currentUser.password}`);
    
    // التحقق من كلمة المرور
    if (passwordValue === currentUser.password) {
      SystemDebugger.success(`تم فتح القفل بنجاح للمستخدم: ${currentUser.username}`);
      
      // إخفاء شاشة القفل
      lockScreenOverlay.classList.add('hidden');
      
      // إعادة تعيين حقل كلمة المرور وإخفاء رسالة الخطأ
      unlockPassword.value = '';
      unlockError.classList.add('hidden');
      
      // إظهار رسالة نجاح
      showNotification("تم فتح القفل بنجاح", "success");
    } else {
      SystemDebugger.warn(`كلمة المرور غير صحيحة لفتح القفل`);
      
      // إظهار رسالة الخطأ
      unlockError.classList.remove('hidden');
    }
  }
  
  // إضافة حل سريع لمشكلة فتح القفل
  function applyQuickLockScreenFix() {
    SystemDebugger.system("تطبيق حل سريع لمشكلة فتح القفل");
    
    // إضافة مستمع حدث مباشر لزر فتح القفل
    document.addEventListener('click', function(event) {
      if (event.target.id === 'unlock-btn' || 
          (event.target.closest('#unlock-btn') && event.target.tagName === 'I')) {
        
        SystemDebugger.info("تم النقر على زر فتح القفل عبر الحل السريع");
        
        const password = document.getElementById('unlock-password').value;
        
        // التحقق من وجود جلسة في التخزين المحلي
        const savedSession = localStorage.getItem('investmentAppCurrentSession');
        if (!savedSession) {
          SystemDebugger.error("لا توجد جلسة نشطة");
          return;
        }
        
        const currentUserSession = JSON.parse(savedSession);
        
        // التحقق من وجود المستخدم في التخزين المحلي
        const savedUsers = localStorage.getItem('investmentAppUsers');
        if (!savedUsers) {
          SystemDebugger.error("لا يوجد مستخدمين محفوظين");
          return;
        }
        
        const users = JSON.parse(savedUsers);
        const user = users.find(u => u.username === currentUserSession.username);
        
        if (!user) {
          SystemDebugger.error("المستخدم غير موجود في قائمة المستخدمين");
          return;
        }
        
        SystemDebugger.info(`التحقق من كلمة المرور: ${password} مقابل ${user.password}`);
        
        if (user && password === user.password) {
          SystemDebugger.success("تم فتح القفل بنجاح عبر الحل السريع");
          document.getElementById('lock-screen-overlay').classList.add('hidden');
          document.getElementById('unlock-error').classList.add('hidden');
          document.getElementById('unlock-password').value = '';
          showNotification('تم فتح القفل بنجاح', 'success');
        } else {
          SystemDebugger.warn("كلمة المرور غير صحيحة (الحل السريع)");
          document.getElementById('unlock-error').classList.remove('hidden');
        }
      }
    });
    
    // إضافة مستمع حدث للضغط على Enter في حقل كلمة المرور
    document.addEventListener('keypress', function(event) {
      if (event.key === 'Enter' && 
          document.activeElement && 
          document.activeElement.id === 'unlock-password') {
        
        SystemDebugger.info("تم الضغط على Enter في حقل كلمة المرور");
        
        // محاكاة النقر على زر فتح القفل
        const unlockBtn = document.getElementById('unlock-btn');
        if (unlockBtn) {
          unlockBtn.click();
        }
      }
    });
  }
  
  // نظام الأخطاء غير المعالجة
  window.addEventListener('error', function(event) {
    SystemDebugger.error(`خطأ غير معالج: ${event.message}`, {
      fileName: event.filename,
      lineNumber: event.lineno,
      columnNumber: event.colno,
      stack: event.error ? event.error.stack : null
    });
  });
  
  // المراقبة الذاتية للنظام
  setInterval(function() {
    if (typeof currentUser !== 'undefined' && typeof isAuthenticated !== 'undefined') {
      // التحقق من تطابق حالة الجلسة المحلية مع المتغيرات
      const savedSession = localStorage.getItem('investmentAppCurrentSession');
      const hasLocalSession = !!savedSession;
      
      if (isAuthenticated !== hasLocalSession) {
        SystemDebugger.warn("عدم تطابق حالة المصادقة", {
          isAuthenticated,
          hasLocalSession
        });
      }
    }
  }, 30000); // كل 30 ثانية
  
  // تطبيق التعديلات والتشخيص عند تحميل الصفحة
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      SystemDebugger.system("بدء تشغيل أدوات التشخيص");
      SystemDebugger.info("معلومات المتصفح", {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform
      });
      
      // تطبيق الحل السريع
      applyQuickLockScreenFix();
      
      // عرض حالة النظام
      SystemDebugger.dumpSystemState();
      
      // عرض تعليمات التشخيص
      SystemDebugger.help();
      
      console.log('%c🔧 يمكنك استخدام SystemDebugger للتشخيص وإظهار الأخطاء', 'color: #2196F3; font-size: 14px; font-weight: bold;');
      console.log('%c  على سبيل المثال: SystemDebugger.testAuth() أو SystemDebugger.testLockScreen()', 'color: #2196F3;');
    }, 1000);
  });
  
  // تصدير الوظائف للاستخدام العام
  window.debugAuth = SystemDebugger.testAuth.bind(SystemDebugger);
  window.debugLock = SystemDebugger.testLockScreen.bind(SystemDebugger);
  window.debugState = SystemDebugger.dumpSystemState.bind(SystemDebugger);
  window.debugLogs = SystemDebugger.showLogs.bind(SystemDebugger);
  window.debugHelp = SystemDebugger.help.bind(SystemDebugger);