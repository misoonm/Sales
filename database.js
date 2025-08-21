// إدارة قاعدة البيانات المحلية
class Database {
    constructor() {
        this.initialize();
    }
    
    // تهيئة قاعدة البيانات
    initialize() {
        if (!localStorage.getItem('products')) {
            const sampleProducts = [
                { 
                    id: '1', 
                    name: 'أرز بسمتي', 
                    category: 'غذائية', 
                    price: 25, 
                    quantity: 50, 
                    expiryDate: '2023-12-31',
                    description: 'أرز بسمتي عالي الجودة'
                },
                { 
                    id: '2', 
                    name: 'سكر', 
                    category: 'غذائية', 
                    price: 15, 
                    quantity: 30, 
                    expiryDate: '2024-06-30',
                    description: 'سكر أبيض ناعم'
                },
                { 
                    id: '3', 
                    name: 'قميص رجالي', 
                    category: 'ملابس', 
                    price: 80, 
                    quantity: 20, 
                    size: 'L', 
                    color: 'أزرق',
                    description: 'قميص قطني مريح'
                },
                { 
                    id: '4', 
                    name: 'بنطلون جينز', 
                    category: 'ملابس', 
                    price: 120, 
                    quantity: 15, 
                    size: '32', 
                    color: 'أسود',
                    description: 'جينز عالي الجودة'
                },
                { 
                    id: '5', 
                    name: 'بنزين 95', 
                    category: 'محروقات', 
                    price: 2.18, 
                    quantity: 10000,
                    description: 'وقود سيارات'
                }
            ];
            localStorage.setItem('products', JSON.stringify(sampleProducts));
        }
        
        if (!localStorage.getItem('sales')) {
            localStorage.setItem('sales', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('settings')) {
            const settings = {
                storeName: 'متجري',
                currency: 'ر.ي',
                taxRate: 15
            };
            localStorage.setItem('settings', JSON.stringify(settings));
        }
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
    
    // إضافة منتج جديد
    addProduct(product) {
        const products = this.getAllProducts();
        product.id = Date.now().toString();
        product.createdAt = new Date().toISOString();
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
        
        // تحديث مخزون المنتجات
        sale.items.forEach(item => {
            this.decreaseProductQuantity(item.productId, item.quantity);
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
        
        return products.filter(product => 
            product.name.includes(query) || 
            product.category.includes(query) ||
            product.description.includes(query)
        );
    }
    
    // الحصول على المنتجات منخفضة المخزون
    getLowStockProducts(threshold = 10) {
        const products = this.getAllProducts();
        return products.filter(p => p.quantity < threshold);
    }
    
    // الحصول على المبيعات ضمن نطاق تاريخ
    getSalesByDateRange(fromDate, toDate) {
        const sales = this.getAllSales();
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= new Date(fromDate) && saleDate <= new Date(toDate);
        });
    }
}

// إنشاء instance من قاعدة البيانات
const db = new Database();
