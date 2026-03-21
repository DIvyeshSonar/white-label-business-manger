// UI Components for White-Labeled Business Management App

// Modal Manager
const ModalManager = {
    currentModal: null,
    
    // Show modal
    show(modalId, data = {}) {
        this.hide(); // Hide any existing modal
        
        const modal = DOM.get(modalId);
        const overlay = DOM.get('modalOverlay');
        
        if (modal && overlay) {
            this.currentModal = modal;
            
            // Populate modal with data if provided
            if (Object.keys(data).length > 0) {
                this.populateModal(modal, data);
            }
            
            DOM.show(overlay);
            DOM.show(modal);
            
            // Focus first input
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    },
    
    // Hide current modal
    hide() {
        const overlay = DOM.get('modalOverlay');
        if (overlay) {
            DOM.hide(overlay);
        }
        
        if (this.currentModal) {
            DOM.hide(this.currentModal);
            this.clearModal(this.currentModal);
            this.currentModal = null;
        }
    },
    
    // Populate modal with data
    populateModal(modal, data) {
        Object.keys(data).forEach(key => {
            const field = modal.querySelector(`#${key}`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = data[key];
                } else {
                    field.value = data[key];
                }
            }
        });
    },
    
    // Clear modal form
    clearModal(modal) {
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    },
    
    // Get form data from modal
    getFormData(modal) {
        const form = modal.querySelector('form');
        if (!form) return {};
        
        const formData = new FormData(form);
        const data = {};
        
        // Get all form elements
        const elements = form.querySelectorAll('input, select, textarea');
        elements.forEach(element => {
            if (element.name || element.id) {
                const key = element.name || element.id;
                if (element.type === 'checkbox') {
                    data[key] = element.checked;
                } else if (element.type === 'number') {
                    data[key] = parseFloat(element.value) || 0;
                } else {
                    data[key] = element.value;
                }
            }
        });
        
        return data;
    }
};

// Table Component
const TableComponent = {
    // Render products table
    renderProductsTable(products, containerId) {
        const container = DOM.get(containerId);
        if (!container) return;
        
        if (products.length === 0) {
            container.innerHTML = '<tr><td colspan="9" class="no-data">No products found</td></tr>';
            return;
        }
        
        const rows = products.map(product => {
            const stockValue = product.currentStock * product.purchasePrice;
            const stockStatus = product.currentStock <= product.reorderLevel 
                ? '<span class="status status--warning">Low Stock</span>'
                : '<span class="status status--success">In Stock</span>';
            
            return `
                <tr data-product-id="${product.id}">
                    <td>${product.sku}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${Format.currency(product.purchasePrice)}</td>
                    <td>${Format.currency(product.salePrice)}</td>
                    <td>${Format.number(product.currentStock)} ${product.unit}</td>
                    <td>${Format.currency(stockValue)}</td>
                    <td>${stockStatus}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn--outline btn--sm" onclick="ProductManager.edit(${product.id})">Edit</button>
                            <button class="btn btn--secondary btn--sm" onclick="ProductManager.delete(${product.id})">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        container.innerHTML = rows;
    },
    
    // Render transaction products table
    renderTransactionProducts(products, containerId) {
        const container = DOM.get(containerId);
        if (!container) return;
        
        if (products.length === 0) {
            container.innerHTML = '<tr><td colspan="5" class="no-data">No products added</td></tr>';
            return;
        }
        
        const rows = products.map((item, index) => {
            return `
                <tr data-index="${index}">
                    <td>${item.productName}</td>
                    <td>${Format.number(item.quantity)} ${item.unit}</td>
                    <td>${Format.currency(item.rate)}</td>
                    <td>${Format.currency(item.amount)}</td>
                    <td>
                        <button class="btn btn--secondary btn--sm" onclick="TransactionManager.removeProduct(${index})">
                            Remove
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        container.innerHTML = rows;
    }
};

// Card Component
const CardComponent = {
    // Render supplier card
    renderSupplierCard(supplier) {
        return `
            <div class="supplier-card" data-supplier-id="${supplier.id}">
                <div class="supplier-header">
                    <div class="supplier-info">
                        <h3>${supplier.name}</h3>
                        <p>${supplier.contactPerson || 'No contact person'}</p>
                    </div>
                    <div class="supplier-actions">
                        <button class="btn btn--outline btn--sm" onclick="SupplierManager.edit(${supplier.id})">
                            <span class="btn-icon">✏️</span>
                        </button>
                        <button class="btn btn--secondary btn--sm" onclick="SupplierManager.delete(${supplier.id})">
                            <span class="btn-icon">🗑️</span>
                        </button>
                    </div>
                </div>
                <div class="supplier-contact">
                    ${supplier.phone ? `<div class="contact-item">📞 ${Format.phone(supplier.phone)}</div>` : ''}
                    ${supplier.email ? `<div class="contact-item">✉️ ${supplier.email}</div>` : ''}
                    ${supplier.address ? `<div class="contact-item">📍 ${Format.truncate(supplier.address, 40)}</div>` : ''}
                    ${supplier.speciality ? `<div class="contact-item">🏷️ ${supplier.speciality}</div>` : ''}
                </div>
                <div class="supplier-stats">
                    <small>
                        Total Purchases: ${Format.currency(supplier.totalPurchases || 0)}<br>
                        Last Purchase: ${supplier.lastPurchase ? Format.date(supplier.lastPurchase) : 'Never'}
                    </small>
                </div>
            </div>
        `;
    },
    
    // Render customer card
    renderCustomerCard(customer) {
        return `
            <div class="customer-card" data-customer-id="${customer.id}">
                <div class="customer-header">
                    <div class="customer-info">
                        <h3>${customer.name}</h3>
                        <p>Customer since ${Format.date(customer.createdAt)}</p>
                    </div>
                    <div class="customer-actions">
                        <button class="btn btn--outline btn--sm" onclick="CustomerManager.edit(${customer.id})">
                            <span class="btn-icon">✏️</span>
                        </button>
                        <button class="btn btn--secondary btn--sm" onclick="CustomerManager.delete(${customer.id})">
                            <span class="btn-icon">🗑️</span>
                        </button>
                    </div>
                </div>
                <div class="customer-contact">
                    ${customer.phone ? `<div class="contact-item">📞 ${Format.phone(customer.phone)}</div>` : ''}
                    ${customer.email ? `<div class="contact-item">✉️ ${customer.email}</div>` : ''}
                    ${customer.address ? `<div class="contact-item">📍 ${Format.truncate(customer.address, 40)}</div>` : ''}
                    ${customer.gst ? `<div class="contact-item">🏛️ GST: ${customer.gst}</div>` : ''}
                </div>
                <div class="customer-stats">
                    <small>
                        Total Purchases: ${Format.currency(customer.totalPurchases || 0)}<br>
                        Last Purchase: ${customer.lastPurchase ? Format.date(customer.lastPurchase) : 'Never'}
                    </small>
                </div>
            </div>
        `;
    },
    
    // Render category item
    renderCategoryItem(category) {
        return `
            <div class="category-item" data-category-id="${category.id}">
                <div class="category-info">
                    <span class="category-icon">${category.icon || '📦'}</span>
                    <div class="category-details">
                        <h4>${category.name}</h4>
                        <p>${category.description || 'No description'}</p>
                    </div>
                </div>
                <div class="category-actions">
                    <button class="btn btn--outline btn--sm" onclick="CategoryManager.edit(${category.id})">
                        Edit
                    </button>
                    <button class="btn btn--secondary btn--sm" onclick="CategoryManager.delete(${category.id})">
                        Delete
                    </button>
                </div>
            </div>
        `;
    },
    
    // Render recent transaction
    renderRecentTransaction(transaction) {
        const typeIcon = transaction.type === 'purchase' ? '📥' : '📤';
        const typeText = transaction.type === 'purchase' ? 'Purchase' : 'Sale';
        const partyName = transaction.partyName || 'Unknown';
        
        return `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-type">
                        <span class="transaction-icon">${typeIcon}</span>
                        <span class="transaction-text">${typeText}</span>
                    </div>
                    <div class="transaction-details">
                        <strong>${partyName}</strong><br>
                        <small>${Format.date(transaction.date)} • ${transaction.invoiceNumber}</small>
                    </div>
                </div>
                <div class="transaction-amount">
                    ${Format.currency(transaction.totalAmount)}
                </div>
            </div>
        `;
    }
};

// Form Component
const FormComponent = {
    // Populate select options
    populateSelect(selectId, options, valueKey = 'id', textKey = 'name', placeholder = 'Select...') {
        const select = DOM.get(selectId);
        if (!select) return;
        
        let html = `<option value="">${placeholder}</option>`;
        options.forEach(option => {
            const value = typeof option === 'object' ? option[valueKey] : option;
            const text = typeof option === 'object' ? option[textKey] : option;
            html += `<option value="${value}">${text}</option>`;
        });
        
        select.innerHTML = html;
    },
    
    // Validate form
    validateForm(formElement) {
        const errors = [];
        const requiredFields = formElement.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                const label = formElement.querySelector(`label[for="${field.id}"]`);
                const fieldName = label ? label.textContent : field.name || field.id;
                errors.push(`${fieldName} is required`);
            }
        });
        
        // Email validation
        const emailFields = formElement.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !Validate.email(field.value)) {
                errors.push('Please enter a valid email address');
            }
        });
        
        // Phone validation
        const phoneFields = formElement.querySelectorAll('input[type="tel"]');
        phoneFields.forEach(field => {
            if (field.value && !Validate.phone(field.value)) {
                errors.push('Please enter a valid phone number');
            }
        });
        
        // Number validation
        const numberFields = formElement.querySelectorAll('input[type="number"]');
        numberFields.forEach(field => {
            if (field.value && !Validate.positive(field.value)) {
                errors.push(`${field.name || field.id} must be a positive number`);
            }
        });
        
        return errors;
    },
    
    // Show form errors
    showFormErrors(errors, containerId) {
        if (errors.length === 0) return;
        
        const container = DOM.get(containerId);
        if (container) {
            const errorHtml = errors.map(error => 
                `<div class="form-error">❌ ${error}</div>`
            ).join('');
            container.innerHTML = errorHtml;
        } else {
            // Show in notification if no container
            UI.showNotification(errors.join('<br>'), 'error', 5000);
        }
    },
    
    // Clear form errors
    clearFormErrors(containerId) {
        const container = DOM.get(containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
};

// Chart Component
const ChartComponent = {
    salesChart: null,
    productsChart: null,
    
    // Initialize charts
    init() {
        this.initSalesChart();
        this.initProductsChart();
    },
    
    // Initialize sales chart
    initSalesChart() {
        const canvas = DOM.get('salesChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const salesData = DataManager.getSalesData('7d');
        const chartData = ChartUtils.generateSalesChartData(salesData);
        
        if (this.salesChart) {
            this.salesChart.destroy();
        }
        
        this.salesChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                ...ChartUtils.getDefaultOptions(),
                plugins: {
                    title: {
                        display: true,
                        text: 'Sales Trend (Last 7 Days)'
                    }
                }
            }
        });
    },
    
    // Initialize products chart
    initProductsChart() {
        const canvas = DOM.get('productsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const products = DataManager.getTopProducts(5);
        const chartData = ChartUtils.generateProductsChartData(products);
        
        if (this.productsChart) {
            this.productsChart.destroy();
        }
        
        this.productsChart = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                ...ChartUtils.getDefaultOptions(),
                plugins: {
                    title: {
                        display: true,
                        text: 'Top Products by Sales Value'
                    }
                }
            }
        });
    },
    
    // Update charts
    updateCharts() {
        this.initSalesChart();
        this.initProductsChart();
    },
    
    // Destroy charts
    destroy() {
        if (this.salesChart) {
            this.salesChart.destroy();
            this.salesChart = null;
        }
        if (this.productsChart) {
            this.productsChart.destroy();
            this.productsChart = null;
        }
    }
};

// Navigation Component
const NavigationComponent = {
    currentView: 'dashboard',
    
    // Initialize navigation
    init() {
        const navItems = DOM.queryAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                if (view) {
                    this.showView(view);
                }
            });
        });
    },
    
    // Show specific view
    showView(viewName) {
        // Hide all views
        const views = DOM.queryAll('.view-content');
        views.forEach(view => {
            view.classList.remove('active');
        });
        
        // Show target view
        const targetView = DOM.get(`${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        // Update navigation
        const navItems = DOM.queryAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === viewName) {
                item.classList.add('active');
            }
        });
        
        this.currentView = viewName;
        // Persist last viewed section
        try {
            localStorage.setItem('wlbm_last_view', viewName);
        } catch (e) {}
        
        // Trigger view-specific initialization
        this.onViewChange(viewName);
    },
    
    // Handle view change
    onViewChange(viewName) {
        switch (viewName) {
            case 'dashboard':
                DashboardManager.refresh();
                break;
            case 'inventory':
                InventoryManager.refresh();
                break;
            case 'suppliers':
                SupplierManager.refresh();
                break;
            case 'customers':
                CustomerManager.refresh();
                break;
            case 'transactions':
                TransactionManager.refresh();
                break;
            case 'reports':
                ReportManager.refresh();
                break;
            case 'settings':
                SettingsManager.refresh();
                break;
        }
    }
};

// Search Component
const SearchComponent = {
    // Initialize search functionality
    init() {
        const productSearch = DOM.get('productSearchInput');
        if (productSearch) {
            productSearch.addEventListener('input', 
                debounce((e) => this.searchProducts(e.target.value), 300)
            );
        }
    },
    
    // Search products
    searchProducts(query) {
        if (!query.trim()) {
            InventoryManager.refresh();
            return;
        }
        
        const results = DataManager.searchProducts(query);
        TableComponent.renderProductsTable(results, 'productsTableBody');
    }
};

// PDF Generator is now handled in app.js to include bank details and QR codes.


// Initialize all components
const ComponentsManager = {
    init() {
        NavigationComponent.init();
        SearchComponent.init();
        
        // Initialize modal close handlers
        DOM.queryAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                ModalManager.hide();
            });
        });
        
        // Close modal on overlay click
        DOM.on(DOM.get('modalOverlay'), 'click', (e) => {
            if (e.target === e.currentTarget) {
                ModalManager.hide();
            }
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && ModalManager.currentModal) {
                ModalManager.hide();
            }
        });
    }
};

// Auto-initialize components when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ComponentsManager.init();
    });
} else {
    ComponentsManager.init();
}