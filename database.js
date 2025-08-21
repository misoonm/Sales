// إدارة قاعدة البيانات المحلية المتطورة
class Database {
    constructor() {
        this.initialize();
    }
    
    // تهيئة قاعدة البيانات
    initialize() {
        if (!localStorage.getItem('appInitialized')) {
            this.resetDatabase();
            localStorage.setItem('appInitialized', 'true');
        }
    }
    
    // إعادة تعيين قاعدة البيانات
    resetDatabase() {
        const sampleProducts = [
            { 
                id: '1', 
                name: 'أرز بسمتي', 
                category: 'غذائية', 
                price: 25, 
                cost: 20,
                quantity: 50, 
                minQuantity: 10,
                expiryDate: '2023-12-31',
                description: 'أرز بسمتي عالي الجودة',
                barcode: '1234567890123',
                sold: 150
            },
            { 
                id: '2', 
                name: 'سكر', 
                category: 'غذائية', 
                price: 15, 
                cost: 12,
                quantity: 30, 
                minQuantity: 5,
                expiryDate: '2024-06-30',
                description: 'سكر أبيض ناعم',
                barcode: '1234567890124',
                sold: 120
            },
            { 
                id: '3', 
                name: 'قميص رجالي', 
                category: 'ملابس', 
                price: 80, 
                cost: 50,
                quantity: 20, 
                minQuantity: 3,
                size: 'L', 
                color: 'أزرق',
                description: 'قميص قطني مريح',
                barcode: '1234567890125',
                sold: 95
            },
            { 
                id: '4', 
                name: 'بنطلون جينز', 
                category: 'ملابس', 
                price: 120, 
                cost: 80,
                quantity: 15, 
                minQuantity: 3,
                size: '32', 
                color: 'أسود',
                description: 'جينز عالي الجودة',
                barcode: '1234567890126',
                sold: 80
            },
            { 
                id: '5', 
                name: 'بنزين 95', 
                category: 'محروقات', 
                price: 2.18, 
                cost: 1.80,
                quantity: 10000,
                minQuantity: 1000,
                description: 'وقود سيارات',
                barcode: '1234567890127',
                sold: 75
            }
        ];
        localStorage.setItem('products', JSON.stringify(sampleProducts));
        
        // إنشاء مبيعات نموذجية
        const sampleSales = [
            {
                id: '1',
                date: new Date(Date.now() - 86400000).toISOString(),
                items: [
                    { productId: '1', quantity: 2, price: 25 },
                    { productId: '2', quantity: 3, price: 15 }
                ],
                total: 95,
                paymentMethod: 'cash',
                customer: 'زائر'
            },
            {
                id: '2',
                date: new Date(Date.now() - 172800000).toISOString(),
                items: [
                    { productId: '3', quantity: 1, price: 80 },
                    { productId: '5', quantity: 20, price: 2.18 }
                ],
                total: 123.6,
                paymentMethod: 'card',
                customer: 'زائر'
            }
        ];
        localStorage.setItem('sales', JSON.stringify(sampleSales));
        
        const settings = {
            storeName: 'متجري',
            currency: 'ر.س',
            taxRate: 15,
            printReceipt: true,
            barcodeScanner: true
        };
        localStorage.setItem('settings', JSON.stringify(settings));
        
        localStorage.setItem('categories', JSON.stringify([
            'غذائية', 'ملابس', 'إلكترونيات', 'منزلية', 'محروقات', 'أخرى'
        ]));
    }
    
    // الحصول على جميع المنتجات
    getAllProducts() {
        return JSON.parse(localStorage.getItem('products')) || [];
    }
    
    // حفظ المنتجات
    saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    // الحصول على المنتج بواسطة ID
    getProductById(id) {
        const products = this.getAllProducts();
        return products.find(product => product.id === id);
    }
    
    // الحصول على المنتج بواسطة الباركود
    getProductByBarcode(barcode) {
        const products = this.getAllProducts();
        return products.find(product => product.barcode === barcode);
    }
    
    // إضافة منتج جديد
    addProduct(product) {
        const products = this.getAllProducts();
        product.id = Date.now().toString();
        product.createdAt = new Date().toISOString();
        if (!product.sold) product.sold = 0;
        products.push(product);
        this.saveProducts(products);
        return product.id;
    }
    
    // تحديث منتج موجود
    updateProduct(updatedProduct) {
        const products = this.getAllProducts();
        const index = products.findIndex(product => product.id === updatedProduct.id);
        
        if (index !== -1) {
            products[index] = {...products[index], ...updatedProduct};
            products[index].updatedAt = new Date().toISOString();
            this.saveProducts(products);
            return true;
        }
        
        return false;
    }
    
    // حذف منتج
    deleteProduct(id) {
        const products = this.getAllProducts();
        const filteredProducts = products.filter(product => product.id !== id);
        this.saveProducts(filteredProducts);
        return true;
    }
    
    // الحصول على جميع المبيعات
    getAllSales() {
        return JSON.parse(localStorage.getItem('sales')) || [];
    }
    
    // حفظ المبيعات
    saveSales(sales) {
        localStorage.setItem('sales', JSON.stringify(sales));
    }
    
    // إضافة عملية بيع جديدة
    addSale(sale) {
        const sales = this.getAllSales();
        sale.id = Date.now().toString();
        sale.date = new Date().toISOString();
        sales.push(sale);
        this.saveSales(sales);
        
        // تحديث مخزون المنتجات وكمية المبيعات
        sale.items.forEach(item => {
            this.decreaseProductQuantity(item.productId, item.quantity);
            this.increaseProductSold(item.productId, item.quantity);
        });
        
        return sale.id;
    }
    
    // تقليل كمية المنتج
    decreaseProductQuantity(productId, quantity) {
        const products = this.getAllProducts();
        const index = products.findIndex(p => p.id === productId);
        
        if (index !== -1) {
            products[index].quantity -= quantity;
            if (products[index].quantity < 0) products[index].quantity = 0;
            this.saveProducts(products);
        }
    }
    
    // زيادة كمية المبيعات للمنتج
    increaseProductSold(productId, quantity) {
        const products = this.getAllProducts();
        const index = products.findIndex(p => p.id === productId);
        
        if (index !== -1) {
            products[index].sold += quantity;
            this.saveProducts(products);
        }
    }
    
    // الحصول على الإعدادات
    getSettings() {
        return JSON.parse(localStorage.getItem('settings')) || {};
    }
    
    // حفظ الإعدادات
    saveSettings(settings) {
        localStorage.setItem('settings', JSON.stringify(settings));
    }
    
    // البحث عن المنتجات
    searchProducts(query) {
        const products = this.getAllProducts();
        if (!query) return products;
        
        const queryLower = query.toLowerCase();
        return products.filter(product => 
            product.name.toLowerCase().includes(queryLower) || 
            product.category.toLowerCase().includes(queryLower) ||
            (product.description && product.description.toLowerCase().includes(queryLower)) ||
            (product.barcode && product.barcode.includes(query))
        );
    }
    
    // الحصول على المنتجات منخفضة المخزون
    getLowStockProducts(threshold = null) {
        const products = this.getAllProducts();
        return products.filter(p => {
            const minQty = threshold !== null ? threshold : (p.minQuantity || 5);
            return p.quantity < minQty;
        });
    }
    
    // الحصول على المبيعات ضمن نطاق تاريخ
    getSalesByDateRange(fromDate, toDate) {
        const sales = this.getAllSales();
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= new Date(fromDate) && saleDate <= new Date(toDate);
        });
    }
    
    // الحصول على المنتجات الأكثر مبيعاً
    getTopSellingProducts(limit = 5) {
        const products = this.getAllProducts();
        return products.sort((a, b) => b.sold - a.sold).slice(0, limit);
    }
    
    // الحصول على الإحصائيات
    getStats() {
        const products = this.getAllProducts();
        const sales = this.getAllSales();
        
        const totalProducts = products.length;
        const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalItemsSold = products.reduce((sum, product) => sum + (product.sold || 0), 0);
        const lowStockCount = this.getLowStockProducts().length;
        
        // حساب إجمالي قيمة المخزون
        const inventoryValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        
        // حساب التكلفة الإجمالية للمخزون
        const inventoryCost = products.reduce((sum, product) => sum + ((product.cost || 0) * product.quantity), 0);
        
        // حساب الأرباح المحتملة
        const potentialProfit = inventoryValue - inventoryCost;
        
        return {
            totalProducts,
            totalSales,
            totalItemsSold,
            lowStockCount,
            inventoryValue,
            inventoryCost,
            potentialProfit
        };
    }
    
    // استيراد البيانات
    importData(data) {
        if (data.products) {
            localStorage.setItem('products', JSON.stringify(data.products));
        }
        if (data.sales) {
            localStorage.setItem('sales', JSON.stringify(data.sales));
        }
        if (data.settings) {
            localStorage.setItem('settings', JSON.stringify(data.settings));
        }
    }
    
    // تصدير البيانات
    exportData() {
        return {
            products: this.getAllProducts(),
            sales: this.getAllSales(),
            settings: this.getSettings()
        };
    }
    
    // نسخ احتياطي للبيانات
    backupData() {
        const backup = this.exportData();
        localStorage.setItem('backup_' + Date.now(), JSON.stringify(backup));
    }
    
    // استعادة النسخ الاحتياطي
    restoreData(backupKey) {
        const backup = localStorage.getItem(backupKey);
        if (backup) {
            this.importData(JSON.parse(backup));
            return true;
        }
        return false;
    }
}

// إنشاء instance من قاعدة البيانات
const db = new Database();
