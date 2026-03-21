import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, X } from 'lucide-react';

const Suppliers = () => {
  const { store, addEntity, updateEntity, deleteEntity } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    speciality: ''
  });

  const filteredSuppliers = store.suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        gstin: supplier.gstin || '',
        speciality: supplier.speciality || ''
      });
      setEditingId(supplier.id);
    } else {
      setFormData({
        name: '', contactPerson: '', email: '', phone: '', address: '', gstin: '', speciality: ''
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
      updateEntity('suppliers', editingId, formData);
    } else {
      addEntity('suppliers', formData, 'suppliers');
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      deleteEntity('suppliers', id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search suppliers..." 
            className="form-control pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary gap-2" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full py-12 text-center card">
            <p className="text-gray-500">No suppliers found. Add your first supplier to get started.</p>
          </div>
        ) : (
          filteredSuppliers.map(supplier => (
            <div key={supplier.id} className="card hover:shadow-lg transition-all border-l-4 border-l-primary-500">
              <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
                    <p className="text-sm text-primary-600 font-medium">{supplier.speciality || 'General Supplier'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(supplier)} className="p-1 text-gray-400 hover:text-primary-600">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(supplier.id)} className="p-1 text-gray-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span>{supplier.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate">{supplier.email || 'No email'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-gray-400 mt-1 shrink-0" />
                    <span className="line-clamp-2">{supplier.address || 'No address'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-gray-500">Total Purchases</span>
                  <span className="font-bold text-gray-900">₹{(supplier.totalPurchases || 0).toLocaleString()}</span>
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
              <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Supplier' : 'Add Supplier'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-900"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">Business Name *</label>
                <input required type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Contact Person</label>
                  <input type="text" className="form-control" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Speciality</label>
                  <input type="text" className="form-control" placeholder="e.g. Electronics" value={formData.speciality} onChange={(e) => setFormData({...formData, speciality: e.target.value})} />
                </div>
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
                <button type="submit" className="btn btn-primary">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
