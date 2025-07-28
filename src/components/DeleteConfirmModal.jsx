import React, { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  applicant,
  isLoading = false,
}) => {
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAdminPassword("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!adminPassword.trim()) {
      setError("Admin password is required");
      return;
    }

    onConfirm(adminPassword);
  };

  const handlePasswordChange = (e) => {
    setAdminPassword(e.target.value);
    if (error) setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content animate-in fade-in duration-300">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            <h2 className="text-lg font-semibold">Confirm Deletion</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={isLoading}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="mb-6">
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md mb-4">
                <p className="mb-2 font-medium">
                  Are you sure you want to delete the application for{" "}
                  <span className="font-bold">{applicant?.fullName}</span>?
                </p>
                <p className="text-sm text-gray-600">
                  This action cannot be undone. The applicant record and any
                  uploaded resume will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Admin Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className={`form-control ${
                  error
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : ""
                }`}
                value={adminPassword}
                onChange={handlePasswordChange}
                disabled={isLoading}
                placeholder="Enter admin password to confirm deletion"
                autoFocus
              />
              {error && <div className="form-error">{error}</div>}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={isLoading || !adminPassword.trim()}
            >
              {isLoading ? (
                <span className="spinner h-4 w-4 mr-2"></span>
              ) : null}
              Delete Applicant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
