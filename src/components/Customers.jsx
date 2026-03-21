import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, X, User } from 'lucide-react';

const Customers = () => {
  const { store, addEntity, updateEntity, deleteEntity } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    category: 'Individual'
  });

  const filteredCustomers = store.customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  );

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        gstin: customer.gstin || '',
        category: customer.category || 'Individual'
      });
      setEditingId(customer.id);
    } else {
      setFormData({
        name: '', email: '', phone: '', address: '', gstin: '', category: 'Individual'
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateEntity('customers', editingId, formData);
    } else {
      addEntity('customers', formData, 'customers');
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteEntity('customers', id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="form-control pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary gap-2" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center card">
            <p className="text-gray-500">No customers found. Keep track of your client base here.</p>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <div key={customer.id} className="card hover:shadow-lg transition-all">
              <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">{customer.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(customer)} className="p-1 text-gray-400 hover:text-primary-600">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(customer.id)} className="p-1 text-gray-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span>{customer.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate">{customer.email || 'No email'}</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Sales</p>
                    <p className="font-bold text-gray-900">₹{(customer.totalPurchases || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Last Order</p>
                    <p className="text-gray-700 font-medium">{customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-900"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">Customer Name *</label>
                <input required type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Type</label>
                <select className="form-control" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option value="Individual">Individual</option>
                  <option value="Business">Business</option>
                  <option value="Wholesaler">Wholesaler</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Phone</label>
                  <input type="tel" className="form-control" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="form-label">Address</label>
                <textarea className="form-control h-20 resize-none" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
