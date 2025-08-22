import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  X,
  Upload,
  FileText,
  Calendar,
  Mail,
  Phone,
  User,
  Briefcase,
  Building,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import api from "../services/api";

// JOB_ROLES will be loaded dynamically from backend

const ApplicantForm = ({
  isOpen,
  onClose,
  onSubmit,
  applicant = null,
  isLoading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [companies, setCompanies] = useState([]);
  const [positions, setPositions] = useState([]);
  const [showCustomCompany, setShowCustomCompany] = useState(false);
  const [showCustomPosition, setShowCustomPosition] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm();

  const selectedRole = watch("position");
  const selectedCompany = watch("company");

  // Load companies and positions when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPresets();
    }
  }, [isOpen]);

  const loadPresets = async () => {
    try {
      const [companiesResponse, positionsResponse] = await Promise.all([
        api.get('/companies'),
        api.get('/positions')
      ]);
      setCompanies(companiesResponse.data.companies || []);
      setPositions(positionsResponse.data.positions || []);
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  // Reset form when modal opens/closes or applicant changes
  useEffect(() => {
    if (isOpen) {
      if (applicant) {
        // Editing existing applicant
        setValue("fullName", applicant.fullName);
        setValue("email", applicant.email);
        setValue("phone", applicant.phone || "");
        setValue("position", applicant.position);
        setValue("customPosition", applicant.position);
        setValue("company", applicant.company);
        setValue("customCompany", applicant.company);
        setValue("annualCTC", applicant.annualCTC);
        setValue("location", applicant.location);
        setValue("status", applicant.status);
        setValue("notes", applicant.notes || "");

        if (applicant.dateOfApplication) {
          const date = new Date(applicant.dateOfApplication);
          setValue("dateOfApplication", format(date, "yyyy-MM-dd"));
        }

        if (applicant.interviewDate) {
          const date = new Date(applicant.interviewDate);
          setValue("interviewDate", format(date, "yyyy-MM-dd"));
        }

        // Check if the position is not in the presets list
        const positionExists = positions.some(pos => pos.positionName === applicant.position);
        setShowCustomPosition(!positionExists && applicant.position);
        
        // Check if company is not in presets
        const companyExists = companies.some(comp => comp.companyName === applicant.company);
        setShowCustomCompany(!companyExists && applicant.company);
      } else {
        // Adding new applicant
        reset();
        setValue("status", "Applied");
        setValue("dateOfApplication", format(new Date(), "yyyy-MM-dd"));
        setShowCustomPosition(false);
        setShowCustomCompany(false);
      }
      setSelectedFile(null);
      setFileError("");
    }
  }, [isOpen, applicant, setValue, reset, companies, positions]);

  // Watch for position changes to show/hide custom position input
  useEffect(() => {
    setShowCustomPosition(selectedRole === "Other");
  }, [selectedRole]);

  // Watch for company changes to show/hide custom company input
  useEffect(() => {
    setShowCustomCompany(selectedCompany === "Other");
  }, [selectedCompany]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError("");

    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        setFileError("Only PDF files are allowed");
        setSelectedFile(null);
        e.target.value = "";
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setFileError("File size must be less than 5MB");
        setSelectedFile(null);
        e.target.value = "";
        return;
      }

      setSelectedFile(file);
    }
  };

  const onFormSubmit = (data) => {
    const formData = {
      ...data,
      phone: data.phone || undefined,
      notes: data.notes || undefined,
      interviewDate: data.interviewDate || undefined,
      position: showCustomPosition ? data.customPosition : data.position,
      company: showCustomCompany ? data.customCompany : data.company,
    };

    if (selectedFile) {
      formData.resume = selectedFile;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  console.log('ApplicantForm opened:', { 
    mode: applicant ? 'edit' : 'add', 
    loading: isLoading,
    companiesLoaded: companies.length,
    positionsLoaded: positions.length
  });

  return (
    <div className="modal-backdrop">
      <div className="modal-content max-w-4xl animate-in fade-in duration-300">
        <div className="modal-header">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {applicant ? (
              <>
                <User className="text-primary-600" size={20} />
                Edit Applicant
              </>
            ) : (
              <>
                <User className="text-primary-600" size={20} />
                Add New Applicant
              </>
            )}
          </h2>
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

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="modal-body">
            {/* Form Status Info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <User size={16} />
                {applicant ? 'Edit Applicant Form' : 'Add New Applicant Form'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Status: {isLoading ? 'Loading...' : 'Ready to submit'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label flex items-center gap-1">
                  <User size={16} className="text-gray-500" />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.fullName
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: {
                      value: 2,
                      message: "Full name must be at least 2 characters",
                    },
                  })}
                  disabled={isLoading}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <div className="form-error">{errors.fullName.message}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-1">
                  <Mail size={16} className="text-gray-500" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className={`form-control ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  disabled={isLoading}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <div className="form-error">{errors.email.message}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-1">
                  <Phone size={16} className="text-gray-500" />
                  Phone
                </label>
                <input
                  type="tel"
                  className={`form-control ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  {...register("phone", {
                    pattern: {
                      value: /^\d{10,15}$/,
                      message: "Phone number must be 10-15 digits",
                    },
                  })}
                  disabled={isLoading}
                  placeholder="1234567890"
                />
                {errors.phone && (
                  <div className="form-error">{errors.phone.message}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-1">
                  <Briefcase size={16} className="text-gray-500" />
                  Position Applied For <span className="text-red-500">*</span>
                </label>
                <select
                  className={`form-control ${
                    errors.position
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  {...register("position", {
                    required: "Position is required",
                  })}
                  disabled={isLoading}
                >
                  <option value="">Select a position</option>
                  {positions.map((position) => (
                    <option key={position._id} value={position.positionName}>
                      {position.positionName}
                    </option>
                  ))}
                  <option value="Other">Other (Specify)</option>
                </select>
                {errors.position && (
                  <div className="form-error">{errors.position.message}</div>
                )}
              </div>

              {showCustomPosition && (
                <div className="form-group">
                  <label className="form-label flex items-center gap-1">
                    <Briefcase size={16} className="text-gray-500" />
                    Specify Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.customPosition
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : ""
                    }`}
                    {...register("customPosition", {
                      required: showCustomPosition ? "Please specify the position" : false,
                      minLength: {
                        value: 2,
                        message: "Position must be at least 2 characters",
                      },
                    })}
                    disabled={isLoading}
                    placeholder="Enter position"
                  />
                  {errors.customPosition && (
                    <div className="form-error">{errors.customPosition.message}</div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label className="form-label flex items-center gap-1">
                  <Building size={16} className="text-gray-500" />
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  className={`form-control ${
                    errors.company
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  {...register("company", {
                    required: "Company is required",
                  })}
                  disabled={isLoading}
                >
                  <option value="">Select a company</option>
                  {companies.map((company) => (
                    <option key={company._id} value={company.companyName}>
                      {company.companyName}
                    </option>
                  ))}
                  <option value="Other">Other (Specify)</option>
                </select>
                {errors.company && (
                  <div className="form-error">{errors.company.message}</div>
                )}
              </div>

              {showCustomCompany && (
                <div className="form-group">
                  <label className="form-label flex items-center gap-1">
                    <Building size={16} className="text-gray-500" />
                    Specify Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.customCompany
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : ""
                    }`}
                    {...register("customCompany", {
                      required: showCustomCompany ? "Please specify the company" : false,
                      minLength: {
                        value: 2,
                        message: "Company name must be at least 2 characters",
                      },
                    })}
                    disabled={isLoading}
                    placeholder="Enter company name"
                  />
                  {errors.customCompany && (
                    <div className="form-error">{errors.customCompany.message}</div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label className="form-label flex items-center gap-1">
                  <span className="text-gray-500 text-sm font-bold">₹</span>
                  Annual CTC (in Rupees) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${
                    errors.annualCTC
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  {...register("annualCTC", {
                    required: "Annual CTC is required",
                    min: {
                      value: 0,
                      message: "Annual CTC must be a positive number",
                    },
                  })}
                  disabled={isLoading}
                  placeholder="500000"
                />
                {errors.annualCTC && (
                  <div className="form-error">{errors.annualCTC.message}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-1">
                  <MapPin size={16} className="text-gray-500" />
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.location
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  {...register("location", {
                    required: "Location is required",
                    minLength: {
                      value: 2,
                      message: "Location must be at least 2 characters",
                    },
                  })}
                  disabled={isLoading}
                  placeholder="Mumbai, India"
                />
                {errors.location && (
                  <div className="form-error">{errors.location.message}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-1">
                  Status
                </label>
                <select
                  className={`form-control ${
                    errors.status
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  {...register("status")}
                  disabled={isLoading}
                >
                  <option value="Applied">Applied</option>
                  <option value="Interviewed">Interviewed</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
                {errors.status && (
                  <div className="form-error">{errors.status.message}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-1">
                  <Calendar size={16} className="text-gray-500" />
                  Application Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${
                    errors.dateOfApplication
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  {...register("dateOfApplication", {
                    required: "Application date is required",
                  })}
                  disabled={isLoading}
                />
                {errors.dateOfApplication && (
                  <div className="form-error">
                    {errors.dateOfApplication.message}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-1">
                  <Calendar size={16} className="text-gray-500" />
                  Interview Date
                </label>
                <input
                  type="date"
                  className={`form-control ${
                    errors.interviewDate
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                  {...register("interviewDate")}
                  disabled={isLoading}
                />
                {errors.interviewDate && (
                  <div className="form-error">
                    {errors.interviewDate.message}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group mt-4">
              <label className="form-label flex items-center gap-1">
                <FileText size={16} className="text-gray-500" />
                Resume (PDF only, max 5MB)
              </label>
              <div className="mt-1 flex items-center">
                <label className="block w-full">
                  <span className="sr-only">Choose resume file</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100
                      focus:outline-none"
                  />
                </label>
              </div>
              {selectedFile && (
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <FileText size={16} className="mr-1" />
                  {selectedFile.name} ({Math.round(selectedFile.size / 1024)}{" "}
                  KB)
                </div>
              )}
              {fileError && <div className="form-error">{fileError}</div>}
              {applicant?.resumeFileName && !selectedFile && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <FileText size={16} className="mr-1" />
                  Current resume: {applicant.resumeFileName}
                </div>
              )}
            </div>

            <div className="form-group mt-4">
              <label className="form-label">Notes</label>
              <textarea
                className={`form-control ${
                  errors.notes
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : ""
                }`}
                rows="3"
                {...register("notes")}
                disabled={isLoading}
                placeholder="Add any additional notes about the applicant..."
              ></textarea>
              {errors.notes && (
                <div className="form-error">{errors.notes.message}</div>
              )}
            </div>
          </div>

          <div className="modal-footer" style={{ background: '#f9fafb', padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '8px', minHeight: '70px' }}>
            {/* Form Actions */}
            <div className="text-xs text-gray-500 mr-auto flex items-center">
              <span>Required fields are marked with *</span>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isLoading}
              style={{ 
                padding: '8px 16px', 
                border: '1px solid #d1d5db', 
                backgroundColor: 'white', 
                color: '#374151',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#0ea5e9', 
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? (
                <span className="spinner h-4 w-4 mr-2"></span>
              ) : (
                <Upload size={16} />
              )}
              {applicant ? "Update Applicant" : "Save Applicant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicantForm;
