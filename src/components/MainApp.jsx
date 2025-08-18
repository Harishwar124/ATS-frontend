import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, Download, Users, Search, Settings, LogOut, UserPlus, Key } from "lucide-react";
import ApplicantTable from "./ApplicantTable";
import ApplicantForm from "./ApplicantForm";
import DeleteConfirmModal from "./DeleteConfirmModal";
import UserManagement from "./UserManagement";
import PresetsManagement from "./PresetsManagement";
import ChangePassword from "./ChangePassword";
import { applicantAPI } from "../services/api";
import SearchFilters from './SearchFilters';
import { useAuth } from '../contexts/AuthContext';

function MainApp() {
  const { user, logout, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('applicants');
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [filters, setFilters] = useState({
    searchQuery: '',
    role: '',
    status: '',
    applicationDate: '',
    interviewDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [deletingApplicant, setDeletingApplicant] = useState(null);

  // Load applicants on component mount
  useEffect(() => {
    if (currentView === 'applicants') {
      loadApplicants();
    }
  }, [currentView]);

  // Filter applicants when filters change
  useEffect(() => {
    let filtered = applicants;

    // Search query filter
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (applicant) =>
          applicant.fullName?.toLowerCase().includes(query) ||
          applicant.email?.toLowerCase().includes(query) ||
          applicant.position?.toLowerCase().includes(query) ||
          applicant.status?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (filters.role) {
      filtered = filtered.filter(
        (applicant) => applicant.position?.toLowerCase() === filters.role.toLowerCase()
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(
        (applicant) => applicant.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Application date filter
    if (filters.applicationDate) {
      filtered = filtered.filter((applicant) => {
        const appDate = new Date(applicant.dateOfApplication);
        const filterDate = new Date(filters.applicationDate);
        return appDate.toDateString() === filterDate.toDateString();
      });
    }

    // Interview date filter
    if (filters.interviewDate) {
      filtered = filtered.filter((applicant) => {
        if (!applicant.interviewDate) return false;
        const intDate = new Date(applicant.interviewDate);
        const filterDate = new Date(filters.interviewDate);
        return intDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredApplicants(filtered);
  }, [filters, applicants]);

  const loadApplicants = async () => {
    try {
      setLoading(true);
      const response = await applicantAPI.getAll();
      setApplicants(response.data || []);
      setFilteredApplicants(response.data || []);
    } catch (error) {
      console.error("Error loading applicants:", error);
      toast.error("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  const handleAddApplicant = () => {
    setEditingApplicant(null);
    setShowForm(true);
  };

  const handleEditApplicant = (applicant) => {
    setEditingApplicant(applicant);
    setShowForm(true);
  };

  const handleDeleteApplicant = (applicant) => {
    setDeletingApplicant(applicant);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);

      if (editingApplicant) {
        // Update existing applicant
        const response = await applicantAPI.update(
          editingApplicant._id,
          formData
        );
        toast.success("Applicant updated successfully");

        // Update local state
        setApplicants((prev) =>
          prev.map((app) =>
            app._id === editingApplicant._id ? response.data : app
          )
        );
      } else {
        // Create new applicant
        const response = await applicantAPI.create(formData);
        toast.success("Applicant added successfully");

        // Add to local state
        setApplicants((prev) => [response.data, ...prev]);
      }

      setShowForm(false);
      setEditingApplicant(null);
    } catch (error) {
      console.error("Error saving applicant:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to save applicant";
      toast.error(errorMessage);

      // Display validation errors if available
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          toast.error(err.msg || err.message);
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async (adminPassword) => {
    try {
      setDeleteLoading(true);

      await applicantAPI.delete(deletingApplicant._id, adminPassword);
      toast.success("Applicant deleted successfully");

      // Remove from local state
      setApplicants((prev) =>
        prev.filter((app) => app._id !== deletingApplicant._id)
      );

      setShowDeleteModal(false);
      setDeletingApplicant(null);
    } catch (error) {
      console.error("Error deleting applicant:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete applicant";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      await applicantAPI.exportToExcel(filters);
      toast.success("Export completed successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingApplicant(null);
  };

  const handleDeleteClose = () => {
    setShowDeleteModal(false);
    setDeletingApplicant(null);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'users':
        return <UserManagement />;
      case 'presets':
        return <PresetsManagement />;
      case 'changePassword':
        return <ChangePassword />;
      default:
        return (
          <>
            {/* Action Bar */}
            <div className="card">
              <div className="card-body">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="text-primary-600" size={24} />
                    <h2 className="text-xl font-semibold">
                      Applicants ({filteredApplicants.length})
                    </h2>
                  </div>

                  <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search applicants..."
                      value={filters.searchQuery}
                      onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="flex gap-2 self-end md:self-auto">
                    <button
                      onClick={handleExport}
                      className="btn btn-success"
                      disabled={exportLoading || applicants.length === 0}
                    >
                      {exportLoading ? (
                        <span className="spinner h-4 w-4 mr-2"></span>
                      ) : (
                        <Download size={18} className="mr-2" />
                      )}
                      Export
                    </button>
                    <button
                      onClick={handleAddApplicant}
                      className="btn btn-primary"
                    >
                      <Plus size={18} className="mr-2" /> Add Applicant
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <SearchFilters 
              onFilterChange={setFilters}
            />

            {/* Applicant Table */}
            <div className="card mt-6">
              <div className="card-body">
                <ApplicantTable
                  applicants={filteredApplicants}
                  loading={loading}
                  onEdit={handleEditApplicant}
                  onDelete={handleDeleteApplicant}
                />
              </div>
            </div>

            {/* Add/Edit Applicant Modal */}
            {showForm && (
              <ApplicantForm
                isOpen={showForm}
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
                applicant={editingApplicant}
                isLoading={formLoading}
              />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={handleDeleteClose}
                onConfirm={handleDeleteConfirm}
                applicant={deletingApplicant}
                isLoading={deleteLoading}
              />
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="flex justify-between items-center">
            <div>
              <h1>Applicant Tracking System</h1>
              <p>Welcome, {user?.userid} ({user?.role})</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Navigation */}
              <nav className="flex gap-4">
                <button
                  onClick={() => setCurrentView('applicants')}
                  className={`px-3 py-2 rounded ${currentView === 'applicants' ? 'bg-white text-blue-600' : 'text-white hover:bg-white hover:bg-opacity-20'}`}
                >
                  <Users size={18} className="inline mr-2" />
                  Applicants
                </button>
                {isAdmin() && (
                  <>
                    <button
                      onClick={() => setCurrentView('users')}
                      className={`px-3 py-2 rounded ${currentView === 'users' ? 'bg-white text-blue-600' : 'text-white hover:bg-white hover:bg-opacity-20'}`}
                    >
                      <UserPlus size={18} className="inline mr-2" />
                      Users
                    </button>
                    <button
                      onClick={() => setCurrentView('presets')}
                      className={`px-3 py-2 rounded ${currentView === 'presets' ? 'bg-white text-blue-600' : 'text-white hover:bg-white hover:bg-opacity-20'}`}
                    >
                      <Settings size={18} className="inline mr-2" />
                      Presets
                    </button>
                  </>
                )}
                <button
                  onClick={() => setCurrentView('changePassword')}
                  className={`px-3 py-2 rounded ${currentView === 'changePassword' ? 'bg-white text-blue-600' : 'text-white hover:bg-white hover:bg-opacity-20'}`}
                >
                  <Key size={18} className="inline mr-2" />
                  Change Password
                </button>
              </nav>
              <button
                onClick={handleLogout}
                className="btn btn-outline text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default MainApp; 
