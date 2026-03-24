import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Building2, CreditCard, Bell, Shield, Wallet, Save, QrCode, Upload } from 'lucide-react';

const Settings = () => {
  const { store, updateBusinessInfo, updateBankDetails, updateBankQR } = useData();
  const [activeTab, setActiveTab] = useState('business');
  
  const [businessForm, setBusinessForm] = useState(store.businessInfo);
  const [bankForm, setBankForm] = useState(store.bankDetails);
  const [errors, setErrors] = useState({});

  const validateBusiness = () => {
    const newErrors = {};
    if (!businessForm.name || businessForm.name.length < 3) newErrors.name = "Company name must be at least 3 characters.";
    if (!businessForm.proprietor) newErrors.proprietor = "Owner name is required.";
    if (!businessForm.email || !/\S+@\S+\.\S+/.test(businessForm.email)) newErrors.email = "Please enter a valid email address.";
    if (!businessForm.phone || !/^\d{10,12}$/.test(businessForm.phone.replace(/\D/g, ''))) newErrors.phone = "Enter a valid 10-digit phone number.";
    if (!businessForm.address || businessForm.address.length < 5) newErrors.address = "Please provide a more complete address.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateBusiness = (e) => {
    e.preventDefault();
    if (validateBusiness()) {
      updateBusinessInfo(businessForm);
      alert("Business information updated successfully!");
    } else {
      alert("Please fix the errors in your business information.");
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for base64
        alert("Logo file is too large. Please upload an image smaller than 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessForm({ ...businessForm, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateBank = (e) => {
    e.preventDefault();
    updateBankDetails(bankForm);
    alert("Bank details updated successfully!");
  };

  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateBankQR(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'business', name: 'Business Info', icon: Building2 },
    { id: 'bank', name: 'Payments & Bank', icon: CreditCard },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <tab.icon size={16} />
            {tab.name}
          </button>
        ))}
      </div>

      <div className="card">
        {activeTab === 'business' && (
          <form className="card-body space-y-6" onSubmit={handleUpdateBusiness}>
            {/* Logo Section */}
            <div className="flex flex-col md:flex-row gap-6 items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4">
              <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden relative group">
                {businessForm.logo ? (
                  <>
                    <img src={businessForm.logo} alt="Logo" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload size={20} className="text-white" />
                    </div>
                  </>
                ) : (
                  <Building2 size={32} className="text-gray-300" />
                )}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-sm font-bold text-gray-900">Business Logo</h3>
                <p className="text-xs text-gray-500 mt-1">Upload your brand logo. This will be displayed on all your invoices. (Max 1MB)</p>
                <label className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-700 cursor-pointer">
                  <Upload size={14} />
                  {businessForm.logo ? 'Change Logo' : 'Upload Logo'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="form-label">Business / Company Name *</label>
                <input 
                  type="text" 
                  className={`form-control ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={businessForm.name} 
                  onChange={(e) => setBusinessForm({...businessForm, name: e.target.value})} 
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.name}</p>}
              </div>
              <div>
                 <label className="form-label">Owner Name *</label>
                 <input 
                   type="text" 
                   className={`form-control ${errors.proprietor ? 'border-red-500 focus:ring-red-500' : ''}`}
                   value={businessForm.proprietor} 
                   onChange={(e) => setBusinessForm({...businessForm, proprietor: e.target.value})} 
                 />
                 {errors.proprietor && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.proprietor}</p>}
               </div>
               <div>
                 <label className="form-label">Business Email *</label>
                 <input 
                   type="email" 
                   className={`form-control ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                   placeholder="e.g. contact@business.com"
                   value={businessForm.email} 
                   onChange={(e) => setBusinessForm({...businessForm, email: e.target.value})} 
                 />
                 {errors.email && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.email}</p>}
               </div>
               <div>
                 <label className="form-label">Business Phone *</label>
                 <input 
                   type="tel" 
                   className={`form-control ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                   placeholder="e.g. 9876543210"
                   value={businessForm.phone} 
                   onChange={(e) => setBusinessForm({...businessForm, phone: e.target.value})} 
                 />
                 {errors.phone && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.phone}</p>}
               </div>
              <div>
                <label className="form-label">GST Number (Optional)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={businessForm.gst} 
                  onChange={(e) => setBusinessForm({...businessForm, gst: e.target.value.toUpperCase()})} 
                />
              </div>
              <div className="col-span-2">
                <label className="form-label">Business Address *</label>
                <textarea 
                  className={`form-control h-20 resize-none ${errors.address ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={businessForm.address} 
                  onChange={(e) => setBusinessForm({...businessForm, address: e.target.value})} 
                />
                {errors.address && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.address}</p>}
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button type="submit" className="btn btn-primary gap-2 px-6">
                <Save size={18} />
                Save Business Profile
              </button>
            </div>
          </form>
        )}

        {activeTab === 'bank' && (
          <div className="card-body space-y-8">
            <form onSubmit={handleUpdateBank} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Bank Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={bankForm.bankName} 
                    onChange={(e) => setBankForm({...bankForm, bankName: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="form-label">Account Holder Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={bankForm.accountHolderName} 
                    onChange={(e) => setBankForm({...bankForm, accountHolderName: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="form-label">Account Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={bankForm.accountNumber} 
                    onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="form-label">IFSC Code</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={bankForm.ifscCode} 
                    onChange={(e) => setBankForm({...bankForm, ifscCode: e.target.value})} 
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" className="btn btn-primary gap-2">
                  <Save size={18} />
                  Save Bank Details
                </button>
              </div>
            </form>

            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <QrCode size={20} className="text-primary-600" />
                Payment QR Code
              </h3>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                  {store.bankQR ? (
                    <img src={store.bankQR} alt="QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode size={48} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <p className="text-sm text-gray-600 max-w-sm">
                    Upload your UPI or Bank QR code to display it automatically on your generated invoices for easy client payments.
                  </p>
                  <label className="btn btn-secondary cursor-pointer gap-2 w-fit">
                    <Upload size={16} />
                    {store.bankQR ? 'Change QR Code' : 'Upload QR Code'}
                    <input type="file" className="hidden" accept="image/*" onChange={handleQRUpload} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="card-body p-0">
             <div className="p-6 border-b border-gray-100 bg-gray-50/50">
               <h3 className="text-lg font-bold text-gray-900">Platform Activity Log</h3>
               <p className="text-sm text-gray-500">A detailed record of all processes and transactions on your website.</p>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold border-b border-gray-100">
                   <tr>
                     <th className="px-6 py-4">Action / ID</th>
                     <th className="px-6 py-4">Process Details</th>
                     <th className="px-6 py-4">Date & Time</th>
                     <th className="px-6 py-4">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {store.transactions.length === 0 ? (
                     <tr>
                       <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                         No activity records found yet.
                       </td>
                     </tr>
                   ) : (
                     [...store.transactions].reverse().map(t => (
                       <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                         <td className="px-6 py-4">
                           <div className="flex flex-col">
                             <span className="text-sm font-bold text-gray-900">{t.invoiceNumber}</span>
                             <span className={`text-[10px] uppercase font-medium ${t.type === 'sale' ? 'text-green-600' : 'text-orange-600'}`}>
                               {t.type === 'sale' ? 'Sales Process' : 'Purchase Process'}
                             </span>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex flex-col">
                             <span className="text-sm text-gray-700 font-medium">{t.partyName}</span>
                             <span className="text-xs text-gray-500">Amount: ₹{t.totalAmount.toLocaleString()}</span>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="text-xs text-gray-600 font-medium">
                              {new Date(t.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold">
                              <span className="w-1 h-1 rounded-full bg-teal-500"></span>
                              Processed
                            </span>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* Security Placeholder */}
        {activeTab === 'security' && (
          <div className="card-body py-12 text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Shield className="text-gray-300" size={32} />
             </div>
             <h3 className="text-lg font-bold text-gray-900">Security Management</h3>
             <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm">
               Advanced security protocols and access controls are handled through your centralized identity provider.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
