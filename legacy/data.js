// Data Management System for White-Labeled Business Management App

// Storage Key
const STORAGE_KEY = 'wlbm_app_data_v2';

// Application State
const AppData = {
    // Users (multi-user support)
    users: [],

    // Current User Session
    currentUser: null,

    // Product Categories (shared / default)
    defaultCategories: [
        { id: 1, name: "Category 1", description: "First product category", icon: "📦" },
        { id: 2, name: "Category 2", description: "Second product category", icon: "🛍️" },
        { id: 3, name: "Category 3", description: "Third product category", icon: "📋" }
    ],

    // Counters for ID generation
    counters: {
        users: 1
    }
};

// ─────────────────────────────────────────────────────────────
//  Helper: return the data store for the current logged-in user
// ─────────────────────────────────────────────────────────────
function getUserStore() {
    if (!AppData.currentUser) return null;
    const user = AppData.users.find(u => u.id === AppData.currentUser.id);
    return user ? user.store : null;
}

function getDefaultUserStore() {
    return {
        // Business Information
        businessInfo: {
            name: "Your Business Name",
            proprietor: "Business Owner",
            specialization: "Your Business Type",
            phone: "",
            email: "",
            address: "",
            website: "",
            gst: "",
            logo: "",
            setupComplete: false
        },
        // Bank Details
        bankDetails: {
            bankName: "",
            accountNumber: "",
            accountHolderName: "",
            ifscCode: ""
        },
        bankQR: "", // base64 image string
        // Product Categories
        categories: [
            { id: 1, name: "Category 1", description: "First product category", icon: "📦" },
            { id: 2, name: "Category 2", description: "Second product category", icon: "🛍️" },
            { id: 3, name: "Category 3", description: "Third product category", icon: "📋" }
        ],
        // Products, Suppliers, Customers, Transactions
        products: [],
        suppliers: [],
        customers: [],
        transactions: [],
        // Counters
        counters: {
            products: 1,
            suppliers: 1,
            customers: 1,
            categories: 4,
            transactions: 1,
            invoicePurchase: 1,
            invoiceSale: 1
        }
    };
}

// ─────────────────────────────────────────────────────────────
//  Data Manager
// ─────────────────────────────────────────────────────────────
const DataManager = {
    // Initialize data from localStorage
    init() {
        this.loadData();
    },

    loadData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                AppData.users = Array.isArray(parsed.users) ? parsed.users : [];
                AppData.currentUser = parsed.currentUser || null;
                AppData.counters = parsed.counters || { users: (AppData.users.length + 1) };
            }
        } catch (e) {
            console.warn('Failed to load from localStorage. Using defaults', e);
        }
    },

    saveData() {
        try {
            const toSave = {
                users: AppData.users,
                currentUser: AppData.currentUser,
                counters: AppData.counters
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        } catch (e) {
            console.warn('Failed to save to localStorage', e);
        }
    },

    // ──────────────── User / Auth ────────────────

    registerUser(data) {
        // Check duplicate username
        if (AppData.users.find(u => u.username === data.username)) {
            throw new Error('Username already exists. Please choose a different username.');
        }
        // Check duplicate email
        if (AppData.users.find(u => u.email === data.email)) {
            throw new Error('Email already registered. Please use a different email.');
        }

        const newUser = {
            id: AppData.counters.users++,
            businessName: data.businessName,
            ownerName: data.ownerName,
            email: data.email,
            mobile: data.mobile,
            username: data.username,
            password: data.password,
            role: 'user',
            createdAt: new Date().toISOString(),
            store: getDefaultUserStore()
        };

        // Pre-populate businessInfo from signup data
        newUser.store.businessInfo.name = data.businessName;
        newUser.store.businessInfo.proprietor = data.ownerName;
        newUser.store.businessInfo.email = data.email;
        newUser.store.businessInfo.phone = data.mobile;

        AppData.users.push(newUser);
        this.saveData();
        return newUser;
    },

    authenticateUser(username, password) {
        const user = AppData.users.find(u => u.username === username && u.password === password);
        if (user) {
            AppData.currentUser = { id: user.id, username: user.username, email: user.email, role: user.role };
            this.saveData();
            return user;
        }
        return null;
    },

    getCurrentUser() {
        return AppData.currentUser;
    },

    logout() {
        AppData.currentUser = null;
        this.saveData();
    },

    // ──────────────── Business Info ────────────────

    updateBusinessInfo(info) {
        const store = getUserStore();
        if (!store) return;
        store.businessInfo = { ...store.businessInfo, ...info };
        this.saveData();
    },

    getBusinessInfo() {
        const store = getUserStore();
        return store ? store.businessInfo : {};
    },

    // ──────────────── Bank Details ────────────────

    getBankDetails() {
        const store = getUserStore();
        return store ? store.bankDetails : { bankName: '', accountNumber: '', accountHolderName: '', ifscCode: '' };
    },

    updateBankDetails(details) {
        const store = getUserStore();
        if (!store) return;
        store.bankDetails = { ...store.bankDetails, ...details };
        this.saveData();
    },

    getBankQR() {
        const store = getUserStore();
        return store ? store.bankQR : '';
    },

    updateBankQR(base64Image) {
        const store = getUserStore();
        if (!store) return;
        store.bankQR = base64Image;
        this.saveData();
    },

    // ──────────────── Categories ────────────────

    getCategories() {
        const store = getUserStore();
        return store ? store.categories : [];
    },

    addCategory(category) {
        const store = getUserStore();
        if (!store) return null;
        const newCategory = {
            id: store.counters.categories++,
            ...category,
            createdAt: new Date().toISOString()
        };
        store.categories.push(newCategory);
        this.saveData();
        return newCategory;
    },

    updateCategory(id, updates) {
        const store = getUserStore();
        if (!store) return null;
        const index = store.categories.findIndex(c => c.id === id);
        if (index !== -1) {
            store.categories[index] = { ...store.categories[index], ...updates };
            this.saveData();
            return store.categories[index];
        }
        return null;
    },

    deleteCategory(id) {
        const store = getUserStore();
        if (!store) return false;
        const productsUsingCategory = store.products.filter(p => p.categoryId === id);
        if (productsUsingCategory.length > 0) {
            throw new Error('Cannot delete category that has products assigned to it');
        }
        const index = store.categories.findIndex(c => c.id === id);
        if (index !== -1) {
            store.categories.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    },

    getCategory(id) {
        const store = getUserStore();
        return store ? store.categories.find(c => c.id === id) : null;
    },

    // ──────────────── Products ────────────────

    getProducts() {
        const store = getUserStore();
        return store ? store.products : [];
    },

    addProduct(product) {
        const store = getUserStore();
        if (!store) return null;
        const newProduct = {
            id: store.counters.products++,
            ...product,
            totalPurchased: product.currentStock || 0,
            totalSold: 0,
            createdAt: new Date().toISOString()
        };
        store.products.push(newProduct);
        this.saveData();
        return newProduct;
    },

    updateProduct(id, updates) {
        const store = getUserStore();
        if (!store) return null;
        const index = store.products.findIndex(p => p.id === id);
        if (index !== -1) {
            store.products[index] = { ...store.products[index], ...updates };
            this.saveData();
            return store.products[index];
        }
        return null;
    },

    deleteProduct(id) {
        const store = getUserStore();
        if (!store) return false;
        const index = store.products.findIndex(p => p.id === id);
        if (index !== -1) {
            store.products.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    },

    getProduct(id) {
        const store = getUserStore();
        return store ? store.products.find(p => p.id === id) : null;
    },

    updateProductStock(id, quantity, operation = 'add') {
        const product = this.getProduct(id);
        if (product) {
            if (operation === 'add') {
                product.currentStock += quantity;
                product.totalPurchased += quantity;
            } else if (operation === 'subtract') {
                product.currentStock -= quantity;
                product.totalSold += quantity;
            }
            this.saveData();
            return product;
        }
        return null;
    },

    // ──────────────── Suppliers ────────────────

    getSuppliers() {
        const store = getUserStore();
        return store ? store.suppliers : [];
    },

    addSupplier(supplier) {
        const store = getUserStore();
        if (!store) return null;
        const newSupplier = {
            id: store.counters.suppliers++,
            ...supplier,
            totalPurchases: 0,
            lastPurchase: "",
            createdAt: new Date().toISOString()
        };
        store.suppliers.push(newSupplier);
        this.saveData();
        return newSupplier;
    },

    updateSupplier(id, updates) {
        const store = getUserStore();
        if (!store) return null;
        const index = store.suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
            store.suppliers[index] = { ...store.suppliers[index], ...updates };
            this.saveData();
            return store.suppliers[index];
        }
        return null;
    },

    deleteSupplier(id) {
        const store = getUserStore();
        if (!store) return false;
        const index = store.suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
            store.suppliers.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    },

    getSupplier(id) {
        const store = getUserStore();
        return store ? store.suppliers.find(s => s.id === id) : null;
    },

    // ──────────────── Customers ────────────────

    getCustomers() {
        const store = getUserStore();
        return store ? store.customers : [];
    },

    addCustomer(customer) {
        const store = getUserStore();
        if (!store) return null;
        const newCustomer = {
            id: store.counters.customers++,
            ...customer,
            totalPurchases: 0,
            lastPurchase: "",
            createdAt: new Date().toISOString()
        };
        store.customers.push(newCustomer);
        this.saveData();
        return newCustomer;
    },

    updateCustomer(id, updates) {
        const store = getUserStore();
        if (!store) return null;
        const index = store.customers.findIndex(c => c.id === id);
        if (index !== -1) {
            store.customers[index] = { ...store.customers[index], ...updates };
            this.saveData();
            return store.customers[index];
        }
        return null;
    },

    deleteCustomer(id) {
        const store = getUserStore();
        if (!store) return false;
        const index = store.customers.findIndex(c => c.id === id);
        if (index !== -1) {
            store.customers.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    },

    getCustomer(id) {
        const store = getUserStore();
        return store ? store.customers.find(c => c.id === id) : null;
    },

    // ──────────────── Transactions ────────────────

    getTransactions() {
        const store = getUserStore();
        return store ? store.transactions : [];
    },

    addTransaction(transaction) {
        const store = getUserStore();
        if (!store) return null;
        const newTransaction = {
            id: store.counters.transactions++,
            ...transaction,
            createdAt: new Date().toISOString()
        };

        if (transaction.type === 'purchase') {
            newTransaction.invoiceNumber = `PUR-${String(store.counters.invoicePurchase++).padStart(3, '0')}`;
        } else {
            newTransaction.invoiceNumber = `SAL-${String(store.counters.invoiceSale++).padStart(3, '0')}`;
        }

        store.transactions.push(newTransaction);
        this.processTransactionEffects(newTransaction);
        this.saveData();
        return newTransaction;
    },

    processTransactionEffects(transaction) {
        transaction.products.forEach(item => {
            if (transaction.type === 'purchase') {
                this.updateProductStock(item.productId, item.quantity, 'add');
            } else {
                this.updateProductStock(item.productId, item.quantity, 'subtract');
            }
        });

        if (transaction.type === 'purchase') {
            const supplier = this.getSupplier(transaction.partyId);
            if (supplier) {
                supplier.totalPurchases += transaction.totalAmount;
                supplier.lastPurchase = transaction.date;
            }
        } else {
            const customer = this.getCustomer(transaction.partyId);
            if (customer) {
                customer.totalPurchases += transaction.totalAmount;
                customer.lastPurchase = transaction.date;
            }
        }
    },

    getTransaction(id) {
        const store = getUserStore();
        return store ? store.transactions.find(t => t.id === id) : null;
    },

    // ──────────────── Analytics ────────────────

    getBusinessMetrics() {
        const products = this.getProducts();
        const transactions = this.getTransactions();

        const totalInventoryValue = products.reduce((sum, p) => sum + (p.currentStock * p.purchasePrice), 0);
        const salesTransactions = transactions.filter(t => t.type === 'sale');
        const totalSalesRevenue = salesTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalPurchases = transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.totalAmount, 0);
        const totalProfit = totalSalesRevenue - totalPurchases;
        const lowStockItems = products.filter(p => p.currentStock <= p.reorderLevel).length;
        const averageProfitMargin = totalSalesRevenue > 0 ? ((totalProfit / totalSalesRevenue) * 100).toFixed(2) : 0;

        return {
            totalInventoryValue,
            totalSalesRevenue,
            totalProfit,
            lowStockItems,
            totalProducts: products.length,
            totalSuppliers: this.getSuppliers().length,
            totalCustomers: this.getCustomers().length,
            averageProfitMargin: parseFloat(averageProfitMargin)
        };
    },

    getSalesData(period = '7d') {
        const transactions = this.getTransactions().filter(t => t.type === 'sale');
        const now = new Date();
        const periodStart = new Date();

        switch (period) {
            case '7d': periodStart.setDate(now.getDate() - 7); break;
            case '30d': periodStart.setDate(now.getDate() - 30); break;
            case '90d': periodStart.setDate(now.getDate() - 90); break;
            default: periodStart.setDate(now.getDate() - 7);
        }

        return transactions.filter(t => new Date(t.date) >= periodStart)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    getTopProducts(limit = 5) {
        return this.getProducts()
            .sort((a, b) => (b.totalSold * b.salePrice) - (a.totalSold * a.salePrice))
            .slice(0, limit);
    },

    getLowStockProducts() {
        return this.getProducts().filter(p => p.currentStock <= p.reorderLevel);
    },

    getRecentTransactions(limit = 10) {
        return this.getTransactions()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    },

    generateInvoiceNumber(type) {
        const store = getUserStore();
        if (!store) return '';
        if (type === 'purchase') {
            return `PUR-${String(store.counters.invoicePurchase).padStart(3, '0')}`;
        } else {
            return `SAL-${String(store.counters.invoiceSale).padStart(3, '0')}`;
        }
    },

    // ──────────────── Search ────────────────

    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return this.getProducts().filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.sku.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery)
        );
    },

    searchSuppliers(query) {
        const lowerQuery = query.toLowerCase();
        return this.getSuppliers().filter(s =>
            s.name.toLowerCase().includes(lowerQuery) ||
            (s.contactPerson || '').toLowerCase().includes(lowerQuery) ||
            (s.speciality || '').toLowerCase().includes(lowerQuery)
        );
    },

    searchCustomers(query) {
        const lowerQuery = query.toLowerCase();
        return this.getCustomers().filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            (c.phone || '').includes(query) ||
            (c.email || '').toLowerCase().includes(lowerQuery)
        );
    },

    // ──────────────── Validation ────────────────

    validateProduct(product) {
        const errors = [];
        if (!product.name || product.name.trim().length === 0) errors.push('Product name is required');
        if (!product.sku || product.sku.trim().length === 0) errors.push('SKU is required');
        const existingProduct = this.getProducts().find(p => p.sku === product.sku && p.id !== product.id);
        if (existingProduct) errors.push('SKU already exists');
        if (!product.category || product.category.trim().length === 0) errors.push('Category is required');
        if (product.purchasePrice < 0) errors.push('Purchase price must be positive');
        if (product.salePrice < 0) errors.push('Sale price must be positive');
        if (product.currentStock < 0) errors.push('Current stock cannot be negative');
        return errors;
    },

    validateSupplier(supplier) {
        const errors = [];
        if (!supplier.name || supplier.name.trim().length === 0) errors.push('Supplier name is required');
        if (supplier.email && !this.isValidEmail(supplier.email)) errors.push('Invalid email format');
        return errors;
    },

    validateCustomer(customer) {
        const errors = [];
        if (!customer.name || customer.name.trim().length === 0) errors.push('Customer name is required');
        if (customer.email && !this.isValidEmail(customer.email)) errors.push('Invalid email format');
        return errors;
    },

    validateCategory(category) {
        const errors = [];
        if (!category.name || category.name.trim().length === 0) errors.push('Category name is required');
        const existingCategory = this.getCategories().find(c => c.name === category.name && c.id !== category.id);
        if (existingCategory) errors.push('Category name already exists');
        return errors;
    },

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // ──────────────── Export / Import ────────────────

    exportData() {
        const store = getUserStore();
        return {
            businessInfo: store ? store.businessInfo : {},
            categories: store ? store.categories : [],
            products: store ? store.products : [],
            suppliers: store ? store.suppliers : [],
            customers: store ? store.customers : [],
            transactions: store ? store.transactions : [],
            exportedAt: new Date().toISOString()
        };
    }
};

// Initialize data when script loads
DataManager.init();