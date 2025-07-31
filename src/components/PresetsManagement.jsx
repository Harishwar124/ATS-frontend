import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Building, Briefcase, Settings } from 'lucide-react';
import api from '../services/api';

const PresetsManagement = () => {
  const [activeTab, setActiveTab] = useState('companies');
  const [companies, setCompanies] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'companies') {
        const response = await api.get('/companies');
        setCompanies(response.data.companies || []);
      } else {
        const response = await api.get('/positions');
        setPositions(response.data.positions || []);
      }
    } catch (error) {
      console.error(`Error loading ${activeTab}:`, error);
      toast.error(`Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: '' });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ 
      name: activeTab === 'companies' ? item.companyName : item.positionName 
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const dataField = activeTab === 'companies' ? 'companyName' : 'positionName';
      const requestData = { [dataField]: formData.name };

      if (editingItem) {
        // Update item
        await api.put(`/${activeTab}/${editingItem._id}`, requestData);
        toast.success(`${activeTab.slice(0, -1)} updated successfully`);
      } else {
        // Create new item
        await api.post(`/${activeTab}`, requestData);
        toast.success(`${activeTab.slice(0, -1)} created successfully`);
      }
      
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error(`Error saving ${activeTab.slice(0, -1)}:`, error);
      toast.error(error.response?.data?.message || `Failed to save ${activeTab.slice(0, -1)}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (item) => {
    const itemName = activeTab === 'companies' ? item.companyName : item.positionName;
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    try {
      await api.delete(`/${activeTab}/${item._id}`);
      toast.success(`${activeTab.slice(0, -1)} deleted successfully`);
      loadData();
    } catch (error) {
      console.error(`Error deleting ${activeTab.slice(0, -1)}:`, error);
      toast.error(error.response?.data?.message || `Failed to delete ${activeTab.slice(0, -1)}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCurrentData = () => {
    return activeTab === 'companies' ? companies : positions;
  };

  const getItemName = (item) => {
    return activeTab === 'companies' ? item.companyName : item.positionName;
  };

  const getTabIcon = (tab) => {
    return tab === 'companies' ? <Building size={18} /> : <Briefcase size={18} />;
  };

  return (
    <div>
      {/* Header */}
      <div className="card">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Settings className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold">Manage Presets</h2>
            </div>
            <button
              onClick={handleAdd}
              className="btn btn-primary"
            >
              <Plus size={18} className="mr-2" />
              Add {activeTab === 'companies' ? 'Company' : 'Position'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mt-6">
        <div className="card-header">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'companies'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {getTabIcon('companies')}
              <span className="ml-2">Companies ({companies.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('positions')}
              className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'positions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {getTabIcon('positions')}
              <span className="ml-2">Positions ({positions.length})</span>
            </button>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : getCurrentData().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No {activeTab} found. Create the first {activeTab.slice(0, -1)} preset to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'companies' ? 'Company Name' : 'Position Name'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getCurrentData().map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getItemName(item)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.createdBy || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title={`Edit ${activeTab.slice(0, -1)}`}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-900"
                            title={`Delete ${activeTab.slice(0, -1)}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Edit' : 'Add New'} {activeTab === 'companies' ? 'Company' : 'Position'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {activeTab === 'companies' ? 'Company Name' : 'Position Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    placeholder={`Enter ${activeTab === 'companies' ? 'company' : 'position'} name`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresetsManagement; 
