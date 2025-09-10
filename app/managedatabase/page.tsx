"use client";

import { useEffect, useState, ChangeEvent } from "react";
import {
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaSyncAlt,
  FaEye,
  FaDownload,
  FaFilePdf,
  FaFileExcel,
  FaUpload,
  FaRegWindowClose
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- Type Definitions ---
type Registration = {
  _id: string;
  ticketNo: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  dob?: string;
  experience?: string;
  institution?: string;
  callDateTime?: string;
  hearAboutUs?: string;
  currentProfession?: string;
  specialization?: string;
  learningGoals?: string;
  trainingPrograms?: string[];
  additionalPrograms?: string[];
  status: "upcoming" | "pending" | "completed";
  uploadId?: string;
  uploadName?: string;
  isExpired?: boolean;
};

// --- Mock Data for Dropdown Options ---
const allPrograms = [
  "Surgeon Training",
  "Surgical Staff Training",
  "Anesthesia Training for Robotic Surgery",
];
const allAdditionalPrograms = [
  "MantraSync Tele-Surgery Program",
  "Animal Lab Training",
  "Cadaver Lab Training",
];
const allSpecializations = [
  "Urology",
  "Gynecology",
  "Cardiac",
  "Thoracic",
  "General Surgery",
  "Head and Neck",
  "Colorectal",
  "Pediatric",
  "Oncology",
  "Others",
];
const allHearAboutUs = [
  "Website",
  "Social Media",
  "Colleague Referral",
  "Conference",
  "Other",
];
const allProfessions = [
  "Surgeon",
  "Assistant Surgeon",
  "Anesthesiologist",
  "Nurse",
  "Technician",
  "Bio Medical Engineer",
  "Others",
];

// --- Reusable Components ---

const Toast = ({ message, type }: { message: string; type: "success" | "error" | "info" }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl text-white font-medium z-[100] transition-colors duration-300`}
    style={{
      backgroundColor: type === "success" ? "#34D399" : type === "error" ? "#EF4444" : "#2563EB",
    }}
  >
    {message}
  </motion.div>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="bg-white rounded-xl p-8 shadow-2xl relative max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          onClick={onClose}
        >
          <FaTimes size={24} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
};

const SkeletonLoader = () => (
  <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg ring-1 ring-gray-200 animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <div className="h-6 bg-gray-200 rounded w-1/4" />
      <div className="h-10 w-24 bg-gray-200 rounded-lg" />
    </div>
    <div className="overflow-x-auto">
      <div className="w-full text-left text-xs sm:text-sm text-gray-500">
        <div className="grid grid-cols-7 gap-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="h-4 bg-gray-200 rounded col-span-1" />
          <div className="h-4 bg-gray-200 rounded col-span-1" />
          <div className="h-4 bg-gray-200 rounded col-span-1" />
          <div className="h-4 bg-gray-200 rounded col-span-1 hidden sm:block" />
          <div className="h-4 bg-gray-200 rounded col-span-1 hidden sm:block" />
          <div className="h-4 bg-gray-200 rounded col-span-1 hidden md:block" />
          <div className="h-4 bg-gray-200 rounded col-span-1" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-7 gap-4 py-4 border-b border-gray-200">
            <div className="h-4 bg-gray-100 rounded col-span-1" />
            <div className="h-4 bg-gray-100 rounded col-span-1" />
            <div className="h-4 bg-gray-100 rounded col-span-1" />
            <div className="h-4 bg-gray-100 rounded col-span-1 hidden sm:block" />
            <div className="h-4 bg-gray-100 rounded col-span-1 hidden sm:block" />
            <div className="h-4 bg-gray-100 rounded col-span-1 hidden md:block" />
            <div className="h-4 bg-gray-100 rounded col-span-1" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: "pdf" | "excel", registrationId?: string | "all") => void;
  exportingId?: string | "all";
}

const ExportModal = ({ isOpen, onClose, onExport, exportingId }: ExportModalProps) => {
  if (!isOpen) return null;

  const handleExportClick = (format: "pdf" | "excel") => {
    onExport(format, exportingId);
    onClose();
  };

  const title = exportingId === "all" ? "Export All Registration Data" : "Export Selected Registration";
  const description = exportingId === "all"
    ? "Please select a file format to download all registration records from the database."
    : "Please select a file format to download the details of the selected registration.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-2xl relative max-w-md w-full border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-5">{description}</p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleExportClick("pdf")}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center hover:bg-red-700 transition-colors"
          >
            <FaFilePdf className="mr-2" /> Export as PDF
          </button>
          <button
            onClick={() => handleExportClick("excel")}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center hover:bg-green-700 transition-colors"
          >
            <FaFileExcel className="mr-2" /> Export as Excel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};


// --- Main Page Component ---
export default function ManageDatabasePage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Registration | null>(null);
  const [viewing, setViewing] = useState<Registration | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportingId, setExportingId] = useState<string | "all" | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/registrations`);
      if (!res.ok) throw new Error("Network response was not ok.");
      const data = await res.json();
      setRegistrations(data.data);
      showToast("Data refreshed successfully.", "success");
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("Failed to fetch registrations. Please check your backend connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (idToDelete === null) return;
    try {
      const res = await fetch(`/api/registrations/${idToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Registration successfully deleted.", "success");
        fetchRegistrations();
      } else {
        showToast(`Delete failed: ${data.error}`, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Delete failed. An unexpected error occurred.", "error");
    } finally {
      setShowConfirmModal(false);
      setIdToDelete(null);
    }
  };

  const handleConfirmDelete = (_id: string) => {
    setIdToDelete(_id);
    setShowConfirmModal(true);
  };

const handleEditSubmit = async () => {
  if (!editing) return;

  try {
    const payload = {
      ...editing,
      ticketNo: Number(editing.ticketNo || 0),
      // Add other numeric fields here if any
    };

    const res = await fetch(`/api/registrations/${editing._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      setEditing(null);
      setSelectedFile(null);
      showToast("Registration successfully updated.", "success");
      fetchRegistrations();
    } else {
      showToast(`Update failed: ${data.error}`, "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Update failed. An unexpected error occurred.", "error");
  }
};


  const updateStatus = async (_id: string, newStatus: Registration['status']) => {
    const originalStatus = registrations.find(reg => reg._id === _id)?.status;
    
    // Optimistic update
    setRegistrations(prev =>
      prev.map(reg =>
        reg._id === _id ? { ...reg, status: newStatus } : reg
      )
    );

    try {
      const res = await fetch(`/api/registrations/${_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Status updated successfully.", "success");
      } else {
        // Revert to original status if API call fails
        setRegistrations(prev =>
          prev.map(reg =>
            reg._id === _id ? { ...reg, status: originalStatus || reg.status } : reg
          )
        );
        showToast(`Status update failed: ${data.error}`, "error");
      }
    } catch (err) {
      console.error(err);
      // Revert to original status on network error
      setRegistrations(prev =>
        prev.map(reg =>
          reg._id === _id ? { ...reg, status: originalStatus || reg.status } : reg
        )
      );
      showToast("Status update failed. An unexpected error occurred.", "error");
    }
  };

  const handleExport = (format: "pdf" | "excel", _id?: string | "all") => {
    console.log(`Export request: ID=${_id}, Format=${format}`);
    alert(`Exporting ${_id === "all" ? "all data" : `registration with ID ${_id}`} as ${format}. This is a placeholder action, no file will be downloaded.`);
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const formatDateTimeForInput = (dateTimeString: string | undefined) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 16);
  };

  const getStatusColor = (status: Registration['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const prepareForEdit = (reg: Registration) => {
    setEditing(reg);
    setViewing(null);
  };

  const prepareForView = (reg: Registration) => {
    setViewing(reg);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    if (editing) {
      setEditing({ ...editing, uploadId: '', uploadName: '' });
      setSelectedFile(null);
    }
  };

  const isSelected = (value: string, key: 'trainingPrograms' | 'additionalPrograms') => {
    if (!editing || !editing[key]) return false;
    return (editing[key] as string[]).includes(value);
  };
  
  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-100 font-sans text-gray-800">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <header className="sticky top-0 z-10 bg-gray-100/90 backdrop-blur-sm pt-4 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Manage Database</h1>
            <p className="text-base sm:text-lg text-gray-600 mt-1">
              View, edit, and delete user registration records.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={fetchRegistrations}
              className="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSyncAlt className="mr-2" />
              Refresh Data
            </motion.button>
            <motion.button
              onClick={() => {
                setExportingId("all");
                setExportModalOpen(true);
              }}
              className="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-900 transition-colors duration-200 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaDownload className="mr-2" />
              Export All Data
            </motion.button>
          </div>
        </header>

        {/* Loading State */}
        {loading && <SkeletonLoader />}

        {/* Main Table */}
        {!loading && (
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg ring-1 ring-gray-200 overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-gray-500">
              <thead className="text-2xs sm:text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="p-3 w-[5%]">Ticket No.</th>
                  <th className="p-3 w-[15%]">Full Name</th>
                  <th className="p-3 w-[20%]">Email</th>
                  <th className="p-3 w-[12%] hidden sm:table-cell">Profession</th>
                  <th className="p-3 w-[15%] hidden sm:table-cell">Status</th>
                  <th className="p-3 w-[15%] hidden md:table-cell">Institution</th>
                  <th className="p-3 w-[18%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {registrations.length > 0 ? (
                    registrations.map((r, index) => (
                      <motion.tr
                        key={r._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="p-3 whitespace-nowrap">{r.ticketNo}</td>
                        <td className="p-3 whitespace-nowrap">{r.fullName}</td>
                        <td className="p-3 whitespace-nowrap text-blue-600 font-medium">{r.email}</td>
                        <td className="p-3 whitespace-nowrap hidden sm:table-cell">{r.currentProfession || 'N/A'}</td>
                        <td className="p-3 whitespace-nowrap hidden sm:table-cell">
                          <select
                            value={r.status}
                            onChange={(e) => updateStatus(r._id, e.target.value as Registration['status'])}
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getStatusColor(r.status)} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="p-3 whitespace-nowrap hidden md:table-cell">{r.institution || 'N/A'}</td>
                        <td className="p-3 whitespace-nowrap flex space-x-2">
                          <button
                            className="bg-blue-600 text-white px-2 py-1 rounded-md flex items-center hover:bg-blue-700 transition-colors duration-200 text-sm cursor-pointer"
                            onClick={() => prepareForView(r)}
                          >
                            <FaEye className="md:mr-1" /> <span className="hidden md:inline">View</span>
                          </button>
                          <button
                            className="bg-rose-600 text-white px-2 py-1 rounded-md flex items-center hover:bg-rose-700 transition-colors duration-200 text-sm cursor-pointer"
                            onClick={() => handleConfirmDelete(r._id)}
                          >
                            <FaTrash className="md:mr-1" /> <span className="hidden md:inline">Delete</span>
                          </button>
                          <button
                            className="bg-gray-700 text-white px-2 py-1 rounded-md flex items-center hover:bg-gray-800 transition-colors duration-200 text-sm cursor-pointer"
                            onClick={() => {
                              setExportingId(r._id);
                              setExportModalOpen(true);
                            }}
                          >
                            <FaDownload className="md:mr-1" /> <span className="hidden md:inline">Export</span>
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-gray-500">
                        No registrations found.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* View Modal */}
        <AnimatePresence>
          {viewing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
              onClick={() => setViewing(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white text-gray-900 rounded-3xl p-8 shadow-2xl relative max-w-4xl w-full border-2 border-gray-200 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
                  <h2 className="text-2xl font-bold text-gray-900">Registration Details</h2>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => prepareForEdit(viewing)} className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-blue-700 transition-colors cursor-pointer">
                      <FaEdit className="mr-2" /> Edit
                    </button>
                    <button onClick={() => setViewing(null)} className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer">
                      <FaTimes size={24} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(viewing).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                    let displayValue = value;
                    let isFileLink = false;
                    
                    if (key === 'trainingPrograms' || key === 'additionalPrograms') {
                      displayValue = Array.isArray(value) ? value.join(", ") : value;
                    } else if (key === 'dob' && value) {
                      const date = new Date(value as string);
                      displayValue = isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
                    } else if (key === 'callDateTime' && value) {
                      const date = new Date(value as string);
                      displayValue = isNaN(date.getTime()) ? "N/A" : `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                    } else if (key === 'uploadId' && value) {
                      isFileLink = true;
                    } else if (key === "_id") {
                      return null; // Skip _id in the view modal
                    }

                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                        className="bg-gray-50 rounded-xl p-4 shadow-sm border-2 border-gray-300 transition-transform duration-300 hover:shadow-lg hover:scale-105"
                      >
                        <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</span>
                        {isFileLink ? (
                          <a 
                            href={`/api/uploads/${value}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-700 cursor-pointer"
                          >
                            <FaDownload className="mr-2" /> View File
                          </a>
                        ) : (
                          <span className="block text-sm text-gray-800 font-medium capitalize">{displayValue || "N/A"}</span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
              onClick={() => { setEditing(null); setSelectedFile(null); }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white text-gray-900 rounded-3xl p-8 shadow-2xl relative max-w-4xl w-full border-2 border-gray-200 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Registration</h2>
                  <button onClick={() => { setEditing(null); setSelectedFile(null); }} className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer">
                    <FaTimes size={24} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {/* Full Name */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editing.fullName}
                      onChange={(e) => setEditing({ ...editing, fullName: e.target.value })}
                      className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>
                  {/* Email */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={editing.email}
                      onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                      className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>
                  {/* Phone Number */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editing.phoneNumber || ''}
                      onChange={(e) => setEditing({ ...editing, phoneNumber: e.target.value })}
                      className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>
                  {/* DOB */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formatDateForInput(editing.dob)}
                      onChange={(e) => setEditing({ ...editing, dob: e.target.value })}
                      className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>
                  {/* Experience */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Experience</label>
                    <input
                      type="text"
                      value={editing.experience || ''}
                      onChange={(e) => setEditing({ ...editing, experience: e.target.value })}
                      className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>
                  {/* Institution */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Institution</label>
                    <input
                      type="text"
                      value={editing.institution || ''}
                      onChange={(e) => setEditing({ ...editing, institution: e.target.value })}
                      className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>
                  {/* Call Date/Time */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Call Date/Time</label>
                    <input
                      type="datetime-local"
                      value={formatDateTimeForInput(editing.callDateTime)}
                      onChange={(e) => setEditing({ ...editing, callDateTime: e.target.value })}
                      className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>
                  {/* Hear About Us */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">How Did You Hear About Us?</label>
                    <select
                      value={editing.hearAboutUs || ''}
                      onChange={(e) => setEditing({ ...editing, hearAboutUs: e.target.value })}
                      className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    >
                      <option value="">Select an option</option>
                      {allHearAboutUs.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  {/* Current Profession */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Current Profession</label>
                    <select
                      value={editing.currentProfession || ''}
                      onChange={(e) => setEditing({ ...editing, currentProfession: e.target.value })}
                      className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    >
                      <option value="">Select an option</option>
                      {allProfessions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  {/* Specialization */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Specialization</label>
                    <select
                      value={editing.specialization || ''}
                      onChange={(e) => setEditing({ ...editing, specialization: e.target.value })}
                      className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    >
                      <option value="">Select an option</option>
                      {allSpecializations.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  {/* Learning Goals */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Learning Goals</label>
                    <textarea
                      value={editing.learningGoals || ''}
                      onChange={(e) => setEditing({ ...editing, learningGoals: e.target.value })}
                      rows={3}
                      className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>
                  {/* Status */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Status</label>
                    <select
                      value={editing.status}
                      onChange={(e) => setEditing({ ...editing, status: e.target.value as Registration['status'] })}
                      className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                   {/* Training Programs */}
                   <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Training Programs</label>
                    <div className="space-y-2 mt-2">
                      {allPrograms.map(p => (
                        <div key={p} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`tp-${p}`}
                            value={p}
                            checked={isSelected(p, 'trainingPrograms')}
                            onChange={(e) => {
                              const updatedPrograms = e.target.checked
                                ? [...(editing.trainingPrograms || []), p]
                                : (editing.trainingPrograms || []).filter(prog => prog !== p);
                              setEditing({ ...editing, trainingPrograms: updatedPrograms });
                            }}
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`tp-${p}`} className="text-sm text-gray-700">{p}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Additional Programs */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Additional Programs</label>
                    <div className="space-y-2 mt-2">
                      {allAdditionalPrograms.map(p => (
                        <div key={p} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`ap-${p}`}
                            value={p}
                            checked={isSelected(p, 'additionalPrograms')}
                            onChange={(e) => {
                              const updatedPrograms = e.target.checked
                                ? [...(editing.additionalPrograms || []), p]
                                : (editing.additionalPrograms || []).filter(prog => prog !== p);
                              setEditing({ ...editing, additionalPrograms: updatedPrograms });
                            }}
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`ap-${p}`} className="text-sm text-gray-700">{p}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Upload ID */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Upload ID</label>
                    <div className="flex flex-col gap-2">
                       {editing.uploadId && !selectedFile ? (
                        <div className="flex items-center gap-2">
                          <a 
                            href={`/api/uploads/${editing.uploadId}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center transition-colors hover:bg-blue-600 cursor-pointer"
                          >
                            <FaEye className="mr-2" /> View Current File
                          </a>
                          <button
                            type="button"
                            onClick={clearFile}
                            className="bg-rose-500 text-white text-sm font-medium p-2 rounded-lg flex items-center transition-colors hover:bg-rose-600 cursor-pointer"
                          >
                            <FaRegWindowClose />
                          </button>
                        </div>
                      ) : selectedFile ? (
                        <div className="text-sm text-gray-700 flex items-center">
                          <FaUpload className="mr-2" />
                          <span>{selectedFile.name}</span>
                          <button type="button" onClick={() => setSelectedFile(null)} className="ml-auto text-rose-500 hover:text-rose-700">
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <label htmlFor="file-upload" className="w-full bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-300 cursor-pointer">
                            <FaUpload className="mr-2" />
                            Choose File
                          </label>
                          <input 
                            id="file-upload" 
                            type="file" 
                            onChange={handleFileChange} 
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 gap-3">
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-600 transition-colors duration-200 flex items-center cursor-pointer"
                    onClick={() => { setEditing(null); setSelectedFile(null); }}
                  >
                    <FaTimes className="mr-2" />
                    Cancel
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-700 transition-colors duration-200 flex items-center cursor-pointer"
                    onClick={handleEditSubmit}
                  >
                    <FaSave className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Custom Delete Confirmation Modal */}
        <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
          <p className="text-gray-600 mb-6">Are you sure you want to permanently delete this registration?</p>
          <div className="flex justify-end space-x-3">
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 cursor-pointer"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </button>
            <button
              className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 cursor-pointer"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </Modal>

        {/* Export Modal */}
        <ExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          onExport={handleExport}
          exportingId={exportingId}
        />
      </div>
    </div>
  );
}