// Main Application Controller

const AppManager = {
    initialized: false,
    init() {
        if (this.initialized) return;
        DataManager.init();
        ComponentsManager.init();
        AuthManager.init();
        DashboardManager.init();
        InventoryManager.init();
        SupplierManager.init();
        CustomerManager.init();
        TransactionManager.init();
        ReportManager.init();
        SettingsManager.init();
        this.setupGlobalEvents();
        this.checkLoginStatus();
        this.initialized = true;
    },

    setupGlobalEvents() {
        const logoutBtn = DOM.get('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => AuthManager.logout());
        const settingsBtn = DOM.get('settingsBtn');
        if (settingsBtn) settingsBtn.addEventListener('click', () => NavigationComponent.showView('settings'));
    },

    checkLoginStatus() {
        const currentUser = DataManager.getCurrentUser();
        if (currentUser) {
            this.showMainApp();
        } else {
            this.showLanding();
        }
    },

    showLanding() {
        DOM.hide('loginScreen');
        DOM.hide('signupScreen');
        DOM.hide('setupWizard');
        DOM.hide('mainApp');
        DOM.show('landingScreen');
    },

    showLoginScreen() {
        DOM.hide('landingScreen');
        DOM.hide('signupScreen');
        DOM.hide('setupWizard');
        DOM.hide('mainApp');
        DOM.show('loginScreen');
    },

    showSignupScreen() {
        DOM.hide('landingScreen');
        DOM.hide('loginScreen');
        DOM.hide('setupWizard');
        DOM.hide('mainApp');
        DOM.show('signupScreen');
    },

    showSetupWizard() {
        DOM.hide('landingScreen');
        DOM.hide('loginScreen');
        DOM.hide('signupScreen');
        DOM.hide('mainApp');
        DOM.show('setupWizard');
        // Pre-fill from current user
        const info = DataManager.getBusinessInfo();
        if (info.name) DOM.get('businessName').value = info.name;
        if (info.proprietor) DOM.get('proprietorName').value = info.proprietor;
        if (info.phone) DOM.get('businessPhone').value = info.phone;
        if (info.email) DOM.get('businessEmail').value = info.email;
    },

    showMainApp() {
        DOM.hide('landingScreen');
        DOM.hide('loginScreen');
        DOM.hide('signupScreen');
        DOM.hide('setupWizard');
        DOM.show('mainApp');
        this.updateBusinessBranding();
        const lastView = localStorage.getItem('wlbm_last_view') || 'dashboard';
        NavigationComponent.showView(lastView);
    },

    updateBusinessBranding() {
        const businessInfo = DataManager.getBusinessInfo();
        const el = DOM.get('businessNameDisplay');
        if (el) el.textContent = businessInfo.name || 'Your Business Name';
        const typeEl = DOM.get('businessTypeDisplay');
        if (typeEl) typeEl.textContent = businessInfo.specialization || 'Business Management System';
        document.title = `${businessInfo.name || 'BizManager'} - Business Management`;
        // Show current user name
        const cu = DataManager.getCurrentUser();
        const badge = DOM.get('userDisplayName');
        if (badge && cu) badge.textContent = cu.username;
    }
};

// ─── Auth Manager ───────────────────────────────────────────

const AuthManager = {
    init() {
        // Landing page buttons
        ['landingLoginBtn','landingLoginBtn2'].forEach(id => {
            const btn = DOM.get(id);
            if (btn) btn.addEventListener('click', () => AppManager.showLoginScreen());
        });
        ['landingSignupBtn','landingGetStartedBtn'].forEach(id => {
            const btn = DOM.get(id);
            if (btn) btn.addEventListener('click', () => AppManager.showSignupScreen());
        });

        // Login form
        const loginForm = DOM.get('loginForm');
        if (loginForm) loginForm.addEventListener('submit', e => { e.preventDefault(); this.handleLogin(); });

        const goToSignup = DOM.get('goToSignupBtn');
        if (goToSignup) goToSignup.addEventListener('click', () => AppManager.showSignupScreen());

        const loginBack = DOM.get('loginBackBtn');
        if (loginBack) loginBack.addEventListener('click', () => AppManager.showLanding());

        // Signup form
        const signupForm = DOM.get('signupForm');
        if (signupForm) signupForm.addEventListener('submit', e => { e.preventDefault(); this.handleSignup(); });

        const goToLogin = DOM.get('goToLoginBtn');
        if (goToLogin) goToLogin.addEventListener('click', () => AppManager.showLoginScreen());

        const signupBack = DOM.get('signupBackBtn');
        if (signupBack) signupBack.addEventListener('click', () => AppManager.showLanding());

        // Toggle password visibility
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = DOM.get(btn.dataset.target);
                if (input) {
                    input.type = input.type === 'password' ? 'text' : 'password';
                    btn.textContent = input.type === 'password' ? '👁️' : '🙈';
                }
            });
        });

        // Password strength
        const pwdInput = DOM.get('signupPassword');
        if (pwdInput) pwdInput.addEventListener('input', () => this.updatePasswordStrength(pwdInput.value));
    },

    updatePasswordStrength(pwd) {
        const bar = DOM.get('strengthBar');
        const label = DOM.get('strengthLabel');
        if (!bar || !label) return;
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        const levels = [
            { pct: '20%', color: '#ef4444', text: 'Very Weak' },
            { pct: '40%', color: '#f97316', text: 'Weak' },
            { pct: '60%', color: '#f59e0b', text: 'Fair' },
            { pct: '80%', color: '#22c55e', text: 'Good' },
            { pct: '100%', color: '#10b981', text: 'Strong' }
        ];
        const lvl = levels[Math.min(score, 4)];
        bar.style.width = pwd.length ? lvl.pct : '0%';
        bar.style.background = lvl.color;
        label.textContent = pwd.length ? lvl.text : '';
    },

    clearErrors() {
        document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    },

    setError(id, msg) {
        const el = DOM.get(id);
        if (el) el.textContent = msg;
    },

    handleLogin() {
        this.clearErrors();
        const username = (DOM.get('loginUsername')?.value || '').trim();
        const password = (DOM.get('loginPassword')?.value || '').trim();
        let valid = true;

        if (!username) { this.setError('loginUsernameError', 'Username is required'); valid = false; }
        if (!password) { this.setError('loginPasswordError', 'Password is required'); valid = false; }
        if (!valid) return;

        const user = DataManager.authenticateUser(username, password);
        if (user) {
            UI.showNotification('Login successful! Welcome back.', 'success');
            const businessInfo = DataManager.getBusinessInfo();
            if (!businessInfo.setupComplete) {
                AppManager.showSetupWizard();
            } else {
                AppManager.showMainApp();
            }
        } else {
            UI.showNotification('Invalid username or password', 'error');
            this.setError('loginPasswordError', 'Invalid username or password');
        }
    },

    handleSignup() {
        this.clearErrors();
        const businessName = (DOM.get('signupBusinessName')?.value || '').trim();
        const ownerName = (DOM.get('signupOwnerName')?.value || '').trim();
        const email = (DOM.get('signupEmail')?.value || '').trim();
        const mobile = (DOM.get('signupMobile')?.value || '').trim();
        const username = (DOM.get('signupUsername')?.value || '').trim();
        const password = (DOM.get('signupPassword')?.value || '');
        const confirmPassword = (DOM.get('signupConfirmPassword')?.value || '');

        let valid = true;
        if (!businessName) { this.setError('signupBusinessNameError', 'Business name is required'); valid = false; }
        if (!ownerName) { this.setError('signupOwnerNameError', 'Owner name is required'); valid = false; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { this.setError('signupEmailError', 'Valid email is required'); valid = false; }
        if (!mobile || mobile.length < 7) { this.setError('signupMobileError', 'Valid mobile number is required'); valid = false; }
        if (!username || username.length < 3) { this.setError('signupUsernameError', 'Username must be at least 3 characters'); valid = false; }
        if (!password || password.length < 6) { this.setError('signupPasswordError', 'Password must be at least 6 characters'); valid = false; }
        if (password !== confirmPassword) { this.setError('signupConfirmPasswordError', 'Passwords do not match'); valid = false; }
        if (!valid) return;

        try {
            const user = DataManager.registerUser({ businessName, ownerName, email, mobile, username, password });
            DataManager.authenticateUser(username, password);
            UI.showNotification('Account created successfully! Let\'s set up your business.', 'success');
            AppManager.showSetupWizard();
        } catch (err) {
            UI.showNotification(err.message, 'error');
            if (err.message.includes('Username')) this.setError('signupUsernameError', err.message);
            if (err.message.includes('Email')) this.setError('signupEmailError', err.message);
        }
    },

    logout() {
        UI.confirm('Are you sure you want to logout?', () => {
            DataManager.logout();
            AppManager.showLanding();
            UI.showNotification('Logged out successfully', 'info');
        });
    }
};

// ─── Dashboard Manager ───────────────────────────────────────

const DashboardManager = {
    init() {},
    refresh() {
        this.updateMetrics();
        this.updateCharts();
        this.updateRecentTransactions();
    },
    updateMetrics() {
        const metrics = DataManager.getBusinessMetrics();
        DOM.get('totalRevenue').textContent = Format.currency(metrics.totalSalesRevenue);
        DOM.get('totalProfit').textContent = Format.currency(metrics.totalProfit);
        DOM.get('inventoryValue').textContent = Format.currency(metrics.totalInventoryValue);
        DOM.get('lowStockCount').textContent = metrics.lowStockItems;
        const lowStockEl = DOM.get('lowStockCount');
        if (lowStockEl) lowStockEl.style.color = metrics.lowStockItems > 0 ? 'var(--color-warning)' : 'var(--color-success)';
    },
    updateCharts() {
        if (typeof Chart !== 'undefined') ChartComponent.updateCharts();
    },
    updateRecentTransactions() {
        const recent = DataManager.getRecentTransactions(5);
        const container = DOM.get('recentTransactions');
        if (!container) return;
        container.innerHTML = recent.length === 0
            ? '<p class="no-data">No recent transactions</p>'
            : recent.map(t => CardComponent.renderRecentTransaction(t)).join('');
    }
};

// ─── Inventory Manager ───────────────────────────────────────

const InventoryManager = {
    init() {
        const addBtn = document.querySelector('#addInventoryProductBtn');
        if (addBtn) addBtn.addEventListener('click', () => this.showAddProductModal());
        const saveBtn = DOM.get('saveProductBtn');
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveProduct());
        this.initCategoryManagement();
        this.initUnitDropdown();
    },

    initUnitDropdown() {
        const searchInput = DOM.get('productUnitSearch');
        const dropdown = DOM.get('productUnitDropdown');
        const hiddenInput = DOM.get('productUnit');
        if (!searchInput || !dropdown) return;

        searchInput.addEventListener('focus', () => { dropdown.classList.add('open'); });
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.toLowerCase();
            dropdown.querySelectorAll('.unit-option').forEach(opt => {
                opt.style.display = opt.textContent.toLowerCase().includes(q) ? '' : 'none';
            });
            dropdown.classList.add('open');
        });
        dropdown.querySelectorAll('.unit-option').forEach(opt => {
            opt.addEventListener('click', () => {
                hiddenInput.value = opt.dataset.value;
                searchInput.value = opt.textContent;
                dropdown.classList.remove('open');
            });
        });
        document.addEventListener('click', e => {
            if (!e.target.closest('.searchable-select-wrapper')) dropdown.classList.remove('open');
        });
    },

    initCategoryManagement() {
        const manageCategoriesBtn = DOM.get('manageCategoriesBtn');
        if (manageCategoriesBtn) manageCategoriesBtn.addEventListener('click', () => this.showCategoryManagementModal());

        const closeBtn = DOM.get('closeCategoryModal');
        if (closeBtn) closeBtn.addEventListener('click', () => this.hideCategoryModal());
        const closeBtn2 = DOM.get('closeCategoryModal2');
        if (closeBtn2) closeBtn2.addEventListener('click', () => this.hideCategoryModal());
        const backdrop = DOM.get('categoryModalBackdrop');
        if (backdrop) backdrop.addEventListener('click', () => this.hideCategoryModal());

        const addInlineBtn = DOM.get('addCategoryInlineBtn');
        if (addInlineBtn) addInlineBtn.addEventListener('click', () => this.addNewCategory());
    },

    showCategoryManagementModal() {
        this.populateCategoriesList();
        const modal = DOM.get('categoryManagementModal');
        if (modal) modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    hideCategoryModal() {
        const modal = DOM.get('categoryManagementModal');
        if (modal) modal.classList.add('hidden');
        document.body.style.overflow = '';
    },

    populateCategories() {
        const categories = DataManager.getCategories();
        FormComponent.populateSelect('productCategory', categories, 'name', 'name', 'Select Category');
    },

    populateCategoriesList() {
        const list = DOM.get('categoriesList');
        if (!list) return;
        const categories = DataManager.getCategories();
        if (categories.length === 0) { list.innerHTML = '<div class="no-data">No categories found</div>'; return; }
        list.innerHTML = categories.map(c => `
            <div class="category-item" data-category-id="${c.id}">
                <div class="category-info">
                    <span class="category-icon">${c.icon || '📦'}</span>
                    <div class="category-details"><h4>${c.name}</h4><p>${c.description || 'No description'}</p></div>
                </div>
                <div class="category-actions">
                    <button class="btn btn--outline btn--sm" onclick="CategoryManager.edit(${c.id})">Edit</button>
                    <button class="btn btn--secondary btn--sm" onclick="CategoryManager.delete(${c.id})">Delete</button>
                </div>
            </div>`).join('');
    },

    addNewCategory() {
        const nameInput = DOM.get('newCategoryName');
        const name = nameInput.value.trim();
        if (!name) { UI.showNotification('Please enter a category name', 'error'); return; }
        try {
            DataManager.addCategory({ name, description: '', icon: '📦' });
            UI.showNotification('Category added successfully!', 'success');
            nameInput.value = '';
            this.populateCategoriesList();
            this.populateCategories();
        } catch (e) { UI.showNotification('Error: ' + e.message, 'error'); }
    },

    editCategory(id) {
        const cat = DataManager.getCategories().find(c => c.id === id);
        if (!cat) return;
        const newName = prompt('Edit category name:', cat.name);
        if (newName && newName.trim() && newName.trim() !== cat.name) {
            try {
                DataManager.updateCategory(id, { name: newName.trim() });
                UI.showNotification('Category updated!', 'success');
                this.populateCategoriesList();
                this.populateCategories();
            } catch (e) { UI.showNotification('Error: ' + e.message, 'error'); }
        }
    },

    deleteCategory(id) {
        const cat = DataManager.getCategories().find(c => c.id === id);
        if (!cat) return;
        UI.confirm(`Delete "${cat.name}"?`, () => {
            try {
                DataManager.deleteCategory(id);
                UI.showNotification('Category deleted!', 'success');
                this.populateCategoriesList();
                this.populateCategories();
            } catch (e) { UI.showNotification('Error: ' + e.message, 'error'); }
        });
    },

    refresh() {
        this.updateInventoryStats();
        this.loadProducts();
        this.populateCategories();
    },

    updateInventoryStats() {
        const metrics = DataManager.getBusinessMetrics();
        DOM.get('totalProductsCount').textContent = DataManager.getProducts().length;
        DOM.get('totalStockValue').textContent = Format.currency(metrics.totalInventoryValue);
        DOM.get('lowStockProductsCount').textContent = metrics.lowStockItems;
    },

    loadProducts() {
        TableComponent.renderProductsTable(DataManager.getProducts(), 'productsTableBody');
    },

    showAddProductModal() {
        this.populateCategories();
        // Reset unit
        const unitSearch = DOM.get('productUnitSearch');
        const unitHidden = DOM.get('productUnit');
        if (unitSearch) unitSearch.value = '';
        if (unitHidden) unitHidden.value = '';
        DOM.get('productModalTitle').textContent = 'Add New Product';
        ModalManager.show('productModal');
    },

    edit(productId) {
        const product = DataManager.getProduct(productId);
        if (!product) { UI.showNotification('Product not found', 'error'); return; }
        this.populateCategories();
        DOM.get('productModalTitle').textContent = 'Edit Product';
        ModalManager.show('productModal', {
            productName: product.name,
            productSKU: product.sku,
            productCategory: product.category,
            productPurchasePrice: product.purchasePrice,
            productSalePrice: product.salePrice,
            productCurrentStock: product.currentStock,
            productReorderLevel: product.reorderLevel,
            productDescription: product.description
        });
        // Set unit in searchable dropdown
        const unitSearch = DOM.get('productUnitSearch');
        const unitHidden = DOM.get('productUnit');
        if (unitSearch && unitHidden && product.unit) {
            unitHidden.value = product.unit;
            const opt = document.querySelector(`.unit-option[data-value="${product.unit}"]`);
            if (opt) unitSearch.value = opt.textContent;
            else unitSearch.value = product.unit;
        }
        DOM.get('productForm').dataset.productId = productId;
    },

    saveProduct() {
        const form = DOM.get('productForm');
        const formData = ModalManager.getFormData(DOM.get('productModal'));
        const productId = form.dataset.productId;
        const unit = DOM.get('productUnit')?.value || '';
        if (!unit) { UI.showNotification('Please select a unit', 'error'); return; }
        const productData = {
            ...(productId ? { id: parseInt(productId) } : {}),
            name: formData.productName,
            sku: formData.productSKU,
            category: formData.productCategory,
            unit,
            purchasePrice: formData.productPurchasePrice,
            salePrice: formData.productSalePrice,
            currentStock: formData.productCurrentStock,
            reorderLevel: formData.productReorderLevel,
            description: formData.productDescription
        };
        const errors = DataManager.validateProduct(productData);
        if (errors.length > 0) { UI.showNotification(errors.join('<br>'), 'error'); return; }
        try {
            if (productId) { DataManager.updateProduct(parseInt(productId), productData); UI.showNotification('Product updated!', 'success'); }
            else { DataManager.addProduct(productData); UI.showNotification('Product added!', 'success'); }
            ModalManager.hide();
            this.refresh();
            DashboardManager.refresh();
            delete form.dataset.productId;
        } catch (e) { UI.showNotification('Error: ' + e.message, 'error'); }
    },

    delete(productId) {
        const product = DataManager.getProduct(productId);
        if (!product) { UI.showNotification('Product not found', 'error'); return; }
        UI.confirm(`Delete "${product.name}"?`, () => {
            try { DataManager.deleteProduct(productId); UI.showNotification('Product deleted!', 'success'); this.refresh(); DashboardManager.refresh(); }
            catch (e) { UI.showNotification('Error: ' + e.message, 'error'); }
        });
    }
};

const ProductManager = { edit: id => InventoryManager.edit(id), delete: id => InventoryManager.delete(id) };
const CategoryManager = { edit: id => InventoryManager.editCategory(id), delete: id => InventoryManager.deleteCategory(id) };

// ─── Supplier Manager ────────────────────────────────────────

const SupplierManager = {
    init() {
        const addBtn = DOM.get('addSupplierBtn');
        if (addBtn) addBtn.addEventListener('click', () => this.showAddModal());
        const saveBtn = DOM.get('saveSupplierBtn');
        if (saveBtn) saveBtn.addEventListener('click', () => this.save());
    },
    refresh() {
        const suppliers = DataManager.getSuppliers();
        const grid = DOM.get('suppliersGrid');
        if (!grid) return;
        grid.innerHTML = suppliers.length === 0
            ? '<div class="no-data">No suppliers found</div>'
            : suppliers.map(s => CardComponent.renderSupplierCard(s)).join('');
    },
    showAddModal() {
        DOM.get('supplierModalTitle').textContent = 'Add New Supplier';
        ModalManager.show('supplierModal');
    },
    edit(id) {
        const s = DataManager.getSupplier(id);
        if (!s) return;
        DOM.get('supplierModalTitle').textContent = 'Edit Supplier';
        ModalManager.show('supplierModal', {
            supplierName: s.name,
            supplierContact: s.contactPerson,
            supplierPhone: s.phone,
            supplierEmail: s.email,
            supplierAddress: s.address,
            supplierSpeciality: s.speciality,
            supplierPaymentTerms: s.paymentTerms,
            supplierGST: s.gst
        });
        DOM.get('supplierForm').dataset.supplierId = id;
    },
    save() {
        const form = DOM.get('supplierForm');
        const data = ModalManager.getFormData(DOM.get('supplierModal'));
        const id = form.dataset.supplierId;
        const supplierData = {
            name: data.supplierName,
            contactPerson: data.supplierContact,
            phone: data.supplierPhone,
            email: data.supplierEmail,
            address: data.supplierAddress,
            speciality: data.supplierSpeciality,
            paymentTerms: data.supplierPaymentTerms,
            gst: data.supplierGST
        };
        const errors = DataManager.validateSupplier(supplierData);
        if (errors.length > 0) { UI.showNotification(errors.join('<br>'), 'error'); return; }
        try {
            if (id) { DataManager.updateSupplier(parseInt(id), supplierData); UI.showNotification('Supplier updated!', 'success'); }
            else { DataManager.addSupplier(supplierData); UI.showNotification('Supplier added!', 'success'); }
            ModalManager.hide();
            this.refresh();
            delete form.dataset.supplierId;
        } catch (e) { UI.showNotification(e.message, 'error'); }
    },
    delete(id) {
        UI.confirm('Delete this supplier?', () => {
            if (DataManager.deleteSupplier(id)) { UI.showNotification('Supplier deleted', 'success'); this.refresh(); }
        });
    }
};

// ─── Customer Manager ────────────────────────────────────────

const CustomerManager = {
    init() {
        const addBtn = DOM.get('addCustomerBtn');
        if (addBtn) addBtn.addEventListener('click', () => this.showAddModal());
        const saveBtn = DOM.get('saveCustomerBtn');
        if (saveBtn) saveBtn.addEventListener('click', () => this.save());
    },
    refresh() {
        const customers = DataManager.getCustomers();
        const grid = DOM.get('customersGrid');
        if (!grid) return;
        grid.innerHTML = customers.length === 0
            ? '<div class="no-data">No customers found</div>'
            : customers.map(c => CardComponent.renderCustomerCard(c)).join('');
    },
    showAddModal() {
        DOM.get('customerModalTitle').textContent = 'Add New Customer';
        ModalManager.show('customerModal');
    },
    edit(id) {
        const c = DataManager.getCustomer(id);
        if (!c) return;
        DOM.get('customerModalTitle').textContent = 'Edit Customer';
        ModalManager.show('customerModal', {
            customerName: c.name,
            customerPhone: c.phone,
            customerEmail: c.email,
            customerGST: c.gst,
            customerAddress: c.address
        });
        DOM.get('customerForm').dataset.customerId = id;
    },
    save() {
        const form = DOM.get('customerForm');
        const data = ModalManager.getFormData(DOM.get('customerModal'));
        const id = form.dataset.customerId;
        const customerData = {
            name: data.customerName,
            phone: data.customerPhone,
            email: data.customerEmail,
            gst: data.customerGST,
            address: data.customerAddress
        };
        const errors = DataManager.validateCustomer(customerData);
        if (errors.length > 0) { UI.showNotification(errors.join('<br>'), 'error'); return; }
        try {
            if (id) { DataManager.updateCustomer(parseInt(id), customerData); UI.showNotification('Customer updated!', 'success'); }
            else { DataManager.addCustomer(customerData); UI.showNotification('Customer added!', 'success'); }
            ModalManager.hide();
            this.refresh();
            delete form.dataset.customerId;
        } catch (e) { UI.showNotification(e.message, 'error'); }
    },
    delete(id) {
        UI.confirm('Delete this customer?', () => {
            if (DataManager.deleteCustomer(id)) { UI.showNotification('Customer deleted', 'success'); this.refresh(); }
        });
    }
};

// ─── Transaction Manager ──────────────────────────────────────

const TransactionManager = {
    currentType: 'purchase',
    products: [],
    init() {
        DOM.get('purchaseTab')?.addEventListener('click', () => this.setType('purchase'));
        DOM.get('saleTab')?.addEventListener('click', () => this.setType('sale'));
        DOM.get('addProductBtn')?.addEventListener('click', () => this.showAddProduct());
        DOM.get('addProductToTransactionBtn')?.addEventListener('click', () => this.addProduct());
        DOM.get('taxRate')?.addEventListener('input', () => this.calculate());
        DOM.get('resetTransactionBtn')?.addEventListener('click', () => this.reset());
        DOM.get('saveTransactionBtn')?.addEventListener('click', () => this.save(false));
        DOM.get('generateInvoiceBtn')?.addEventListener('click', () => this.save(true));
        DOM.get('transactionProductSelect')?.addEventListener('change', e => {
            const p = DataManager.getProduct(parseInt(e.target.value));
            if (p) DOM.get('productRate').value = this.currentType === 'purchase' ? p.purchasePrice : p.salePrice;
        });
        DOM.get('productQuantity')?.addEventListener('input', () => this.updateAddProductAmount());
        DOM.get('productRate')?.addEventListener('input', () => this.updateAddProductAmount());
    },
    setType(type) {
        this.currentType = type;
        DOM.get('purchaseTab').classList.toggle('active', type === 'purchase');
        DOM.get('saleTab').classList.toggle('active', type === 'sale');
        DOM.get('transactionTitle').textContent = type === 'purchase' ? 'New Purchase' : 'New Sale';
        DOM.get('partyLabel').textContent = type === 'purchase' ? 'Supplier *' : 'Customer *';
        this.populateParties();
        this.reset();
    },
    populateParties() {
        const parties = this.currentType === 'purchase' ? DataManager.getSuppliers() : DataManager.getCustomers();
        FormComponent.populateSelect('partySelect', parties, 'id', 'name', this.currentType === 'purchase' ? 'Select Supplier' : 'Select Customer');
    },
    showAddProduct() {
        const products = DataManager.getProducts();
        FormComponent.populateSelect('transactionProductSelect', products, 'id', 'name', 'Choose a product');
        ModalManager.show('addProductToTransactionModal');
    },
    updateAddProductAmount() {
        const q = parseFloat(DOM.get('productQuantity').value) || 0;
        const r = parseFloat(DOM.get('productRate').value) || 0;
        DOM.get('productAmount').textContent = Format.currency(q * r);
    },
    addProduct() {
        const id = parseInt(DOM.get('transactionProductSelect').value);
        const q = parseFloat(DOM.get('productQuantity').value);
        const r = parseFloat(DOM.get('productRate').value);
        if (!id || !q || !r) { UI.showNotification('Fill all fields', 'error'); return; }
        const p = DataManager.getProduct(id);
        if (this.currentType === 'sale' && q > p.currentStock) { UI.showNotification('Low stock!', 'error'); return; }
        this.products.push({ productId: id, productName: p.name, quantity: q, unit: p.unit, rate: r, amount: q * r });
        this.renderProducts();
        ModalManager.hide();
    },
    removeProduct(idx) { this.products.splice(idx, 1); this.renderProducts(); },
    renderProducts() {
        TableComponent.renderTransactionProducts(this.products, 'productsList');
        this.calculate();
    },
    calculate() {
        const sub = this.products.reduce((s, p) => s + p.amount, 0);
        const taxR = parseFloat(DOM.get('taxRate').value) || 0;
        const taxA = (sub * taxR) / 100;
        DOM.get('subtotalAmount').textContent = Format.currency(sub);
        DOM.get('taxAmount').textContent = Format.currency(taxA);
        DOM.get('totalAmount').textContent = Format.currency(sub + taxA);
    },
    reset() {
        this.products = [];
        this.renderProducts();
        DOM.get('transactionDate').value = Format.dateForInput(new Date());
        DOM.get('taxRate').value = 0;
        DOM.get('partySelect').value = '';
        DOM.get('invoiceNumber').textContent = DataManager.generateInvoiceNumber(this.currentType);
    },
    save(print) {
        const partyId = parseInt(DOM.get('partySelect').value);
        const date = DOM.get('transactionDate').value;
        if (!partyId || !date || this.products.length === 0) { UI.showNotification('Missing info', 'error'); return; }
        const party = this.currentType === 'purchase' ? DataManager.getSupplier(partyId) : DataManager.getCustomer(partyId);
        const sub = this.products.reduce((s, p) => s + p.amount, 0);
        const taxR = parseFloat(DOM.get('taxRate').value) || 0;
        const tx = {
            type: this.currentType, date, partyId, partyName: party.name, partyAddress: party.address, partyPhone: party.phone,
            products: this.products, subtotal: sub, taxRate: taxR, taxAmount: (sub * taxR) / 100, totalAmount: sub + ((sub * taxR) / 100)
        };
        const saved = DataManager.addTransaction(tx);
        if (print) PDFGenerator.generateInvoice(saved);
        UI.showNotification('Transaction saved!', 'success');
        this.reset();
        DashboardManager.refresh();
    },
    refresh() { this.setType(this.currentType); }
};

// ─── Report Manager ──────────────────────────────────────────

const ReportManager = {
    init() {
        document.querySelectorAll('[data-report]').forEach(btn => {
            btn.addEventListener('click', () => UI.showNotification('Generating report...', 'info'));
        });
    },
    refresh() {}
};

// ─── Settings Manager ────────────────────────────────────────

const SettingsManager = {
    init() {
        DOM.get('businessSettingsForm')?.addEventListener('submit', e => { e.preventDefault(); this.saveBusiness(); });
        DOM.get('bankDetailsForm')?.addEventListener('submit', e => { e.preventDefault(); this.saveBank(); });
        DOM.get('setupForm')?.addEventListener('submit', e => { e.preventDefault(); this.completeSetup(); });
        DOM.get('skipSetup')?.addEventListener('click', () => this.completeSetup(true));
        
        // QR Upload
        const area = DOM.get('qrUploadArea');
        const input = DOM.get('qrFileInput');
        if (area && input) {
            area.addEventListener('click', () => input.click());
            input.addEventListener('change', e => this.handleQrUpload(e));
        }
        DOM.get('removeQrBtn')?.addEventListener('click', e => { e.stopPropagation(); this.removeQr(); });
    },
    refresh() {
        const info = DataManager.getBusinessInfo();
        DOM.get('settingsBusinessName').value = info.name || '';
        DOM.get('settingsProprietorName').value = info.proprietor || '';
        DOM.get('settingsBusinessType').value = info.specialization || '';
        DOM.get('settingsGstNumber').value = info.gst || '';
        DOM.get('settingsBusinessPhone').value = info.phone || '';
        DOM.get('settingsBusinessEmail').value = info.email || '';
        DOM.get('settingsBusinessAddress').value = info.address || '';
        DOM.get('settingsBusinessWebsite').value = info.website || '';

        const bank = DataManager.getBankDetails();
        DOM.get('bankName').value = bank.bankName || '';
        DOM.get('accountNumber').value = bank.accountNumber || '';
        DOM.get('accountHolderName').value = bank.accountHolderName || '';
        DOM.get('ifscCode').value = bank.ifscCode || '';

        const qr = DataManager.getBankQR();
        if (qr) this.showQrPreview(qr); else this.hideQrPreview();

        this.loadCategories();
    },
    saveBusiness() {
        const data = {
            name: DOM.get('settingsBusinessName').value,
            proprietor: DOM.get('settingsProprietorName').value,
            specialization: DOM.get('settingsBusinessType').value,
            gst: DOM.get('settingsGstNumber').value,
            phone: DOM.get('settingsBusinessPhone').value,
            email: DOM.get('settingsBusinessEmail').value,
            address: DOM.get('settingsBusinessAddress').value,
            website: DOM.get('settingsBusinessWebsite').value
        };
        DataManager.updateBusinessInfo(data);
        AppManager.updateBusinessBranding();
        UI.showNotification('Business info saved!', 'success');
    },
    saveBank() {
        const data = {
            bankName: DOM.get('bankName').value,
            accountNumber: DOM.get('accountNumber').value,
            accountHolderName: DOM.get('accountHolderName').value,
            ifscCode: DOM.get('ifscCode').value.toUpperCase()
        };
        DataManager.updateBankDetails(data);
        UI.showNotification('Bank details saved!', 'success');
    },
    handleQrUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 512000) { UI.showNotification('File too large (>500KB)', 'error'); return; }
        const reader = new FileReader();
        reader.onload = ev => {
            const base64 = ev.target.result;
            DataManager.updateBankQR(base64);
            this.showQrPreview(base64);
            UI.showNotification('QR Code uploaded!', 'success');
        };
        reader.readAsDataURL(file);
    },
    removeQr() { DataManager.updateBankQR(''); this.hideQrPreview(); UI.showNotification('QR Code removed', 'info'); },
    showQrPreview(src) {
        DOM.get('qrPreviewImg').src = src;
        DOM.get('qrPreviewWrapper').style.display = 'block';
        DOM.get('qrUploadPlaceholder').style.display = 'none';
    },
    hideQrPreview() {
        DOM.get('qrPreviewWrapper').style.display = 'none';
        DOM.get('qrUploadPlaceholder').style.display = 'flex';
    },
    loadCategories() {
        const list = DOM.get('settingsCategoriesList');
        if (!list) return;
        const categories = DataManager.getCategories();
        list.innerHTML = categories.map(c => CardComponent.renderCategoryItem(c)).join('');
    },
    completeSetup(skip = false) {
        if (!skip) {
            const info = {
                name: DOM.get('businessName').value,
                proprietor: DOM.get('proprietorName').value,
                specialization: DOM.get('businessType').value,
                gst: DOM.get('gstNumber').value,
                phone: DOM.get('businessPhone').value,
                email: DOM.get('businessEmail').value,
                address: DOM.get('businessAddress').value,
                website: DOM.get('businessWebsite').value,
                setupComplete: true
            };
            if (!info.name) { UI.showNotification('Business name is required', 'error'); return; }
            DataManager.updateBusinessInfo(info);
        } else {
            DataManager.updateBusinessInfo({ setupComplete: true });
        }
        AppManager.showMainApp();
    }
};

// ─── PDF Generator ──────────────────────────────────────────

const PDFGenerator = {
    generateInvoice(tx) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const info = DataManager.getBusinessInfo();
        const bank = DataManager.getBankDetails();
        const qr = DataManager.getBankQR();
        
        doc.setFontSize(22); doc.setTextColor(40, 44, 52);
        doc.text(info.name || 'Your Business', 20, 30);
        doc.setFontSize(10); doc.setTextColor(100, 100, 100);
        doc.text(info.address || '', 20, 38);
        doc.text(`GST: ${info.gst || 'N/A'} | Ph: ${info.phone || 'N/A'}`, 20, 43);
        
        doc.setFontSize(16); doc.setTextColor(0, 0, 0);
        doc.text(tx.type === 'purchase' ? 'PURCHASE INVOICE' : 'SALES INVOICE', 130, 30);
        doc.setFontSize(10);
        doc.text(`No: ${tx.invoiceNumber}`, 130, 38);
        doc.text(`Date: ${Format.date(tx.date)}`, 130, 43);
        
        doc.line(20, 50, 190, 50);
        doc.text(`Bill To: ${tx.partyName}`, 20, 60);
        doc.text(tx.partyAddress || '', 20, 65);
        
        let y = 80;
        doc.setFillColor(245, 247, 250); doc.rect(20, y, 170, 8, 'F');
        doc.text('Product', 25, y+6); doc.text('Qty', 90, y+6); doc.text('Rate', 120, y+6); doc.text('Amount', 160, y+6);
        y += 12;
        tx.products.forEach(p => {
            doc.text(p.productName, 25, y); doc.text(`${p.quantity} ${p.unit}`, 90, y); doc.text(Format.currency(p.rate), 120, y); doc.text(Format.currency(p.amount), 160, y);
            y += 7;
        });
        doc.line(20, y, 190, y); y += 8;
        doc.text(`Subtotal: ${Format.currency(tx.subtotal)}`, 130, y); y += 6;
        if (tx.taxAmount > 0) { doc.text(`Tax (${tx.taxRate}%): ${Format.currency(tx.taxAmount)}`, 130, y); y += 6; }
        doc.setFontSize(12); doc.text(`Total: ${Format.currency(tx.totalAmount)}`, 130, y); y += 15;
        
        if (tx.type === 'sale' && bank.bankName) {
            doc.setFontSize(10); doc.text('Bank Details:', 20, y); y += 6;
            doc.text(`Bank: ${bank.bankName}`, 20, y); y += 5;
            doc.text(`A/C: ${bank.accountNumber}`, 20, y); y += 5;
            doc.text(`IFSC: ${bank.ifscCode}`, 20, y);
            if (qr) { try { doc.addImage(qr, 'PNG', 140, y-15, 30, 30); } catch(e){} }
        }
        
        doc.setFontSize(8); doc.text('Generated via BizManager', 20, 280);
        doc.save(`${tx.invoiceNumber}.pdf`);
    }
};

const SupplierManagerShim = { edit: id => SupplierManager.edit(id), delete: id => SupplierManager.delete(id) };
window.SupplierManager = SupplierManagerShim;
window.CustomerManager = { edit: id => CustomerManager.edit(id), delete: id => CustomerManager.delete(id) };
window.CategoryManager = { edit: id => InventoryManager.editCategory(id), delete: id => InventoryManager.deleteCategory(id) };
window.ProductManager = { edit: id => InventoryManager.edit(id), delete: id => InventoryManager.delete(id) };
window.TransactionManager = { removeProduct: idx => TransactionManager.removeProduct(idx) };

AppManager.init();