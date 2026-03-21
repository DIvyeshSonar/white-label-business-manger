import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Search, Edit2, Trash2, ChevronDown, Check, X } from 'lucide-react';

const UNIT_OPTIONS = [
  { id: 'BAGS', name: 'BAGS', code: 'Bag' },
  { id: 'BALES', name: 'BALES', code: 'Bal' },
  { id: 'BOTTLES', name: 'BOTTLES', code: 'Btl' },
  { id: 'BOX', name: 'BOX', code: 'Box' },
  { id: 'BUCKETS', name: 'BUCKETS', code: 'Bkt' },
  { id: 'BUNDLES', name: 'BUNDLES', code: 'Bdl' },
  { id: 'BUNCHES', name: 'BUNCHES', code: 'Bch' },
  { id: 'CANS', name: 'CANS', code: 'Can' },
  { id: 'CAPSULES', name: 'CAPSULES', code: 'Cap' },
  { id: 'CANISTERS', name: 'CANISTERS', code: 'Cns' },
  { id: 'CARTONS', name: 'CARTONS', code: 'Ctn' },
  { id: 'CASES', name: 'CASES', code: 'Cse' },
  { id: 'CENTIMETERS', name: 'CENTIMETERS', code: 'Cm' },
  { id: 'CUBIC_METERS', name: 'CUBIC METERS', code: 'Cum' },
  { id: 'DOZENS', name: 'DOZENS', code: 'Dzn' },
  { id: 'DRUMS', name: 'DRUMS', code: 'Drm' },
  { id: 'FEET', name: 'FEET', code: 'Ft' },
  { id: 'GRAMS', name: 'GRAMS', code: 'Gm' },
  { id: 'GROSS', name: 'GROSS', code: 'Grs' },
  { id: 'GALLONS', name: 'GALLONS', code: 'Gal' },
  { id: 'INCHES', name: 'INCHES', code: 'In' },
  { id: 'KILOGRAMS', name: 'KILOGRAMS', code: 'Kg' },
  { id: 'KILOLITRE', name: 'KILOLITRE', code: 'Kl' },
  { id: 'KITS', name: 'KITS', code: 'Kit' },
  { id: 'LITRE', name: 'LITRE', code: 'Ltr' },
  { id: 'LOTS', name: 'LOTS', code: 'Lot' },
  { id: 'METERS', name: 'METERS', code: 'Mtr' },
  { id: 'METRIC_TON', name: 'METRIC TON', code: 'Mtn' },
  { id: 'MILLILITRE', name: 'MILLILITRE', code: 'Ml' },
  { id: 'MILLIGRAM', name: 'MILLIGRAM', code: 'Mmg' },
  { id: 'MILLIMETERS', name: 'MILLIMETERS', code: 'Mm' },
  { id: 'NUMBERS', name: 'NUMBERS', code: 'Nos' },
  { id: 'OUNCES', name: 'OUNCES', code: 'Oz' },
  { id: 'PACKETS', name: 'PACKETS', code: 'Pkt' },
  { id: 'PACKS', name: 'PACKS', code: 'Pac' },
  { id: 'PAIRS', name: 'PAIRS', code: 'Prs' },
  { id: 'PALLETS', name: 'PALLETS', code: 'Pal' },
  { id: 'PIECES', name: 'PIECES', code: 'Pcs' },
  { id: 'POUNDS', name: 'POUNDS', code: 'Lbs' },
  { id: 'QUINTAL', name: 'QUINTAL', code: 'Qtl' },
  { id: 'REAMS', name: 'REAMS', code: 'Rm' },
  { id: 'ROLLS', name: 'ROLLS', code: 'Rol' },
  { id: 'SETS', name: 'SETS', code: 'Set' },
  { id: 'STRIPS', name: 'STRIPS', code: 'Str' },
  { id: 'SHEETS', name: 'SHEETS', code: 'Sht' },
  { id: 'SQUARE_FEET', name: 'SQUARE FEET', code: 'Sqf' },
  { id: 'SQUARE_METERS', name: 'SQUARE METERS', code: 'Sqm' },
  { id: 'TABLETS', name: 'TABLETS', code: 'Tab' },
  { id: 'TEN_GROSS', name: 'TEN GROSS', code: 'Tgs' },
  { id: 'THOUSANDS', name: 'THOUSANDS', code: 'Thd' },
  { id: 'TONNES', name: 'TONNES', code: 'Ton' },
  { id: 'TUBES', name: 'TUBES', code: 'Tub' },
  { id: 'UNITS', name: 'UNITS', code: 'Unt' },
  { id: 'VIALS', name: 'VIALS', code: 'Vil' },
  { id: 'YARDS', name: 'YARDS', code: 'Yds' }
];

const Inventory = () => {
  const { store, addEntity, updateEntity, deleteEntity } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    purchasePrice: '',
    salePrice: '',
    unit: 'PIECES',
    currentStock: '',
    reorderLevel: ''
  });

  // Unit & Category Dropdown State
  const [unitSearch, setUnitSearch] = useState('');
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUnitDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = store.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUnits = UNIT_OPTIONS.filter(u => 
    u.name.toLowerCase().includes(unitSearch.toLowerCase()) || 
    u.code.toLowerCase().includes(unitSearch.toLowerCase())
  );

  const filteredCategories = store.categories.filter(c => 
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleOpenModal = (product = null) => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        categoryId: product.categoryId,
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,
        unit: product.unit,
        currentStock: product.currentStock,
        reorderLevel: product.reorderLevel
      });
      setUnitSearch(product.unit);
      setCategorySearch(store.categories.find(c => c.id.toString() === product.categoryId.toString())?.name || '');
      setEditingId(product.id);
    } else {
      setFormData({
        name: '', sku: '', categoryId: '', purchasePrice: '', salePrice: '', unit: 'PIECES', currentStock: '', reorderLevel: ''
      });
      setUnitSearch('');
      setCategorySearch('');
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
    const payload = {
      ...formData,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      salePrice: parseFloat(formData.salePrice) || 0,
      currentStock: parseFloat(formData.currentStock) || 0,
      reorderLevel: parseFloat(formData.reorderLevel) || 0,
      category: store.categories.find(c => c.id.toString() === formData.categoryId.toString())?.name || 'Uncategorized'
    };

    if (editingId) {
      updateEntity('products', editingId, payload);
    } else {
      addEntity('products', payload, 'products');
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteEntity('products', id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search products by name or SKU..." 
            className="form-control pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary whitespace-nowrap gap-2" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price / Cost</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No products found. Include some inventory to see it here.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const isLowStock = product.currentStock <= product.reorderLevel;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <span className="block text-gray-900 font-medium">₹{product.salePrice.toFixed(2)}</span>
                        <span className="block text-xs">Cost: ₹{product.purchasePrice.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.currentStock} <span className="text-gray-500 text-xs">{product.unit}</span></td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenModal(product)} className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-slide-up">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="form-label">Product Name *</label>
                  <input required type="text" className="form-control" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="form-label">SKU / Item Code *</label>
                  <input required type="text" className="form-control" name="sku" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
                </div>
                
                {/* Searchable Category Dropdown */}
                <div className="col-span-2 md:col-span-1 relative" ref={categoryDropdownRef}>
                  <label className="form-label">Category *</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="form-control pr-10 cursor-pointer"
                      placeholder="Search category..."
                      value={categorySearch}
                      onChange={(e) => {
                        setCategorySearch(e.target.value);
                        setIsCategoryDropdownOpen(true);
                      }}
                      onFocus={() => setIsCategoryDropdownOpen(true)}
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    
                    {isCategoryDropdownOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredCategories.length > 0 ? filteredCategories.map(category => (
                          <div
                            key={category.id}
                            className="px-4 py-2 hover:bg-primary-50 cursor-pointer flex justify-between items-center text-sm"
                            onClick={() => {
                              setFormData({ ...formData, categoryId: category.id.toString() });
                              setCategorySearch(category.name);
                              setIsCategoryDropdownOpen(false);
                            }}
                          >
                            <span className="text-gray-900 font-medium">{category.name}</span>
                            {formData.categoryId === category.id.toString() && <Check className="w-4 h-4 text-primary-600" />}
                          </div>
                        )) : (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">No categories found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Searchable Unit Dropdown */}
                <div className="col-span-2 md:col-span-1 border-red-500 relative" ref={dropdownRef}>
                  <label className="form-label">Unit of Measurement *</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="form-control pr-10 cursor-pointer"
                      placeholder="Search unit..."
                      value={unitSearch}
                      onChange={(e) => {
                        setUnitSearch(e.target.value);
                        setIsUnitDropdownOpen(true);
                      }}
                      onFocus={() => setIsUnitDropdownOpen(true)}
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    
                    {isUnitDropdownOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredUnits.length > 0 ? filteredUnits.map(unit => (
                          <div
                            key={unit.id}
                            className="px-4 py-2 hover:bg-primary-50 cursor-pointer flex justify-between items-center text-sm"
                            onClick={() => {
                              setFormData({ ...formData, unit: unit.id });
                              setUnitSearch(unit.id);
                              setIsUnitDropdownOpen(false);
                            }}
                          >
                            <span className="text-gray-900 font-medium">{unit.name}</span>
                            <span className="text-gray-500 text-xs">{unit.code}</span>
                            {formData.unit === unit.id && <Check className="w-4 h-4 text-primary-600" />}
                          </div>
                        )) : (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">No units found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="form-label">Purchase Price (₹) *</label>
                  <input required type="number" step="0.01" min="0" className="form-control" value={formData.purchasePrice} onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="form-label">Selling Price (₹) *</label>
                  <input required type="number" step="0.01" min="0" className="form-control" value={formData.salePrice} onChange={(e) => setFormData({...formData, salePrice: e.target.value})} />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="form-label">Opening Stock *</label>
                  <input required type="number" step="0.01" min="0" className="form-control" value={formData.currentStock} onChange={(e) => setFormData({...formData, currentStock: e.target.value})} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="form-label">Reorder Alert Level</label>
                  <input type="number" step="0.01" min="0" className="form-control" value={formData.reorderLevel} onChange={(e) => setFormData({...formData, reorderLevel: e.target.value})} />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
