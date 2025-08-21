// تطبيق إدارة المحلات التجارية - الإصدار المحسن
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة التطبيق
    initApp();
    
    // إضافة مستمعي الأحداث
    setupEventListeners();
});

// متغيرات التطبيق
let cart = [];
let currentChart = null;

// تهيئة التطبيق
function initApp() {
    // تحديث التاريخ الحالي
    updateCurrentDate();
    
    // عرض لوحة التحكم عند التحميل
    showSection('dashboard');
    
    // تحميل البيانات الأولية
    loadInitialData();
    
    // تهيئة كاميرا الباركود إذا كانت مدعومة
    initBarcodeScanner();
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
    
    // أحداث جديدة للباركود والطباعة
    document.getElementById('enable-camera').addEventListener('click', startBarcodeScanner);
    document.getElementById('disable-camera').addEventListener('click', stopBarcodeScanner);
    document.getElementById('print-receipt').addEventListener('click', printReceipt);
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
    const stats = db.getStats();
    
    document.getElementById('total-sales').textContent = stats.totalSales.toFixed(2) + ' ر.س';
    document.getElementById('total-products').textContent = stats.totalProducts;
    document.getElementById('low-stock-count').textContent = stats.lowStockCount;
    document.getElementById('today-sales').textContent = getTodaySales().toFixed(2) + ' ر.س';
    document.getElementById('inventory-value').textContent = stats.inventoryValue.toFixed(2) + ' ر.س';
}

// الحصول على مبيعات اليوم
function getTodaySales() {
    const sales = db.getAllSales();
    const today = new Date().toISOString().split('T')[0];
    return sales
        .filter(sale => sale.date.startsWith(today))
        .reduce((sum, sale) => sum + sale.total, 0);
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
            <td><button class="btn btn-primary btn-sm" onclick="restockProduct('${product.id}')">إعادة التوريد</button></td>
        `;
        lowStockList.appendChild(row);
    });
}

// تحميل المنتجات الأكثر مبيعاً
function loadTopSellingProducts() {
    const topProducts = db.getTopSellingProducts();
    const topProductsList = document.getElementById('top-products-list');
    
    topProductsList.innerHTML = '';
    
    if (topProducts.length === 0) {
        topProductsList.innerHTML = '<tr><td colspan="4" class="text-center">لا توجد بيانات</td></tr>';
        return;
    }
    
    topProducts.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.sold || 0}</td>
            <td>${((product.sold || 0) * product.price).toFixed(2)} ر.س</td>
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
            <td>${sale.total.toFixed(2)} ر.س</td>
            <td>${getPaymentMethodName(sale.paymentMethod)}</td>
        `;
        recentSales.appendChild(row);
    });
}

// تحميل الإشعارات
function loadNotifications() {
    const notificationsContainer = document.getElementById('notifications-container');
    const lowStockProducts = db.getLowStockProducts();
    const expiredProducts = getExpiredProducts();
    
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
    }
    
    if (expiredProducts.length > 0) {
        const notification = document.createElement('div');
        notification.className = 'notification danger';
        notification.innerHTML = `
            <i class="fas fa-skull-crossbones"></i>
            <div>
                <h4>خطر: منتجات منتهية الصلاحية</h4>
                <p>هناك ${expiredProducts.length} منتج منتهي الصلاحية يجب إزالته من المخزون</p>
            </div>
        `;
        notificationsContainer.appendChild(notification);
    }
    
    if (lowStockProducts.length === 0 && expiredProducts.length === 0) {
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

// الحصول على المنتجات المنتهية الصلاحية
function getExpiredProducts() {
    const products = db.getAllProducts();
    const today = new Date();
    return products.filter(product => {
        if (!product.expiryDate) return false;
        return new Date(product.expiryDate) < today;
    });
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
        const status = product.quantity > (product.minQuantity || 5) ? 
            '<span class="badge badge-success">في المخزون</span>' : 
            '<span class="badge badge-danger">منخفض</span>';
            
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price.toFixed(2)} ر.س</td>
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
        const status = product.quantity > (product.minQuantity || 5) ? 
            '<span class="badge badge-success">في المخزون</span>' : 
            '<span class="badge badge-danger">منخفض</span>';
            
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price.toFixed(2)} ر.س</td>
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
        document.getElementById('product-cost').value = product.cost || '';
        document.getElementById('product-quantity').value = product.quantity;
        document.getElementById('min-quantity').value = product.minQuantity || 5;
        document.getElementById('product-barcode').value = product.barcode || '';
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
    const cost = parseFloat(document.getElementById('product-cost').value) || 0;
    const quantity = parseInt(document.getElementById('product-quantity').value);
    const minQuantity = parseInt(document.getElementById('min-quantity').value) || 5;
    const barcode = document.getElementById('product-barcode').value;
    const description = document.getElementById('product-description').value;
    
    if (!name || !category || isNaN(price) || isNaN(quantity)) {
        showToast('يرجى ملء جميع الحقول الإلزامية', 'error');
        return;
    }
    
    let productData = {
        name,
        category,
        price,
        cost,
        quantity,
        minQuantity,
        barcode,
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

// إعادة توريد منتج
function restockProduct(productId) {
    const product = db.getProductById(productId);
    if (product) {
        const newQuantity = prompt(`الكمية الحالية للمنتج ${product.name}: ${product.quantity}. أدخل الكمية الجديدة:`, product.quantity + 50);
        if (newQuantity !== null && !isNaN(newQuantity)) {
            product.quantity = parseInt(newQuantity);
            db.updateProduct(product);
            showToast('تم تحديث كمية المنتج بنجاح', 'success');
            loadDashboard();
        }
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
                <p>السعر: ${product.price.toFixed(2)} ر.س</p>
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
                <p>السعر: ${product.price.toFixed(2)} ر.س</p>
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
        const product = db.getProductByBarcode(barcode);
        
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
                <p>${product.price.toFixed(2)} ر.س</p>
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
    
    cartSubtotal.textContent = subtotal.toFixed(2) + ' ر.س';
    cartTax.textContent = tax.toFixed(2) + ' ر.س';
    cartTotal.textContent = total.toFixed(2) + ' ر.س';
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
    const customerName = document.getElementById('customer-name').value || 'زائر';
    
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
        paymentMethod: paymentMethod.value,
        customer: customerName
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
    const saleId = db.addSale(sale);
    
    // الحصول على بيانات الفاتورة الكاملة للطباعة
    const completeSale = db.getAllSales().find(s => s.id === saleId);
    
    // طباعة الفاتورة إذا كان الخيار مفعلاً
    if (db.getSettings().printReceipt) {
        printReceipt(completeSale);
    }
    
    // إعادة تعيين السلة
    clearCart();
    document.getElementById('customer-name').value = '';
    
    showToast('تمت عملية البيع بنجاح', 'success');
    updateDashboardStats();
}

// طباعة الفاتورة
function printReceipt(sale) {
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`
        <html>
        <head>
            <title>فاتورة البيع</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    direction: rtl; 
                    padding: 20px; 
                    max-width: 300px;
                    margin: 0 auto;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 20px; 
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }
                .store-name {
                    font-size: 18px;
                    font-weight: bold;
                }
                .details { 
                    margin-bottom: 20px; 
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 15px;
                }
                th, td { 
                    padding: 5px; 
                    text-align: right; 
                    border-bottom: 1px solid #ddd; 
                }
                .total { 
                    font-weight: bold; 
                    font-size: 1.1em; 
                    border-top: 2px solid #000;
                    padding-top: 10px;
                }
                .footer { 
                    margin-top: 30px; 
                    text-align: center; 
                    font-size: 0.9em;
                    color: #777;
                }
                .thank-you {
                    margin-top: 20px;
                    font-weight: bold;
                }
                @media print {
                    body {
                        width: 58mm;
                        margin: 0;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="store-name">${db.getSettings().storeName}</div>
                <div>فاتورة بيع</div>
                <div>${new Date(sale.date).toLocaleDateString('ar-SA')}</div>
                <div>${new Date(sale.date).toLocaleTimeString('ar-SA')}</div>
                <div>رقم الفاتورة: ${sale.id.slice(-6)}</div>
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
                                    <td>${item.price.toFixed(2)}</td>
                                    <td>${(item.quantity * item.price).toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="total">
                <table>
                    <tr>
                        <td>الإجمالي:</td>
                        <td>${sale.total.toFixed(2)} ر.س</td>
                    </tr>
                    <tr>
                        <td>طريقة الدفع:</td>
                        <td>${getPaymentMethodName(sale.paymentMethod)}</td>
                    </tr>
                </table>
            </div>
            
            <div class="footer">
                <div>شكراً لشرائك من متجرنا</div>
                <div class="thank-you">نتمنى لك يومًا سعيدًا</div>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 500);
                }
            </script>
        </body>
        </html>
    `);
    
    receiptWindow.document.close();
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
    generateSalesChart();
    generateInventoryReport();
    loadReportFilters();
}

// تحميل عوامل التصفية للتقرير
function loadReportFilters() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    document.getElementById('report-from').value = firstDay.toISOString().split('T')[0];
    document.getElementById('report-to').value = now.toISOString().split('T')[0];
}

// توليد رسم بياني للمبيعات
function generateSalesChart() {
    const ctx = document.getElementById('sales-chart').getContext('2d');
    
    // إذا كان هناك رسم بياني موجود، قم بتدميره أولاً
    if (currentChart) {
        currentChart.destroy();
    }
    
    // الحصول على بيانات المبيعات للشهر الحالي
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const sales = db.getSalesByDateRange(firstDay, now);
    
    // تجميع المبيعات حسب اليوم
    const salesByDay = {};
    const currentDate = new Date(firstDay);
    
    while (currentDate <= now) {
        const dateStr = currentDate.toISOString().split('T')[0];
        salesByDay[dateStr] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    sales.forEach(sale => {
        const saleDate = sale.date.split('T')[0];
        if (salesByDay.hasOwnProperty(saleDate)) {
            salesByDay[saleDate] += sale.total;
        }
    });
    
    const labels = Object.keys(salesByDay).map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('ar-SA', {day: 'numeric', month: 'short'});
    });
    
    const data = Object.values(salesByDay);
    
    // إنشاء الرسم البياني
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'المبيعات اليومية',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'تطور المبيعات الشهرية',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'المبلغ (ر.س)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'التاريخ'
                    }
                }
            }
        }
    });
}

// توليد تقرير المخزون
function generateInventoryReport() {
    const products = db.getAllProducts();
    const inventoryTable = document.getElementById('inventory-report');
    
    inventoryTable.innerHTML = '';
    
    if (products.length === 0) {
        inventoryTable.innerHTML = '<tr><td colspan="6" class="text-center">لا توجد منتجات مسجلة</td></tr>';
        return;
    }
    
    let totalValue = 0;
    let totalCost = 0;
    
    products.forEach(product => {
        const value = product.price * product.quantity;
        const cost = (product.cost || 0) * product.quantity;
        const profit = value - cost;
        
        totalValue += value;
        totalCost += cost;
        
        let status = '';
        if (product.quantity < (product.minQuantity || 5)) {
            status = '<span class="badge badge-danger">منخفض</span>';
        } else if (product.quantity < (product.minQuantity || 5) * 2) {
            status = '<span class="badge badge-warning">متوسط</span>';
        } else {
            status = '<span class="badge badge-success">جيد</span>';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td>${value.toFixed(2)} ر.س</td>
            <td>${profit.toFixed(2)} ر.س</td>
            <td>${status}</td>
        `;
        inventoryTable.appendChild(row);
    });
    
    // إضافة صف المجموع
    const footerRow = document.createElement('tr');
    footerRow.className = 'table-footer';
    footerRow.innerHTML = `
        <td colspan="2"><strong>الإجمالي:</strong></td>
        <td></td>
        <td><strong>${totalValue.toFixed(2)} ر.س</strong></td>
        <td><strong>${(totalValue - totalCost).toFixed(2)} ر.س</strong></td>
        <td></td>
    `;
    inventoryTable.appendChild(footerRow);
}

// توليد التقرير
function generateReport() {
    const period = document.getElementById('report-period').value;
    const fromDate = document.getElementById('report-from').value;
    const toDate = document.getElementById('report-to').value;
    
    if (!fromDate || !toDate) {
        showToast('يرجى تحديد تاريخ البداية والنهاية', 'error');
        return;
    }
    
    // في تطبيق حقيقي، سيتم استخدام هذه المعايير لتصفية البيانات
    showToast('تم توليد التقرير بنجاح', 'success');
    generateSalesChart();
    generateInventoryReport();
}

// تهيئة ماسح الباركود
function initBarcodeScanner() {
    const video = document.getElementById('barcode-scanner');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        document.getElementById('enable-camera').style.display = 'block';
    } else {
        document.getElementById('enable-camera').style.display = 'none';
    }
}

// بدء مسح الباركود
function startBarcodeScanner() {
    const video = document.getElementById('barcode-scanner');
    const scannerContainer = document.getElementById('scanner-container');
    
    scannerContainer.style.display = 'block';
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(function(stream) {
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        video.play();
        requestAnimationFrame(tick);
    })
    .catch(function(err) {
        showToast('تعذر الوصول إلى الكاميرا: ' + err.message, 'error');
    });
    
    function tick() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });
            
            if (code) {
                const product = db.getProductByBarcode(code.data);
                if (product) {
                    addToCart(product);
                    showToast('تم مسح المنتج: ' + product.name, 'success');
                } else {
                    showToast('المنتج غير موجود', 'error');
                }
                stopBarcodeScanner();
            }
        }
        requestAnimationFrame(tick);
    }
}

// إيقاف مسح الباركود
function stopBarcodeScanner() {
    const video = document.getElementById('barcode-scanner');
    const scannerContainer = document.getElementById('scanner-container');
    
    scannerContainer.style.display = 'none';
    
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
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
