"use client";

import { useEffect, useState, useMemo, ChangeEvent } from "react";
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
  ticketNo: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  experience: string;
  institution: string;
  callDateTime: string;
  hearAboutUs: string;
  currentProfession: string;
  specialization: string;
  learningGoals: string;
  trainingPrograms: string | string[];
  additionalPrograms: string | string[];
  status: "upcoming" | "pending" | "completed";
  uploadId?: string;
};

// --- Mock Data ---
const allPrograms = [
  "Program A",
  "Program B",
  "Program C",
  "Program D",
  "Program E",
];
const allSpecializations = [
  "Specialization X",
  "Specialization Y",
  "Specialization Z",
];
const allHearAboutUs = ["Google", "Facebook", "Friend", "Website"];

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

// New Modal for Exporting Data
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
  const [ticketNoToDelete, setTicketNoToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportingId, setExportingId] = useState<string | "all" | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const API = "http://localhost/backend-php";

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/get_registrations.php`);
      if (!res.ok) throw new Error("Network response was not ok.");
      const data = await res.json();
      setRegistrations(data);
      showToast("Data refreshed successfully.", "success");
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("Failed to fetch registrations. Please check your backend connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (ticketNoToDelete === null) return;
    try {
      const res = await fetch(`${API}/delete_registration.php?ticketNo=${ticketNoToDelete}`, {
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
      setTicketNoToDelete(null);
    }
  };

  const handleConfirmDelete = (ticketNo: string) => {
    setTicketNoToDelete(ticketNo);
    setShowConfirmModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editing) return;
    try {
      const formData = new FormData();
      Object.entries(editing).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, value.join(', '));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      if (selectedFile) {
        formData.append("uploadFile", selectedFile);
      } else if (editing.uploadId === '') {
        formData.append("uploadId", '');
      }

      const res = await fetch(`${API}/update_registration.php`, {
        method: "POST",
        body: formData,
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

  const updateStatus = async (ticketNo: string, newStatus: Registration['status']) => {
    const originalStatus = registrations.find(reg => reg.ticketNo === ticketNo)?.status;
    
    // Optimistic update
    setRegistrations(prev =>
      prev.map(reg =>
        reg.ticketNo === ticketNo ? { ...reg, status: newStatus } : reg
      )
    );

    try {
      const res = await fetch(`${API}/update_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketNo, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Status updated successfully.", "success");
      } else {
        // Revert to original status if API call fails
        setRegistrations(prev =>
          prev.map(reg =>
            reg.ticketNo === ticketNo ? { ...reg, status: originalStatus || reg.status } : reg
          )
        );
        showToast(`Status update failed: ${data.error}`, "error");
      }
    } catch (err) {
      console.error(err);
      // Revert to original status on network error
      setRegistrations(prev =>
        prev.map(reg =>
          reg.ticketNo === ticketNo ? { ...reg, status: originalStatus || reg.status } : reg
        )
      );
      showToast("Status update failed. An unexpected error occurred.", "error");
    }
  };

  const handleExport = (format: "pdf" | "excel", ticketNo?: string | "all") => {
    console.log(`Export request: Ticket No=${ticketNo}, Format=${format}`);
    alert(`Exporting ${ticketNo === "all" ? "all data" : `registration with Ticket No. ${ticketNo}`} as ${format}. This is a placeholder action, no file will be downloaded.`);
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const formatDateTimeForInput = (dateTimeString: string) => {
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

  const handleProgramChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!editing) return;
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setEditing({ ...editing, trainingPrograms: selectedOptions });
  };
  
  const handleAdditionalProgramChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!editing) return;
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setEditing({ ...editing, additionalPrograms: selectedOptions });
  };

  const prepareForEdit = (reg: Registration) => {
    const editData = { ...reg };
    if (typeof editData.trainingPrograms === "string") {
      editData.trainingPrograms = editData.trainingPrograms.split(', ').filter(p => p);
    }
    if (typeof editData.additionalPrograms === "string") {
      editData.additionalPrograms = editData.additionalPrograms.split(', ').filter(p => p);
    }
    setEditing(editData);
    setViewing(null); // Close view modal if open
  };
  
  const prepareForView = (reg: Registration) => {
    const viewData = { ...reg };
    if (typeof viewData.trainingPrograms === "string") {
      viewData.trainingPrograms = viewData.trainingPrograms.split(', ').filter(p => p);
    }
    if (typeof viewData.additionalPrograms === "string") {
      viewData.additionalPrograms = viewData.additionalPrograms.split(', ').filter(p => p);
    }
    setViewing(viewData);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    if (editing) {
      setEditing({ ...editing, uploadId: '' });
      setSelectedFile(null);
    }
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
                        key={r.ticketNo}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="p-3 whitespace-nowrap">{r.ticketNo}</td>
                        <td className="p-3 whitespace-nowrap">{r.fullName}</td>
                        <td className="p-3 whitespace-nowrap text-blue-600 font-medium">{r.email}</td>
                        <td className="p-3 whitespace-nowrap hidden sm:table-cell">{r.currentProfession}</td>
                        <td className="p-3 whitespace-nowrap hidden sm:table-cell">
                          <select
                            value={r.status}
                            onChange={(e) => updateStatus(r.ticketNo, e.target.value as Registration['status'])}
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getStatusColor(r.status)} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="p-3 whitespace-nowrap hidden md:table-cell">{r.institution}</td>
                        <td className="p-3 whitespace-nowrap flex space-x-2">
                          <button
                            className="bg-blue-600 text-white px-2 py-1 rounded-md flex items-center hover:bg-blue-700 transition-colors duration-200 text-sm cursor-pointer"
                            onClick={() => prepareForView(r)}
                          >
                            <FaEye className="md:mr-1" /> <span className="hidden md:inline">View</span>
                          </button>
                          <button
                            className="bg-rose-600 text-white px-2 py-1 rounded-md flex items-center hover:bg-rose-700 transition-colors duration-200 text-sm cursor-pointer"
                            onClick={() => handleConfirmDelete(r.ticketNo)}
                          >
                            <FaTrash className="md:mr-1" /> <span className="hidden md:inline">Delete</span>
                          </button>
                          <button
                            className="bg-gray-700 text-white px-2 py-1 rounded-md flex items-center hover:bg-gray-800 transition-colors duration-200 text-sm cursor-pointer"
                            onClick={() => {
                              setExportingId(r.ticketNo);
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
                            href={`${API}/${value}`} 
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
                  {Object.entries(editing).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                    
                    const commonInputClasses = "border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm";
                    
                    switch (key) {
                      case "ticketNo":
                        return (
                          <div key={key}>
                            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">{label}</label>
                            <input
                              type="text"
                              value={value as string}
                              readOnly
                              disabled
                              className={`${commonInputClasses} bg-gray-100 cursor-not-allowed`}
                            />
                          </div>
                        );
                      case "dob":
                        return (
                          <div key={key}>
                            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">{label}</label>
                            <input
                              type="date"
                              value={formatDateForInput(value as string)}
                              onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                              className={commonInputClasses}
                            />
                          </div>
                        );
                      case "callDateTime":
                        return (
                          <div key={key}>
                            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">{label}</label>
                            <input
                              type="datetime-local"
                              value={formatDateTimeForInput(value as string)}
                              onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                              className={commonInputClasses}
                            />
                          </div>
                        );
                      case "trainingPrograms":
                      case "additionalPrograms":
                        const programsArray = Array.isArray(value) ? value : (value as string)?.split(', ').map(p => p.trim()) || [];
                        return (
                          <div key={key} className="col-span-1">
                            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">{label}</label>
                            <select
                              multiple
                              value={programsArray}
                              onChange={e => {
                                const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
                                setEditing({ ...editing, [key]: selectedOptions });
                              }}
                              className={`${commonInputClasses} h-32 w-full cursor-pointer`}
                            >
                              {allPrograms.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>
                        );
                      case "specialization":
                        return (
                          <div key={key}>
                            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">{label}</label>
                            <select
                              value={value as string}
                              onChange={(e) => setEditing({ ...editing, specialization: e.target.value })}
                              className={`${commonInputClasses} w-full cursor-pointer`}
                            >
                              <option value="">Select Specialization</option>
                              {allSpecializations.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        );
                      case "hearAboutUs":
                        return (
                          <div key={key}>
                            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">{label}</label>
                            <select
                              value={value as string}
                              onChange={(e) => setEditing({ ...editing, hearAboutUs: e.target.value })}
                              className={`${commonInputClasses} w-full cursor-pointer`}
                            >
                              <option value="">How did you hear about us?</option>
                              {allHearAboutUs.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>
                        );
                      case "status":
                        return (
                          <div key={key}>
                            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">{label}</label>
                            <select
                              value={value as string}
                              onChange={(e) => setEditing({ ...editing, status: e.target.value as Registration['status'] })}
                              className={`${commonInputClasses} w-full cursor-pointer`}
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        );
                      case "uploadId":
                        return (
                          <div key={key}>
                            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">{label}</label>
                            <div className="flex flex-col gap-2">
                               {editing.uploadId && !selectedFile ? (
                                <div className="flex items-center gap-2">
                                  <a
                                    href={`${API}/${editing.uploadId}`}
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
                        );
                      default:
                        return (
                          <div key={key} className="col-span-1">
                            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">{label}</label>
                            <input
                              type="text"
                              value={value as string}
                              onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                              placeholder={label}
                              className={commonInputClasses}
                            />
                          </div>
                        );
                    }
                  })}
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