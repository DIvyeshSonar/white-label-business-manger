import React, { useState } from 'react';
import { UserButton } from "@clerk/react";
import { Building2, User, Phone, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const SetupWizard = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            W
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's set up your business workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="col-span-2">
                <label htmlFor="businessName" className="form-label font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary-500" />
                  Business Name *
                </label>
                <div className="mt-1">
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. Acme Corporation"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ownerName" className="form-label font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-500" />
                  Owner Name *
                </label>
                <div className="mt-1">
                  <input
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="form-label font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-500" />
                  Mobile Number *
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label htmlFor="address" className="form-label font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary-500" />
                  Business Address (Optional)
                </label>
                <div className="mt-1">
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    className="form-control resize-none"
                    placeholder="Enter full address for invoices"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-500 gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>Secure local storage setup</span>
              </div>
              <button
                type="submit"
                className="btn btn-primary gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
        
        {/* User context widget */}
        <div className="mt-8 flex justify-center pb-8">
           <div className="bg-white rounded-full px-4 py-2 flex items-center gap-3 shadow-sm border border-gray-200">
              <span className="text-sm text-gray-600 font-medium">Logged in via Clerk as:</span>
              <UserButton />
           </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
