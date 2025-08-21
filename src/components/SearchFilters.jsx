import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Briefcase, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const STATUS_OPTIONS = ['Applied', 'Interviewed', 'Hired', 'Rejected'];

const SearchFilters = ({ onFilterChange, onSearch }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [jobRoles, setJobRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [filters, setFilters] = useState({
    searchQuery: '',
    role: '',
    status: '',
    applicationDate: '',
    interviewDate: ''
  });

  // Load job roles from position presets
  useEffect(() => {
    const loadJobRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await api.get('/positions');
        if (response.data.success && response.data.positions) {
          const roles = response.data.positions.map(pos => pos.positionName);
          setJobRoles(roles);
          console.log(`Loaded ${roles.length} job roles from presets`);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error loading job roles:', error);
        // Fallback to default roles if API fails
        const fallbackRoles = [
          'Software Engineer',
          'Frontend Developer',
          'Backend Developer',
          'Full Stack Developer',
          'DevOps Engineer',
          'QA Engineer',
          'Software Architect',
          'Mobile Developer',
          'Data Engineer',
          'Machine Learning Engineer',
          'Cloud Engineer',
          'Security Engineer',
          'UI/UX Designer',
          'Product Manager',
          'Business Analyst'
        ];
        setJobRoles(fallbackRoles);
        console.log('Using fallback job roles due to API error');
      } finally {
        setLoadingRoles(false);
      }
    };

    loadJobRoles();
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchQuery: '',
      role: '',
      status: '',
      applicationDate: '',
      interviewDate: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <Filter size={18} className="mr-2" />
          Filters
          {Object.values(filters).some(value => value) && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {isFilterOpen && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <X size={16} className="mr-1" />
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Briefcase size={16} className="inline mr-1" />
                Job Role ({jobRoles.length})
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                disabled={loadingRoles}
              >
                <option value="">All Roles</option>
                {loadingRoles ? (
                  <option value="" disabled>Loading roles...</option>
                ) : (
                  jobRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))
                )}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CheckCircle2 size={16} className="inline mr-1" />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Application Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={16} className="inline mr-1" />
                Application Date
              </label>
              <input
                type="date"
                value={filters.applicationDate}
                onChange={(e) => handleFilterChange('applicationDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Interview Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={16} className="inline mr-1" />
                Interview Date
              </label>
              <input
                type="date"
                value={filters.interviewDate}
                onChange={(e) => handleFilterChange('interviewDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters; 
