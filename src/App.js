import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Plus, Download, Users } from "lucide-react";
import ApplicantTable from "./components/ApplicantTable";
import ApplicantForm from "./components/ApplicantForm";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import { applicantAPI } from "./services/api";

function App() {
  const [applicants, setApplicants] = useState([]);
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
    loadApplicants();
  }, []);

  const loadApplicants = async () => {
    try {
      setLoading(true);
      const response = await applicantAPI.getAll();
      setApplicants(response.data || []);
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
      await applicantAPI.exportToExcel();
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

  return (
    <div className="App">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            style: {
              background: "#10b981",
            },
          },
          error: {
            style: {
              background: "#ef4444",
            },
          },
        }}
      />

      {/* Header */}
      <header className="header">
        <div className="container">
          <h1>Applicant Tracking System</h1>
          <p>Manage job applications efficiently</p>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="container"
        style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
      >
        {/* Action Bar */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users size={24} />
                <h2 className="text-xl font-semibold">
                  Applicants ({applicants.length})
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="btn btn-success"
                  disabled={exportLoading || applicants.length === 0}
                >
                  {exportLoading ? (
                    <div className="spinner" />
                  ) : (
                    <Download size={18} />
                  )}
                  Export to Excel
                </button>
                <button
                  onClick={handleAddApplicant}
                  className="btn btn-primary"
                >
                  <Plus size={18} />
                  Add Applicant
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Applicants Table */}
        <ApplicantTable
          applicants={applicants}
          onEdit={handleEditApplicant}
          onDelete={handleDeleteApplicant}
          loading={loading}
        />

        {/* Add/Edit Form Modal */}
        <ApplicantForm
          isOpen={showForm}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          applicant={editingApplicant}
          loading={formLoading}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={handleDeleteClose}
          onConfirm={handleDeleteConfirm}
          applicantName={deletingApplicant?.fullName}
          loading={deleteLoading}
        />
      </main>

      {/* Footer */}
      <footer
        style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}
      >
        <p>&copy; 2024 Applicant Tracking System. Built with MERN Stack.</p>
      </footer>
    </div>
  );
}

export default App;
