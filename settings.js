
  
        // التحقق من تسجيل الدخول
        const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (!currentUser) {
            window.location.href = 'login.html';
        }

        // تهيئة التاريخ والوقت
        function updateDateTime() {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById('current-date').textContent = now.toLocaleDateString('ar-YE', options);
        }
        
        updateDateTime();
        setInterval(updateDateTime, 60000);

        // تسجيل الخروج
        document.getElementById('logout-btn').addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });

        // تحميل الإعدادات
        function loadSettings() {
            // تحميل إعدادات المتجر
            document.getElementById('storeName').value = localStorage.getItem('storeName') || 'متجري';
            document.getElementById('storeAddress').value = localStorage.getItem('storeAddress') || '';
            document.getElementById('storePhone').value = localStorage.getItem('storePhone') || '';
            document.getElementById('storeTaxNumber').value = localStorage.getItem('storeTaxNumber') || '';
            
            // تحميل إعدادات الفواتير
            const settings = JSON.parse(localStorage.getItem('settings') || '{}');
            document.getElementById('receiptFooter').value = settings.receiptFooter || 'شكراً لشرائكم من متجرنا';
            document.getElementById('invoicePrefix').value = settings.invoicePrefix || 'INV-';
            document.getElementById('nextInvoiceNumber').value = settings.nextInvoiceNumber || 1;
            document.getElementById('printAutomatically').checked = settings.printAutomatically !== false;
            document.getElementById('showDiscounts').checked = settings.showDiscounts !== false;
            
            // تحميل إعدادات النظام
            document.getElementById('enableBarcode').checked = settings.enableBarcode !== false;
            document.getElementById('enableNotifications').checked = settings.enableNotifications !== false;
            document.getElementById('lowStockAlerts').checked = settings.lowStockAlerts !== false;
            document.getElementById('expiryAlerts').checked = settings.expiryAlerts !== false;
            document.getElementById('lowStockThreshold').value = settings.lowStockThreshold || 10;
            document.getElementById('expiryThreshold').value = settings.expiryThreshold || 30;
            
            // تحميل إعدادات المظهر
            const currentTheme = localStorage.getItem('theme') || 'light';
            document.querySelector(`.theme-option.${currentTheme}`).classList.add('active');
            document.getElementById('primaryColor').value = settings.primaryColor || '#4e73df';
            document.getElementById('autoTheme').checked = settings.autoTheme || false;
            
            // تحميل إعدادات الأمان
            document.getElementById('autoLogout').checked = settings.autoLogout || false;
            document.getElementById('autoLogoutTimeout').value = settings.autoLogoutTimeout || 30;
            document.getElementById('passwordChangeRequired').checked = settings.passwordChangeRequired || false;
            document.getElementById('passwordChangeDays').value = settings.passwordChangeDays || 90;
            
            // تحميل معلومات النسخ الاحتياطي
            const lastBackup = localStorage.getItem('lastBackup');
            if (lastBackup) {
                document.getElementById('last-backup-info').textContent = new Date(parseInt(lastBackup)).toLocaleString('ar-YE');
            }
            
            // إظهار/إخفاء الحقول المشروطة
            toggleConditionalFields();
        }

        // إظهار/إخفاء الحقول المشروطة
        function toggleConditionalFields() {
            const autoLogout = document.getElementById('autoLogout');
            const autoLogoutTimeoutContainer = document.getElementById('autoLogoutTimeoutContainer');
            autoLogoutTimeoutContainer.style.display = autoLogout.checked ? 'block' : 'none';
            
            const passwordChangeRequired = document.getElementById('passwordChangeRequired');
            const passwordChangeDaysContainer = document.getElementById('passwordChangeDaysContainer');
            passwordChangeDaysContainer.style.display = passwordChangeRequired.checked ? 'block' : 'none';
        }

        // تغيير الثيم
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                const theme = this.getAttribute('data-theme');
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
            });
        });

        // إظهار/إخفاء الحقول عند تغيير التبديل
        document.getElementById('autoLogout').addEventListener('change', toggleConditionalFields);
        document.getElementById('passwordChangeRequired').addEventListener('change', toggleConditionalFields);

        // حفظ الإعدادات
        document.getElementById('save-settings-btn').addEventListener('click', function() {
            // حفظ إعدادات المتجر
            localStorage.setItem('storeName', document.getElementById('storeName').value);
            localStorage.setItem('storeAddress', document.getElementById('storeAddress').value);
            localStorage.setItem('storePhone', document.getElementById('storePhone').value);
            localStorage.setItem('storeTaxNumber', document.getElementById('storeTaxNumber').value);
            
            // حفظ إعدادات الفواتير والنظام
            const settings = {
                receiptFooter: document.getElementById('receiptFooter').value,
                invoicePrefix: document.getElementById('invoicePrefix').value,
                nextInvoiceNumber: parseInt(document.getElementById('nextInvoiceNumber').value),
                printAutomatically: document.getElementById('printAutomatically').checked,
                showDiscounts: document.getElementById('showDiscounts').checked,
                enableBarcode: document.getElementById('enableBarcode').checked,
                enableNotifications: document.getElementById('enableNotifications').checked,
                lowStockAlerts: document.getElementById('lowStockAlerts').checked,
                expiryAlerts: document.getElementById('expiryAlerts').checked,
                lowStockThreshold: parseInt(document.getElementById('lowStockThreshold').value),
                expiryThreshold: parseInt(document.getElementById('expiryThreshold').value),
                primaryColor: document.getElementById('primaryColor').value,
                autoTheme: document.getElementById('autoTheme').checked,
                autoLogout: document.getElementById('autoLogout').checked,
                autoLogoutTimeout: parseInt(document.getElementById('autoLogoutTimeout').value),
                passwordChangeRequired: document.getElementById('passwordChangeRequired').checked,
                passwordChangeDays: parseInt(document.getElementById('passwordChangeDays').value)
            };
            
            localStorage.setItem('settings', JSON.stringify(settings));
            
            // تحديث اسم المتجر في الشريط العلوي
            document.getElementById('store-name').textContent = document.getElementById('storeName').value;
            
            alert('تم حفظ الإعدادات بنجاح');
        });

        // إنشاء نسخة احتياطية
        document.getElementById('backup-btn').addEventListener('click', function() {
            // جمع جميع البيانات من localStorage
            const backupData = {
                products: JSON.parse(localStorage.getItem('products') || '[]'),
                sales: JSON.parse(localStorage.getItem('sales') || '[]'),
                creditSales: JSON.parse(localStorage.getItem('creditSales') || '[]'),
                paidCreditSales: JSON.parse(localStorage.getItem('paidCreditSales') || '[]'),
                suppliers: JSON.parse(localStorage.getItem('suppliers') || '[]'),
                purchases: JSON.parse(localStorage.getItem('purchases') || '[]'),
                employees: JSON.parse(localStorage.getItem('employees') || '[]'),
                expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
                users: JSON.parse(localStorage.getItem('users') || '[]'),
                settings: JSON.parse(localStorage.getItem('settings') || '{}'),
                storeName: localStorage.getItem('storeName'),
                storeAddress: localStorage.getItem('storeAddress'),
                storePhone: localStorage.getItem('storePhone'),
                storeTaxNumber: localStorage.getItem('storeTaxNumber'),
                backupDate: new Date().getTime()
            };
            
            // تحويل البيانات إلى JSON
            const jsonData = JSON.stringify(backupData, null, 2);
            
            // إنشاء ملف للتحميل
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // حفظ تاريخ آخر نسخة احتياطية
            localStorage.setItem('lastBackup', new Date().getTime().toString());
            document.getElementById('last-backup-info').textContent = new Date().toLocaleString('ar-YE');
            
            alert('تم إنشاء النسخة الاحتياطية بنجاح');
        });

        // استعادة نسخة احتياطية
        document.getElementById('restore-btn').addEventListener('click', function() {
            document.getElementById('restore-file').click();
        });

        document.getElementById('restore-file').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            if (!confirm('تحذير: سيتم استبدال جميع البيانات الحالية بالبيانات من النسخة الاحتياطية. هل تريد المتابعة؟')) {
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const backupData = JSON.parse(e.target.result);
                    
                    // استعادة البيانات إلى localStorage
                    if (backupData.products) localStorage.setItem('products', JSON.stringify(backupData.products));
                    if (backupData.sales) localStorage.setItem('sales', JSON.stringify(backupData.sales));
                    if (backupData.creditSales) localStorage.setItem('creditSales', JSON.stringify(backupData.creditSales));
                    if (backupData.paidCreditSales) localStorage.setItem('paidCreditSales', JSON.stringify(backupData.paidCreditSales));
                    if (backupData.suppliers) localStorage.setItem('suppliers', JSON.stringify(backupData.suppliers));
                    if (backupData.purchases) localStorage.setItem('purchases', JSON.stringify(backupData.purchases));
                    if (backupData.employees) localStorage.setItem('employees', JSON.stringify(backupData.employees));
                    if (backupData.expenses) localStorage.setItem('expenses', JSON.stringify(backupData.expenses));
                    if (backupData.users) localStorage.setItem('users', JSON.stringify(backupData.users));
                    if (backupData.settings) localStorage.setItem('settings', JSON.stringify(backupData.settings));
                    if (backupData.storeName) localStorage.setItem('storeName', backupData.storeName);
                    if (backupData.storeAddress) localStorage.setItem('storeAddress', backupData.storeAddress);
                    if (backupData.storePhone) localStorage.setItem('storePhone', backupData.storePhone);
                    if (backupData.storeTaxNumber) localStorage.setItem('storeTaxNumber', backupData.storeTaxNumber);
                    if (backupData.backupDate) localStorage.setItem('lastBackup', backupData.backupDate.toString());
                    
                    // إعادة تحميل الإعدادات
                    loadSettings();
                    
                    alert('تم استعادة النسخة الاحتياطية بنجاح');
                } catch (error) {
                    alert('خطأ في استعادة النسخة الاحتياطية: الملف غير صالح');
                    console.error(error);
                }
            };
            reader.readAsText(file);
        });

        // إلغاء التغييرات
        document.getElementById('cancel-btn').addEventListener('click', function() {
            if (confirm('هل تريد تجاهل التغييرات التي قمت بها؟')) {
                loadSettings();
            }
        });

        // تحميل البيانات عند فتح الصفحة
        document.addEventListener('DOMContentLoaded', function() {
            loadSettings();
            
            // تطبيق الثيم المحفوظ
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.remove('active');
                if (opt.getAttribute('data-theme') === savedTheme) {
                    opt.classList.add('active');
                }
            });
        });
    
