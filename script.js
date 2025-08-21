// تطبيق إدارة المحلات التجارية
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة التطبيق
    initApp();
    
    // إضافة مستمعي الأحداث
    setupEventListeners();
});

// تهيئة التطبيق
function initApp() {
    // تحديث التاريخ الحالي
    updateCurrentDate();
    
    // عرض لوحة التحكم عند التحميل
    showSection('dashboard');
    
    // تحميل البيانات الأولية
    loadInitialData();
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // التنقل بين الأقسام
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // أحداث قسم المنتجات
    document.getElementById('add-product-btn').addEventListener('click', showProductModal);
    document.getElementById('product-search').addEventListener('input', searchProducts);
    document.getElementById('save-product').addEventListener('click', saveProduct);
    
    // أحداث قسم نقطة البيع
    document.getElementById('barcode-input').addEventListener('keypress', handleBarcodeInput);
    document.getElementById('pos-search').addEventListener('input', searchPOSProducts);
    document.getElementById('clear-cart').addEventListener('click', clearCart);
    document.getElementById('complete-sale').addEventListener('click', completeSale);
    
    // أحداث قسم التقارير
    document.getElementById('generate-report').addEventListener('click', generateReport);
    
    // أحداث النماذج المنبثقة
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    document.getElementById('product-category').addEventListener('change', toggleCategoryFields);
    
    // تسجيل الخروج
    document.getElementById('logout-btn').addEventListener('click', logout);
}

// تحديث التاريخ الحالي
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('ar-SA', options);
}

// إظهار القسم المحدد وإخفاء الآخرين
function showSection(sectionId) {
    // تحديث القائمة النشطة
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
    
    // إظهار القسم المحدد وإخفاء الآخرين
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(`${sectionId}-section`).classList.add('active');
    
    // تحميل محتوى القسم إذا لزم الأمر
    switch(sectionId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'pos':
            loadPOS();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// تحميل البيانات الأولية
function loadInitialData() {
    // يمكن إضافة أي تهيئة إضافية هنا
}

// تحميل لوحة التحكم
function loadDashboard() {
    updateDashboardStats();
    loadLowStockProducts();
    loadTopSellingProducts();
    loadRecentSales();
    loadNotifications();
}

// تحديث إحصائيات لوحة التحكم
function updateDashboardStats() {
    const products = db.getAllProducts();
    const sales = db.getAllSales();
    
    // حساب إجمالي المبيعات
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    document.getElementById('total-sales').textContent = totalSales.toFixed(2) + ' ر.س';
    
    // عدد المنتجات
    document.getElementById('total-products').textContent = products.length;
    
    // عدد المنتجات منخفضة المخزون
    const lowStockCount = db.getLowStockProducts().length;
    document.getElementById('low-stock-count').textContent = lowStockCount;
    
    // مبيعات اليوم
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales
        .filter(sale => sale.date.startsWith(today))
        .reduce((sum, sale) => sum + sale.total, 0);
    document.getElementById('today-sales').textContent = todaySales.toFixed(2) + ' ر.س';
}

// تحميل المنتجات منخفضة المخزون
function loadLowStockProducts() {
    const lowStockProducts = db.getLowStockProducts();
    const lowStockList = document.getElementById('low-stock-list');
    
    lowStockList.innerHTML = '';
    
    if (lowStockProducts.length === 0) {
        lowStockList.innerHTML = '<tr><td colspan="4" class="text-center">لا توجد منتجات منخفضة المخزون</td></tr>';
        return;
    }
    
    lowStockProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td><span class="badge badge-warning">${product.quantity}</span></td>
            <td><button class="btn btn-primary btn-sm">إعادة التوريد</button></td>
        `;
        lowStockList.appendChild(row);
    });
}

// تحميل المنتجات الأكثر مبيعاً
function loadTopSellingProducts() {
    // هذه بيانات تجريبية - في تطبيق حقيقي سيتم حسابها من المبيعات
    const topProducts = [
        { name: 'أرز بسمتي', sales: 150, revenue: 3750 },
        { name: 'سكر', sales: 120, revenue: 1800 },
        { name: 'بنطلون جينز', sales: 95, revenue: 11400 },
        { name: 'قميص رجالي', sales: 80, revenue: 6400 },
        { name: 'بنزين 95', sales: 75, revenue: 163.5 }
    ];
    
    const topProductsList = document.getElementById('top-products-list');
    topProductsList.innerHTML = '';
    
    topProducts.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.sales}</td>
            <td>${product.revenue.toFixed(2)} ر.ي</td>
        `;
        topProductsList.appendChild(row);
    });
}

// تحميل آخر المبيعات
function loadRecentSales() {
    const sales = db.getAllSales().slice(-5).reverse();
    const recentSales = document.getElementById('recent-sales');
    
    recentSales.innerHTML = '';
    
    if (sales.length === 0) {
        recentSales.innerHTML = '<tr><td colspan="4" class="text-center">لا توجد مبيعات</td></tr>';
        return;
    }
    
    sales.forEach(sale => {
        const saleDate = new Date(sale.date);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.id.slice(-6)}</td>
            <td>${saleDate.toLocaleDateString('ar-SA')}</td>
            <td>${sale.total.toFixed(2)} ر.ي</td>
            <td>${getPaymentMethodName(sale.paymentMethod)}</td>
        `;
        recentSales.appendChild(row);
    });
}

// تحميل الإشعارات
function loadNotifications() {
    const notificationsContainer = document.getElementById('notifications-container');
    const lowStockProducts = db.getLowStockProducts();
    
    notificationsContainer.innerHTML = '';
    
    if (lowStockProducts.length > 0) {
        const notification = document.createElement('div');
        notification.className = 'notification warning';
        notification.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <h4>تحذير: منتجات منخفضة المخزون</h4>
                <p>هناك ${lowStockProducts.length} منتج بكميات منخفضة تحتاج إلى إعادة توريد</p>
            </div>
        `;
        notificationsContainer.appendChild(notification);
    } else {
        const notification = document.createElement('div');
        notification.className = 'notification info';
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <div>
                <h4>كل شيء على ما يرام</h4>
                <p>لا توجد إشعارات أو تحذيرات حالية</p>
            </div>
        `;
        notificationsContainer.appendChild(notification);
    }
}

// تحميل المنتجات
function loadProducts() {
    const products = db.getAllProducts();
    const productsTable = document.getElementById('products-table');
    
    productsTable.innerHTML = '';
    
    if (products.length === 0) {
        productsTable.innerHTML = '<tr><td colspan="7" class="text-center">لا توجد منتجات مسجلة</td></tr>';
        return;
    }
    
    products.forEach((product, index) => {
        const status = product.quantity > 10 ? 
            '<span class="badge badge-success">في المخزون</span>' : 
            '<span class="badge badge-danger">منخفض</span>';
            
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price.toFixed(2)} ر.ي</td>
            <td>${product.quantity}</td>
            <td>${status}</td>
            <td>
                <button class="btn btn-primary btn-sm edit-product" data-id="${product.id}">تعديل</button>
                <button class="btn btn-danger btn-sm delete-product" data-id="${product.id}">حذف</button>
            </td>
        `;
        productsTable.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث لأزرار التعديل والحذف
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            deleteProduct(productId);
        });
    });
}

// البحث عن المنتجات
function searchProducts() {
    const query = document.getElementById('product-search').value;
    const products = db.searchProducts(query);
    const productsTable = document.getElementById('products-table');
    
    productsTable.innerHTML = '';
    
    if (products.length === 0) {
        productsTable.innerHTML = '<tr><td colspan="7" class="text-center">لا توجد منتجات تطابق البحث</td></tr>';
        return;
    }
    
    products.forEach((product, index) => {
        const status = product.quantity > 10 ? 
            '<span class="badge badge-success">في المخزون</span>' : 
            '<span class="badge badge-danger">منخفض</span>';
            
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price.toFixed(2)} ر.ي</td>
            <td>${product.quantity}</td>
            <td>${status}</td>
            <td>
                <button class="btn btn-primary btn-sm edit-product" data-id="${product.id}">تعديل</button>
                <button class="btn btn-danger btn-sm delete-product" data-id="${product.id}">حذف</button>
            </td>
        `;
        productsTable.appendChild(row);
    });
    
    // إعادة إرفاق مستمعي الأحداث
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            deleteProduct(productId);
        });
    });
}

// إظهار نموذج إضافة/تعديل منتج
function showProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const productForm = document.getElementById('product-form');
    
    if (product) {
        modalTitle.textContent = 'تعديل المنتج';
        // ملء النموذج ببيانات المنتج
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-quantity').value = product.quantity;
        document.getElementById('product-description').value = product.description || '';
        
        // إظهار الحقول الخاصة بكل فئة
        toggleCategoryFields(product.category);
        
        if (product.category === 'غذائية') {
            document.getElementById('expiry-date').value = product.expiryDate || '';
        } else if (product.category === 'ملابس') {
            document.getElementById('clothing-size').value = product.size || '';
            document.getElementById('clothing-color').value = product.color || '';
        }
    } else {
        modalTitle.textContent = 'إضافة منتج جديد';
        productForm.reset();
        document.getElementById('product-id').value = '';
        // إخفاء جميع الحقول الخاصة
        document.getElementById('food-fields').style.display = 'none';
        document.getElementById('clothing-fields').style.display = 'none';
    }
    
    modal.style.display = 'flex';
}

// تبديل الحقول حسب فئة المنتج
function toggleCategoryFields() {
    const category = document.getElementById('product-category').value;
    document.getElementById('food-fields').style.display = category === 'غذائية' ? 'block' : 'none';
    document.getElementById('clothing-fields').style.display = category === 'ملابس' ? 'block' : 'none';
}

// حفظ المنتج
function saveProduct() {
    const productId = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const quantity = parseInt(document.getElementById('product-quantity').value);
    const description = document.getElementById('product-description').value;
    
    if (!name || !category || isNaN(price) || isNaN(quantity)) {
        showToast('يرجى ملء جميع الحقول الإلزامية', 'error');
        return;
    }
    
    let productData = {
        name,
        category,
        price,
        quantity,
        description
    };
    
    // إضافة الحقول الخاصة بكل فئة
    if (category === 'غذائية') {
        productData.expiryDate = document.getElementById('expiry-date').value;
    } else if (category === 'ملابس') {
        productData.size = document.getElementById('clothing-size').value;
        productData.color = document.getElementById('clothing-color').value;
    }
    
    if (productId) {
        // تعديل المنتج الموجود
        productData.id = productId;
        db.updateProduct(productData);
        showToast('تم تحديث المنتج بنجاح', 'success');
    } else {
        // إضافة منتج جديد
        db.addProduct(productData);
        showToast('تم إضافة المنتج بنجاح', 'success');
    }
    
    // إغلاق النافذة المنبثقة وتحديث الجدول
    closeModal();
    loadProducts();
    updateDashboardStats();
}

// تحرير منتج
function editProduct(productId) {
    const product = db.getProductById(productId);
    if (product) {
        showProductModal(product);
    }
}

// حذف منتج
function deleteProduct(productId) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        db.deleteProduct(productId);
        showToast('تم حذف المنتج بنجاح', 'success');
        loadProducts();
        updateDashboardStats();
    }
}

// تحميل نقطة البيع
function loadPOS() {
    loadProductsForPOS();
    resetCart();
}

// تحميل المنتجات لنقطة البيع
function loadProductsForPOS() {
    const products = db.getAllProducts();
    const productsGrid = document.getElementById('pos-products');
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        if (product.quantity > 0) {
            const productEl = document.createElement('div');
            productEl.className = 'product-item';
            productEl.setAttribute('data-id', product.id);
            productEl.innerHTML = `
                <h4>${product.name}</h4>
                <p>السعر: ${product.price.toFixed(2)} ر.ي</p>
                <p>المخزون: ${product.quantity}</p>
            `;
            productEl.addEventListener('click', () => {
                addToCart(product);
            });
            productsGrid.appendChild(productEl);
        }
    });
}

// البحث في نقطة البيع
function searchPOSProducts() {
    const query = document.getElementById('pos-search').value;
    const products = db.searchProducts(query);
    const productsGrid = document.getElementById('pos-products');
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        if (product.quantity > 0) {
            const productEl = document.createElement('div');
            productEl.className = 'product-item';
            productEl.setAttribute('data-id', product.id);
            productEl.innerHTML = `
                <h4>${product.name}</h4>
                <p>السعر: ${product.price.toFixed(2)} ر.ي</p>
                <p>المخزون: ${product.quantity}</p>
            `;
            productEl.addEventListener('click', () => {
                addToCart(product);
            });
            productsGrid.appendChild(productEl);
        }
    });
}

// معالجة إدخال الباركود
function handleBarcodeInput(e) {
    if (e.key === 'Enter') {
        const barcode = this.value;
        // في تطبيق حقيقي، سيتم البحث عن المنتج باستخدام الباركود
        // هنا مجرد محاكاة
        const product = db.getProductById(barcode);
        
        if (product) {
            addToCart(product);
            this.value = '';
        } else {
            showToast('المنتج غير موجود', 'error');
        }
    }
}

// إضافة منتج إلى سلة التسوق
function addToCart(product) {
    const cartItems = document.getElementById('cart-items');
    
    // البحث إذا كان المنتج موجوداً بالفعل في السلة
    const existingItem = cartItems.querySelector(`[data-id="${product.id}"]`);
    
    if (existingItem) {
        // زيادة الكمية إذا كان المنتج موجوداً
        const quantityEl = existingItem.querySelector('.item-quantity');
        let quantity = parseInt(quantityEl.textContent) + 1;
        
        if (quantity > product.quantity) {
            showToast('الكمية المطلوبة غير متوفرة في المخزون', 'error');
            return;
        }
        
        quantityEl.textContent = quantity;
        
        // تحديث السعر الإجمالي للعنصر
        const itemTotalEl = existingItem.querySelector('.item-total');
        itemTotalEl.textContent = (quantity * product.price).toFixed(2);
    } else {
        // إضافة عنصر جديد إلى السلة
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.setAttribute('data-id', product.id);
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${product.name}</h4>
                <p>${product.price.toFixed(2)} ر.ي</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-control">
                    <button class="quantity-btn decrease">-</button>
                    <span class="item-quantity">1</span>
                    <button class="quantity-btn increase">+</button>
                </div>
                <span class="item-total">${product.price.toFixed(2)} ر.س</span>
                <button class="btn btn-danger btn-sm remove-item">×</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
        
        // إضافة مستمعي الأحداث للعنصر الجديد
        const increaseBtn = cartItem.querySelector('.increase');
        const decreaseBtn = cartItem.querySelector('.decrease');
        const removeBtn = cartItem.querySelector('.remove-item');
        
        increaseBtn.addEventListener('click', () => {
            changeItemQuantity(product, cartItem, 1);
        });
        
        decreaseBtn.addEventListener('click', () => {
            changeItemQuantity(product, cartItem, -1);
        });
        
        removeBtn.addEventListener('click', () => {
            cartItem.remove();
            updateCartTotal();
        });
    }
    
    updateCartTotal();
    
    // إخفاء رسالة السلة الفارغة إذا كانت موجودة
    const emptyCart = cartItems.querySelector('.empty-cart');
    if (emptyCart) {
        emptyCart.remove();
    }
}

// تغيير كمية العنصر في السلة
function changeItemQuantity(product, cartItem, change) {
    const quantityEl = cartItem.querySelector('.item-quantity');
    let quantity = parseInt(quantityEl.textContent) + change;
    
    if (quantity < 1) {
        cartItem.remove();
    } else if (quantity > product.quantity) {
        showToast('الكمية المطلوبة غير متوفرة في المخزون', 'error');
        return;
    } else {
        quantityEl.textContent = quantity;
        
        // تحديث السعر الإجمالي للعنصر
        const itemTotalEl = cartItem.querySelector('.item-total');
        itemTotalEl.textContent = (quantity * product.price).toFixed(2);
    }
    
    updateCartTotal();
    
    // إظهار رسالة السلة الفارغة إذا لم يكن هناك عناصر
    const cartItems = document.getElementById('cart-items');
    if (cartItems.children.length === 0) {
        showEmptyCart();
    }
}

// تحديث الإجمالي في السلة
function updateCartTotal() {
    const cartItems = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const cartTotal = document.getElementById('cart-total');
    
    let subtotal = 0;
    cartItems.querySelectorAll('.cart-item').forEach(item => {
        const itemTotal = parseFloat(item.querySelector('.item-total').textContent);
        subtotal += itemTotal;
    });
    
    const taxRate = db.getSettings().taxRate || 15;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    
    cartSubtotal.textContent = subtotal.toFixed(2) + ' ر.ي';
    cartTax.textContent = tax.toFixed(2) + ' ر.ي';
    cartTotal.textContent = total.toFixed(2) + ' ر.ي';
}

// إظهار رسالة السلة الفارغة
function showEmptyCart() {
    const cartItems = document.getElementById('cart-items');
    const emptyCart = document.createElement('div');
    emptyCart.className = 'empty-cart';
    emptyCart.innerHTML = `
        <i class="fas fa-shopping-cart"></i>
        <p>السلة فارغة</p>
    `;
    cartItems.appendChild(emptyCart);
}

// مسح السلة
function clearCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    showEmptyCart();
    updateCartTotal();
}

// إتمام عملية البيع
function completeSale() {
    const cartItems = document.getElementById('cart-items').querySelectorAll('.cart-item');
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
    
    if (cartItems.length === 0) {
        showToast('السلة فارغة', 'error');
        return;
    }
    
    if (!paymentMethod) {
        showToast('يرجى اختيار طريقة الدفع', 'error');
        return;
    }
    
    // جمع معلومات الفاتورة
    const sale = {
        items: [],
        total: parseFloat(document.getElementById('cart-total').textContent),
        paymentMethod: paymentMethod.value
    };
    
    // جمع العناصر المشتراة
    cartItems.forEach(item => {
        const productId = item.getAttribute('data-id');
        const quantity = parseInt(item.querySelector('.item-quantity').textContent);
        const price = parseFloat(item.querySelector('.item-total').textContent) / quantity;
        
        sale.items.push({
            productId,
            quantity,
            price
        });
    });
    
    // حفظ عملية البيع
    db.addSale(sale);
    
    // طباعة الفاتورة (محاكاة)
    printReceipt(sale);
    
    // إعادة تعيين السلة
    clearCart();
    
    showToast('تمت عملية البيع بنجاح', 'success');
    updateDashboardStats();
}

// طباعة الفاتورة (محاكاة)
function printReceipt(sale) {
    // في تطبيق حقيقي، سيتم إنشاء نموذج فاتورة للطباعة
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`
        <html>
        <head>
            <title>فاتورة البيع</title>
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .details { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: right; border-bottom: 1px solid #ddd; }
                .total { font-weight: bold; font-size: 1.2em; }
                .footer { margin-top: 30px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>فاتورة بيع</h1>
                <p>${new Date().toLocaleDateString('ar-SA')}</p>
            </div>
            
            <div class="details">
                <table>
                    <thead>
                        <tr>
                            <th>المنتج</th>
                            <th>الكمية</th>
                            <th>السعر</th>
                            <th>الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sale.items.map(item => {
                            const product = db.getProductById(item.productId);
                            return `
                                <tr>
                                    <td>${product.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${item.price.toFixed(2)} ر.ي</td>
                                    <td>${(item.quantity * item.price).toFixed(2)} ر.س</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="total">
                <p>الإجمالي: ${sale.total.toFixed(2)} ر.ي</p>
                <p>طريقة الدفع: ${getPaymentMethodName(sale.paymentMethod)}</p>
            </div>
            
            <div class="footer">
                <p>شكراً لشرائك من متجرنا</p>
            </div>
        </body>
        </html>
    `);
    
    receiptWindow.document.close();
    receiptWindow.print();
}

// الحصول على اسم طريقة الدفع
function getPaymentMethodName(method) {
    switch(method) {
        case 'cash': return 'نقدي';
        case 'card': return 'بطاقة';
        case 'transfer': return 'تحويل';
        default: return method;
    }
}

// تحميل التقارير
function loadReports() {
    // هذه وظيفة أساسية، في تطبيق حقيقي سيتم تطويرها أكثر
    generateSalesChart();
    generateInventoryReport();
}

// توليد رسم بياني للمبيعات
function generateSalesChart() {
    // هذه محاكاة للرسم البياني
    const salesCtx = document.getElementById('sales-chart');
    salesCtx.innerHTML = '<p style="text-align:center; padding: 50px;">رسم بياني للمبيعات (سيتم تنفيذه بمكتبة متخصصة)</p>';
}

// توليد تقرير المخزون
function generateInventoryReport() {
    const products = db.getAllProducts();
    const inventoryTable = document.getElementById('inventory-report');
    
    inventoryTable.innerHTML = '';
    
    if (products.length === 0) {
        inventoryTable.innerHTML = '<tr><td colspan="5" class="text-center">لا توجد منتجات مسجلة</td></tr>';
        return;
    }
    
    products.forEach(product => {
        const inventoryValue = product.price * product.quantity;
        let status = '';
        
        if (product.quantity < 5) {
            status = '<span class="badge badge-danger">منخفض جداً</span>';
        } else if (product.quantity < 10) {
            status = '<span class="badge badge-warning">منخفض</span>';
        } else {
            status = '<span class="badge badge-success">جيد</span>';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td>${inventoryValue.toFixed(2)} ر.ي</td>
            <td>${status}</td>
        `;
        inventoryTable.appendChild(row);
    });
}

// توليد التقرير
function generateReport() {
    const period = document.getElementById('report-period').value;
    const fromDate = document.getElementById('report-from').value;
    const toDate = document.getElementById('report-to').value;
    
    // في تطبيق حقيقي، سيتم استخدام هذه المعايير لتصفية البيانات
    showToast('تم توليد التقرير بنجاح', 'success');
    generateSalesChart();
    generateInventoryReport();
}

// إظهار إشعار
function showToast(message, type = 'info') {
    const toast = document.getElementById('notification-toast');
    const toastMessage = toast.querySelector('.toast-message');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// إغلاق النافذة المنبثقة
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// تسجيل الخروج
function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        // في تطبيق حقيقي، سيتم توجيه المستخدم إلى صفحة تسجيل الدخول
        showToast('تم تسجيل الخروج بنجاح', 'success');
    }
}

// إعادة تعيين السلة
function resetCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    showEmptyCart();
    updateCartTotal();
}
