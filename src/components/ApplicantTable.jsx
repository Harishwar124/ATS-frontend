import React from "react";
import { Edit, Trash2, FileText, Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";

const ApplicantTable = ({ applicants, onEdit, onDelete, loading = false }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case "Applied":
        return "status-applied";
      case "Interviewed":
        return "status-interviewed";
      case "Hired":
        return "status-hired";
      case "Rejected":
        return "status-rejected";
      default:
        return "status-applied";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "-";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="spinner mb-4"></div>
        <p className="text-gray-500 font-medium">Loading applicants...</p>
      </div>
    );
  }

  if (!applicants || applicants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText size={48} className="text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Applicants Found</h3>
        <p className="text-gray-500 max-w-md">
          Get started by adding your first applicant using the "Add Applicant"
          button above.
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Position</th>
            <th>Company</th>
            <th>Annual CTC</th>
            <th>Location</th>
            <th>Status</th>
            <th>Application Date</th>
            <th>Interview Date</th>
            <th>Resume</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((applicant) => (
            <tr key={applicant._id} className="hover:bg-gray-50">
              <td>
                <div className="font-medium text-gray-900">
                  {applicant.fullName}
                </div>
                {applicant.notes && (
                  <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                    {applicant.notes.length > 50
                      ? `${applicant.notes.substring(0, 50)}...`
                      : applicant.notes}
                  </div>
                )}
              </td>
              <td>
                <a
                  href={`mailto:${applicant.email}`}
                  className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                >
                  {applicant.email}
                </a>
              </td>
              <td>
                {applicant.phone ? (
                  <a
                    href={`tel:${applicant.phone}`}
                    className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                  >
                    {applicant.phone}
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="font-medium">{applicant.position}</td>
              <td className="font-medium">{applicant.company || '-'}</td>
              <td className="font-medium">
                {applicant.annualCTC ? `₹${applicant.annualCTC.toLocaleString()}` : '-'}
              </td>
              <td>{applicant.location || '-'}</td>
              <td>
                <span
                  className={`status-badge ${getStatusClass(applicant.status)}`}
                >
                  {applicant.status}
                </span>
              </td>
              <td>{formatDate(applicant.dateOfApplication)}</td>
              <td>
                {applicant.interviewDate ? (
                  <div className="flex items-center gap-1 text-gray-700">
                    <Calendar size={14} className="text-gray-500" />
                    {formatDate(applicant.interviewDate)}
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td>
                {applicant.resumeFileName ? (
                  <a
                    href={`/uploads/resumes/${applicant.resumeFileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                  >
                    <FileText size={14} />
                    <span>View</span>
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(applicant)}
                    className="btn btn-outline p-2"
                    title="Edit applicant"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(applicant)}
                    className="btn btn-danger p-2"
                    title="Delete applicant"
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
  );
};

export default ApplicantTable;
