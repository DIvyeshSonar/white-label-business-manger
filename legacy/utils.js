// Utility Functions for White-Labeled Business Management App

// DOM Utilities
const DOM = {
    // Get element by ID
    get(id) {
        return document.getElementById(id);
    },
    
    // Get element by selector
    query(selector) {
        return document.querySelector(selector);
    },
    
    // Get elements by selector
    queryAll(selector) {
        return document.querySelectorAll(selector);
    },
    
    // Create element with optional attributes and content
    create(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else if (key === 'textContent') {
                element.textContent = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        if (content) {
            element.textContent = content;
        }
        
        return element;
    },
    
    // Show element
    show(element) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.classList.remove('hidden');
        }
    },
    
    // Hide element
    hide(element) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.classList.add('hidden');
        }
    },
    
    // Toggle element visibility
    toggle(element) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.classList.toggle('hidden');
        }
    },
    
    // Add event listener with delegation
    on(element, event, selector, handler) {
        if (typeof selector === 'function') {
            handler = selector;
            selector = null;
        }
        
        element.addEventListener(event, (e) => {
            if (selector) {
                const target = e.target.closest(selector);
                if (target) {
                    handler.call(target, e);
                }
            } else {
                handler.call(element, e);
            }
        });
    }
};

// Format Utilities
const Format = {
    // Format currency
    currency(amount, symbol = '₹') {
        const num = parseFloat(amount) || 0;
        return `${symbol}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    
    // Format number
    number(num, decimals = 0) {
        const number = parseFloat(num) || 0;
        return number.toLocaleString('en-IN', { 
            minimumFractionDigits: decimals, 
            maximumFractionDigits: decimals 
        });
    },
    
    // Format date
    date(dateString, options = {}) {
        const date = new Date(dateString);
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-IN', { ...defaultOptions, ...options });
    },
    
    // Format date for input
    dateForInput(dateString) {
        const date = dateString ? new Date(dateString) : new Date();
        return date.toISOString().split('T')[0];
    },
    
    // Format time
    time(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    },
    
    // Format datetime
    datetime(dateString) {
        return `${this.date(dateString)} ${this.time(dateString)}`;
    },
    
    // Format percentage
    percentage(value, decimals = 2) {
        const num = parseFloat(value) || 0;
        return `${num.toFixed(decimals)}%`;
    },
    
    // Capitalize first letter
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    // Format phone number
    phone(phoneNumber) {
        if (!phoneNumber) return '';
        // Simple formatting for display
        return phoneNumber.replace(/^(\+\d{1,3})?[\s-]?\(?([0-9]{3})\)?[\s-]?([0-9]{3})[\s-]?([0-9]{4})$/, 
            '$1 ($2) $3-$4');
    },
    
    // Truncate text
    truncate(text, maxLength = 50) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }
};

// Validation Utilities
const Validate = {
    // Check if email is valid
    email(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Check if phone is valid
    phone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    },
    
    // Check if required field is filled
    required(value) {
        return value && value.toString().trim().length > 0;
    },
    
    // Check if number is positive
    positive(value) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0;
    },
    
    // Check if URL is valid
    url(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    // Validate GST number (basic)
    gst(gstNumber) {
        if (!gstNumber) return true; // Optional field
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return gstRegex.test(gstNumber);
    }
};

// Animation and UI Utilities
const UI = {
    // Show loading state
    showLoading(element, text = 'Loading...') {
        if (typeof element === 'string') {
            element = DOM.get(element);
        }
        if (element) {
            element.innerHTML = `<div class="loading">🔄 ${text}</div>`;
            element.disabled = true;
        }
    },
    
    // Hide loading state
    hideLoading(element, originalText = '') {
        if (typeof element === 'string') {
            element = DOM.get(element);
        }
        if (element) {
            element.innerHTML = originalText;
            element.disabled = false;
        }
    },
    
    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        const notification = DOM.create('div', {
            className: `notification notification--${type}`,
            innerHTML: `
                <div class="notification-content">
                    <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                    <span class="notification-message">${message}</span>
                    <button class="notification-close">&times;</button>
                </div>
            `
        });
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto hide
        if (duration > 0) {
            setTimeout(() => this.hideNotification(notification), duration);
        }
        
        // Add close event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        return notification;
    },
    
    // Hide notification
    hideNotification(notification) {
        notification.classList.add('hiding');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },
    
    // Get notification icon
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    },
    
    // Confirm dialog
    confirm(message, onConfirm, onCancel) {
        const confirmed = window.confirm(message);
        if (confirmed && onConfirm) {
            onConfirm();
        } else if (!confirmed && onCancel) {
            onCancel();
        }
        return confirmed;
    },
    
    // Smooth scroll to element
    scrollTo(element, offset = 0) {
        if (typeof element === 'string') {
            element = DOM.get(element);
        }
        if (element) {
            const elementTop = element.offsetTop - offset;
            window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
            });
        }
    },
    
    // Animate number counter
    animateNumber(element, start, end, duration = 1000) {
        if (typeof element === 'string') {
            element = DOM.get(element);
        }
        if (!element) return;
        
        const startTime = performance.now();
        const difference = end - start;
        
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (difference * progress);
            
            element.textContent = Math.round(current);
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };
        
        requestAnimationFrame(updateNumber);
    },
    
    // Create modal backdrop
    createBackdrop() {
        const backdrop = DOM.create('div', {
            className: 'modal-backdrop'
        });
        document.body.appendChild(backdrop);
        setTimeout(() => backdrop.classList.add('show'), 50);
        return backdrop;
    },
    
    // Remove modal backdrop
    removeBackdrop(backdrop) {
        if (backdrop) {
            backdrop.classList.remove('show');
            setTimeout(() => {
                if (backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                }
            }, 300);
        }
    }
};

// Storage Utilities (Memory-based for sandboxed environment)
const Storage = {
    // Set item
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('localStorage error:', error);
            return false;
        }
    },
    
    // Get item
    getItem(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('localStorage error:', error);
            return null;
        }
    },
    
    // Remove item
    removeItem(key) {
        localStorage.removeItem(key);
    },
    
    // Clear all items
    clear() {
        localStorage.clear();
    }
};

// Math Utilities
const MathUtils = {
    // Calculate percentage
    percentage(value, total) {
        if (total === 0) return 0;
        return (value / total) * 100;
    },
    
    // Calculate tax amount
    calculateTax(amount, taxRate) {
        return (amount * taxRate) / 100;
    },
    
    // Round to specified decimal places
    round(value, decimals = 2) {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },
    
    // Calculate profit margin
    profitMargin(salePrice, costPrice) {
        if (salePrice === 0) return 0;
        return ((salePrice - costPrice) / salePrice) * 100;
    },
    
    // Calculate markup
    markup(salePrice, costPrice) {
        if (costPrice === 0) return 0;
        return ((salePrice - costPrice) / costPrice) * 100;
    },
    
    // Generate random ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Chart Utilities
const ChartUtils = {
    // Chart color palette
    colors: [
        '#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', 
        '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'
    ],
    
    // Get color by index
    getColor(index) {
        return this.colors[index % this.colors.length];
    },
    
    // Generate chart data for sales
    generateSalesChartData(transactions, period = '7d') {
        const salesData = this.groupTransactionsByDate(transactions, period);
        
        return {
            labels: Object.keys(salesData),
            datasets: [{
                label: 'Sales Revenue',
                data: Object.values(salesData),
                backgroundColor: this.getColor(0),
                borderColor: this.getColor(0),
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }]
        };
    },
    
    // Generate chart data for products
    generateProductsChartData(products) {
        const topProducts = products
            .sort((a, b) => (b.totalSold * b.salePrice) - (a.totalSold * a.salePrice))
            .slice(0, 5);
            
        return {
            labels: topProducts.map(p => p.name),
            datasets: [{
                label: 'Sales Value',
                data: topProducts.map(p => p.totalSold * p.salePrice),
                backgroundColor: topProducts.map((_, index) => this.getColor(index)),
                borderWidth: 0
            }]
        };
    },
    
    // Group transactions by date
    groupTransactionsByDate(transactions, period) {
        const grouped = {};
        const now = new Date();
        
        // Initialize with zeros for the period
        for (let i = parseInt(period); i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateKey = Format.date(date.toISOString(), { month: 'short', day: 'numeric' });
            grouped[dateKey] = 0;
        }
        
        // Fill with actual data
        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const dateKey = Format.date(date.toISOString(), { month: 'short', day: 'numeric' });
            if (grouped.hasOwnProperty(dateKey)) {
                grouped[dateKey] += transaction.totalAmount;
            }
        });
        
        return grouped;
    },
    
    // Chart default options
    getDefaultOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        };
    }
};

// Export/Import Utilities
const FileUtils = {
    // Download data as JSON file
    downloadJSON(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    },
    
    // Download blob as file
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = DOM.create('a', {
            href: url,
            download: filename,
            style: 'display: none'
        });
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // Read file as text
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    },
    
    // Parse CSV data
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim());
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                data.push(row);
            }
        }
        
        return data;
    }
};

// Debounce utility
const debounce = (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
};

// Throttle utility
const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};