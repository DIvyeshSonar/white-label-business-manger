import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { jsPDF } from 'jspdf';
import { FileDown, Plus, Trash2 } from 'lucide-react';

const InvoiceGenerator = () => {
  const { store, addTransaction } = useData();
  const [type, setType] = useState('sale'); // purchase or sale
  const [partyId, setPartyId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Current product selection state
  const [currentProduct, setCurrentProduct] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [currentRate, setCurrentRate] = useState('');

  const handleAddProduct = () => {
    if (!currentProduct || !currentQuantity || !currentRate) return;
    
    const product = store.products.find(p => p.id.toString() === currentProduct.toString());
    if (!product) return;

    const newProductLine = {
      productId: product.id,
      productName: product.name,
      quantity: parseFloat(currentQuantity),
      unit: product.unit,
      rate: parseFloat(currentRate),
      amount: parseFloat(currentQuantity) * parseFloat(currentRate)
    };

    setSelectedProducts([...selectedProducts, newProductLine]);
    setCurrentProduct('');
    setCurrentQuantity(1);
    setCurrentRate('');
  };

  const removeProduct = (index) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return selectedProducts.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleGenerateInvoice = () => {
    if (!partyId || selectedProducts.length === 0) {
      alert("Please select a party and add at least one product.");
      return;
    }

    const party = type === 'purchase' 
      ? store.suppliers.find(s => s.id.toString() === partyId)
      : store.customers.find(c => c.id.toString() === partyId);

    const subtotal = calculateSubtotal();
    const transaction = {
      type,
      partyId: party.id,
      partyName: party.name,
      partyPhone: party.phone || '',
      partyAddress: party.address || '',
      date,
      products: selectedProducts,
      subtotal,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: subtotal
    };

    // Save to DataContext and get the fully formed transaction (with ID and Invoice Number)
    const newTransaction = addTransaction(transaction);

    // Generate PDF with the correct invoice number
    generatePDF(newTransaction);

    // Reset Form
    setSelectedProducts([]);
    setPartyId('');
  };

  const generatePDF = (transaction) => {
    const doc = new jsPDF();
    const businessInfo = store.businessInfo;
    
    // Header
    let currentY = 25;
    let textX = 20;
    
    // Add Logo if exists (as a small icon to the left of name)
    if (businessInfo.logo) {
      try {
        const logoSize = 12; // Smaller size for icon look
        doc.addImage(businessInfo.logo, 'PNG', 20, currentY - 8, logoSize, logoSize);
        textX = 35; // Move text to the right of the logo
      } catch (e) {
        console.error('Failed to add Business Logo to PDF', e);
      }
    }

    doc.setFontSize(22);
    doc.setTextColor(13, 148, 136); // Primary Color
    doc.text(businessInfo.name || 'Your Business Name', textX, currentY);
    
    doc.setFontSize(18);
    doc.setTextColor(31, 41, 55);
    const invoiceType = transaction.type === 'purchase' ? 'PURCHASE INVOICE' : 'TAX INVOICE';
    doc.text(invoiceType, 130, currentY);

    currentY += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(businessInfo.address || 'Business Address', textX, currentY);
    doc.text(`Invoice No: ${transaction.invoiceNumber}`, 130, currentY);

    currentY += 6;
    doc.text(`Phone: ${businessInfo.phone || 'N/A'}`, textX, currentY);
    doc.text(`Date: ${new Date(transaction.date).toLocaleDateString()}`, 130, currentY);

    currentY += 6;
    doc.text(`Email: ${businessInfo.email || 'N/A'}`, textX, currentY);
    if (businessInfo.gst) {
      currentY += 6;
      doc.text(`GST: ${businessInfo.gst}`, textX, currentY);
    }
    
    // Line Separator
    currentY += 7;
    doc.setDrawColor(229, 231, 235);
    doc.line(20, currentY, 190, currentY);

    // Bill To
    currentY += 10;
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(`Bill To ${transaction.type === 'purchase' ? '(Supplier)' : '(Customer)'}:`, 20, currentY);
    
    doc.setFont('helvetica', 'normal');
    currentY += 7;
    doc.text(transaction.partyName, 20, currentY);
    if (transaction.partyAddress) {
      currentY += 6;
      doc.text(transaction.partyAddress, 20, currentY);
    }
    if (transaction.partyPhone) {
      currentY += 6;
      doc.text(`Phone: ${transaction.partyPhone}`, 20, currentY);
    }
    
    // Products Table Header
    currentY += 16;
    doc.setFillColor(243, 244, 246);
    doc.rect(20, currentY - 6, 170, 10, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Item Description', 25, currentY);
    doc.text('Qty', 100, currentY);
    doc.text('Rate', 130, currentY);
    doc.text('Amount', 160, currentY);
    
    currentY += 10;
    doc.setFont('helvetica', 'normal');
    
    // Table Rows
    transaction.products.forEach((product, i) => {
      // Alternating row colors
      if (i % 2 !== 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(20, currentY - 6, 170, 10, 'F');
      }
      doc.text(product.productName, 25, currentY);
      doc.text(`${product.quantity} ${product.unit}`, 100, currentY);
      doc.text(`Rs. ${product.rate.toFixed(2)}`, 130, currentY);
      doc.text(`Rs. ${product.amount.toFixed(2)}`, 160, currentY);
      currentY += 10;
    });
    
    // Totals Area
    doc.line(20, currentY, 190, currentY);
    currentY += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', 130, currentY);
    doc.setTextColor(13, 148, 136);
    doc.text(`Rs. ${transaction.totalAmount.toFixed(2)}`, 160, currentY);
    
    // Bank Details (Only for Sales)
    if (transaction.type === 'sale' && store.bankDetails.accountNumber) {
      currentY += 20;
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(10);
      doc.text('Bank Details for Payment:', 20, currentY);
      doc.setFont('helvetica', 'normal');
      currentY += 6;
      doc.text(`Bank: ${store.bankDetails.bankName}`, 20, currentY);
      currentY += 6;
      doc.text(`A/C No: ${store.bankDetails.accountNumber}`, 20, currentY);
      currentY += 6;
      doc.text(`IFSC: ${store.bankDetails.ifscCode}`, 20, currentY);
      
      // QR Code check
      if (store.bankQR) {
        try {
          doc.addImage(store.bankQR, 'JPEG', 150, currentY - 15, 30, 30);
          doc.setFontSize(8);
          doc.text('Scan to Pay', 156, currentY + 18);
        } catch (e) {
             console.error('Failed to add QR Code to PDF', e);
        }
      }
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text('Thank you for your business!', 105, 280, null, null, 'center');
    
    // Execute download
    const filename = `${transaction.invoiceNumber}_${transaction.date}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="space-y-6">
      <div className="card max-w-4xl mx-auto">
        <div className="card-header flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Create Transaction</h2>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${type === 'sale' ? 'bg-white shadow text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setType('sale')}
            >
              Sales Invoice
            </button>
            <button 
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${type === 'purchase' ? 'bg-white shadow text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setType('purchase')}
            >
              Purchase Bill
            </button>
          </div>
        </div>
        
        <div className="card-body space-y-8">
          {/* Top Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <label className="form-label">{type === 'sale' ? 'Customer' : 'Supplier'} *</label>
              <select className="form-control" value={partyId} onChange={(e) => setPartyId(e.target.value)}>
                <option value="">Select party...</option>
                {type === 'sale' 
                  ? store.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                  : store.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                }
              </select>
            </div>
            <div>
              <label className="form-label">Date</label>
              <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {/* Product Adder */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 border-b border-gray-200 pb-2">Add Products</h3>
            <div className="flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="text-xs text-gray-500 mb-1 block">Product</label>
                <select className="form-control" value={currentProduct} onChange={(e) => {
                  setCurrentProduct(e.target.value);
                  const p = store.products.find(x => x.id.toString() === e.target.value);
                  if (p) setCurrentRate(type === 'sale' ? p.salePrice : p.purchasePrice);
                }}>
                  <option value="">Choose...</option>
                  {store.products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.currentStock} {p.unit} left)</option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-32">
                <label className="text-xs text-gray-500 mb-1 block">Qty</label>
                <input type="number" min="1" step="0.01" className="form-control" value={currentQuantity} onChange={(e) => setCurrentQuantity(e.target.value)} />
              </div>
              <div className="w-full md:w-40">
                <label className="text-xs text-gray-500 mb-1 block">Rate (₹)</label>
                <input type="number" min="0" step="0.01" className="form-control" value={currentRate} onChange={(e) => setCurrentRate(e.target.value)} />
              </div>
              <button 
                type="button" 
                onClick={handleAddProduct}
                className="btn btn-secondary h-[42px] px-4 w-full md:w-auto mt-2 md:mt-0"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Line Items Table */}
          {selectedProducts.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product Name</th>
                    <th className="px-4 py-3 font-medium">Qty</th>
                    <th className="px-4 py-3 font-medium">Rate</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedProducts.map((item, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="px-4 py-3">{item.productName}</td>
                      <td className="px-4 py-3">{item.quantity} {item.unit}</td>
                      <td className="px-4 py-3">₹{item.rate.toFixed(2)}</td>
                      <td className="px-4 py-3 font-medium">₹{item.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeProduct(idx)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-primary-50">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-right font-medium text-primary-900">Total Amount:</td>
                    <td colSpan="2" className="px-4 py-3 font-bold text-primary-900 text-lg">
                      ₹{calculateSubtotal().toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <button 
              className="btn btn-primary gap-2 px-8"
              onClick={handleGenerateInvoice}
            >
              <FileDown size={18} />
              Save & Generate PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
