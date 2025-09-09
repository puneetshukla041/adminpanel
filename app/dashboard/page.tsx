'use client';

import { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Image from 'next/image';

// Type definition for a single registration entry.
type Registration = {
  _id: string; // Changed from ticketNo to _id for MongoDB
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
  trainingPrograms: string;
  additionalPrograms: string;
  uploadId: string;
  status: 'upcoming' | 'pending' | 'completed';
  isExpired: boolean;
};

// SVG Icon Components for a professional look.
const IconSort = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 4h10" />
    <path d="M10 12l4-4l-4-4" />
    <path d="M17 20h-10" />
    <path d="M14 12l-4 4l4 4" />
  </svg>
);

const IconSortUp = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 5v14" />
    <path d="M19 12l-7-7-7 7" />
  </svg>
);

const IconSortDown = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 5v14" />
    <path d="M5 12l7 7l7-7" />
  </svg>
);

const IconUsers = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconCheckCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.62" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
);

const IconChartLine = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 3v18h18" />
    <path d="M18 17l-9-9l-5 5" />
    <path d="M14 7l4-4l4 4" />
  </svg>
);

const IconGraduationCap = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21.42 10.97a2.53 2.53 0 0 0-1.89-1.28L12 8l-7.53 1.69a2.53 2.53 0 0 0-1.89 1.28L.7 18.23a2 2 0 0 0 .7 2.12a2 2 0 0 0 2.12.7L20.2 21.05a2 2 0 0 0 2.12-.7a2 2 0 0 0 .7-2.12z" />
    <path d="M12 8v12" />
    <path d="M18 10v10" />
    <path d="M6 10v10" />
  </svg>
);

const IconDownload = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconFilePdf = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M10 13a2 2 0 0 0-2 2v2" />
    <path d="M14 17a2 2 0 0 0 2-2v-2" />
  </svg>
);

const IconFileExcel = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M18 10h-4v4h-4v4h4v-4h4v-4z" />
  </svg>
);

const IconEye = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 12s3-7 10-7s10 7 10 7s-3 7-10 7s-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconSpinner = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M4.93 4.93l2.83 2.83" />
    <path d="M16.24 16.24l2.83 2.83" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M4.93 19.07l2.83-2.83" />
    <path d="M16.24 7.76l2.83-2.83" />
  </svg>
);


// Reusable Modal for Viewing Details
interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
}

const ViewModal = ({ isOpen, onClose, registration }: ViewModalProps) => {
  if (!isOpen || !registration) return null;

  const labelMap: Record<keyof Registration, string> = {
    _id: 'Ticket No.',
    fullName: 'Full Name',
    email: 'Email Address',
    phoneNumber: 'Phone Number',
    dob: 'Date of Birth',
    experience: 'Professional Experience',
    institution: 'Institution',
    callDateTime: 'Call Scheduled',
    hearAboutUs: 'Heard About Us',
    currentProfession: 'Current Profession',
    specialization: 'Area of Specialization',
    learningGoals: 'Learning Goals',
    trainingPrograms: 'Training Programs',
    additionalPrograms: 'Additional Programs',
    uploadId: 'ID Card Upload',
    status: 'Application Status',
    isExpired: 'Is Expired',
  };

  const formatValue = (key: keyof Registration, value: any) => {
    if (key === 'callDateTime' && value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      }
    }
    if (key === 'uploadId' && value) {
      // Note: This URL might need to be adjusted based on where your files are stored.
      // Assuming a public folder or a new API route for file serving.
      const fileUrl = `/api/files?id=${value}`;
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
          View File
        </a>
      );
    }
    return value !== null && value !== undefined ? String(value) : 'N/A';
  };

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
        className="bg-white text-gray-900 rounded-3xl p-8 shadow-2xl relative max-w-4xl w-full border-2 border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Registration Details
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Comprehensive profile for <span className="font-semibold text-blue-600">{registration.fullName}</span>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(registration)
            .filter(([key]) => key !== "_id")
            .map(([key, value]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="bg-gray-50 rounded-xl p-4 shadow-sm border-2 border-gray-300 transition-transform duration-300 hover:shadow-lg hover:scale-105"
              >
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  {labelMap[key as keyof Registration] || key}
                </span>
                <span className="block text-sm text-gray-800 font-medium capitalize">
                  {formatValue(key as keyof Registration, value)}
                </span>
              </motion.div>
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Reusable Modal for Exporting Data
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'excel', registrationId: string | string[] | 'all') => void;
  exportingId: string | string[] | 'all' | undefined;
}


const ExportModal = ({ isOpen, onClose, onExport, exportingId }: ExportModalProps) => {
  if (!isOpen) return null;

  const handleExport = (format: 'pdf' | 'excel') => {
    onExport(format, exportingId!);
    onClose();
  };

  const isBulkExport = Array.isArray(exportingId) && exportingId.length > 1;
  const title = isBulkExport ? `Export ${exportingId.length} Registrations` : (exportingId === 'all' ? 'Export All Data' : 'Export Selected Registration');
  const description = isBulkExport
    ? `Select a file format to download the details for ${exportingId.length} selected registrations.`
    : (exportingId === 'all'
      ? 'Select a file format to download all registration records.'
      : 'Select a file format to download the details of this registration.');

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
        className="bg-white text-gray-900 rounded-2xl p-6 shadow-2xl relative max-w-sm w-full border-2 border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-5">{description}</p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleExport('pdf')}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 hover:bg-red-700 active:scale-95 cursor-pointer"
          >
            <IconFilePdf className="mr-2 h-5 w-5 fill-white stroke-red-600" /> Export as PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 hover:bg-green-700 active:scale-95 cursor-pointer"
          >
            <IconFileExcel className="mr-2 h-5 w-5 fill-white stroke-green-600" /> Export as Excel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Data Visualization Component
interface DataVisualizationsProps {
  registrations: Registration[];
}

const DataVisualizations = ({ registrations }: DataVisualizationsProps) => {
  // Aggregate data for monthly registrations bar chart
  const monthlyData = useMemo(() => {
    const data: { [key: string]: number } = {};
    registrations.forEach(reg => {
      const date = new Date(reg.callDateTime);
      if (!isNaN(date.getTime())) {
        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        data[monthYear] = (data[monthYear] || 0) + 1;
      }
    });
    return Object.entries(data).map(([name, count]) => ({ name, registrations: count }));
  }, [registrations]);

  // Aggregate data for status pie chart
  const statusData = useMemo(() => {
    const upcomingCount = registrations.filter(r => r.status === 'upcoming').length;
    const pendingCount = registrations.filter(r => r.status === 'pending').length;
    const completedCount = registrations.filter(r => r.status === 'completed').length;
    return [
      { name: 'Upcoming', value: upcomingCount, color: '#3b82f6' },
      { name: 'Pending', value: pendingCount, color: '#f59e0b' },
      { name: 'Completed', value: completedCount, color: '#22c55e' },
    ].filter(d => d.value > 0);
  }, [registrations]);

  const COLORS = ['#3b82f6', '#f59e0b', '#22c55e'];

  return (
    <section className="mb-8 p-6 bg-white rounded-2xl shadow-xl ring-1 ring-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="p-4 bg-gray-50 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Registrations Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px' }}
              />
              <Bar dataKey="registrations" fill="#3b82f6" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Pie Chart */}
        <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Registration Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );

};

export default function DashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof Omit<Registration, '_id'>>('fullName');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewing, setViewing] = useState<Registration | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportingId, setExportingId] = useState<string | string[] | 'all' | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'pending' | 'completed'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [dateRangePreset, setDateRangePreset] = useState<string>('all');

  const fetchRegistrations = async () => {
    try {
      const res = await fetch('/backend/api/registrations');
      if (!res.ok) throw new Error('Failed to fetch registrations data.');
      const { data } = await res.json();
      setRegistrations(data);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const updateStatus = async (_id: string, newStatus: Registration['status']) => {
    setLoading(true);
    try {
      const res = await fetch(`/backend/api/registrations/${_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations(prev =>
          prev.map(reg => {
            if (reg._id === _id) {
              const newIsExpired = newStatus === 'completed';
              return { ...reg, status: newStatus.toLowerCase() as Registration['status'], isExpired: newIsExpired };
            }
            return reg;
          })
        );
      } else {
        console.error('Failed to update status:', data.error);
        alert('Failed to update status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred while updating the status.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async (newStatus: Registration['status']) => {
    if (selectedRows.size === 0) return;
    setLoading(true);
    try {
      for (const _id of selectedRows) {
        await updateStatus(_id, newStatus);
      }
      setSelectedRows(new Set());
    } catch (error) {
      console.error('Error with bulk update:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel', id: string | string[] | 'all') => {
    setLoading(true);
    try {
      const idsParam = Array.isArray(id) ? id.join(',') : id;
      const res = await fetch(`/api/export?format=${format}&ids=${idsParam}`);
      if (!res.ok) {
        throw new Error('Export failed');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `registrations_export.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('An error occurred while exporting the data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDatePreset = (preset: string) => {
    const today = new Date();
    let start = '';
    let end = today.toISOString().split('T')[0];

    switch (preset) {
      case 'today':
        start = end;
        break;
      case 'last7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        start = sevenDaysAgo.toISOString().split('T')[0];
        break;
      case 'last30days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        start = thirtyDaysAgo.toISOString().split('T')[0];
        break;
      default:
        start = '';
        end = '';
    }
    setStartDate(start);
    setEndDate(end);
    setDateRangePreset(preset);
  };

  const filtered = useMemo(() => {
    let result = registrations;

    if (search) {
      result = result.filter(
        (r) =>
          r.fullName.toLowerCase().includes(search.toLowerCase()) ||
          r.email.toLowerCase().includes(search.toLowerCase()) ||
          r.currentProfession.toLowerCase().includes(search.toLowerCase()) ||
          String(r._id).includes(search)
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(r => r.status === filterStatus);
    }

    if (startDate && endDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      result = result.filter(r => {
        const registrationDate = new Date(r.callDateTime).getTime();
        return registrationDate >= start && registrationDate <= end;
      });
    }

    return result;
  }, [registrations, search, filterStatus, startDate, endDate]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aValue = a[sortKey as keyof Registration];
      const bValue = b[sortKey as keyof Registration];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortAsc ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
    });
  }, [filtered, sortKey, sortAsc]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  const toggleSort = (key: keyof Registration) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key as keyof Omit<Registration, '_id'>);
      setSortAsc(true);
    }
  };

  const handleCheckboxChange = (_id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(_id)) {
        newSet.delete(_id);
      } else {
        newSet.add(_id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginated.map(r => r._id));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const totalRegistrationsCount = registrations.length;
  const upcomingRegistrationsCount = useMemo(() => registrations.filter(r => r.status === 'upcoming').length, [registrations]);
  const pendingRegistrationsCount = useMemo(() => registrations.filter(r => r.status === 'pending').length, [registrations]);
  const completedRegistrationsCount = useMemo(() => registrations.filter(r => r.status === 'completed').length, [registrations]);

  const columns: { label: string; key: keyof Registration | 'actions' | 'selection' }[] = [
    { label: 'Select', key: 'selection' },
    { label: 'Ticket No.', key: '_id' },
    { label: 'Full Name', key: 'fullName' },
    { label: 'Email', key: 'email' },
    { label: 'Profession', key: 'currentProfession' },
    { label: 'Institution', key: 'institution' },
    { label: 'Status', key: 'status' },
    { label: 'Ticket State', key: 'isExpired' },
    { label: 'Actions', key: 'actions' },
  ];


  const getStatusColor = (status: Registration['status']) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTicketStateColor = (isExpired: boolean) => {
    return isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans" style={{ backgroundColor: '#f3f4f6' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="text-gray-600"
        >
          <IconSpinner className="h-12 w-12" />
        </motion.div>
        <p className="ml-4 text-xl font-semibold text-gray-700">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen text-gray-900 font-sans" style={{ backgroundColor: '#f3f4f6' }}>
      <div className="flex-1 p-4 md:p-8 transition-all duration-300">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Analytics Dashboard</h1>
              <p className="text-lg text-gray-600 mt-1">
                A comprehensive overview of user registrations and key metrics.
              </p>
            </div>
            <button
              onClick={() => {
                setExportingId('all');
                setExportModalOpen(true);
              }}
              className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center hover:bg-blue-700 transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            >
              <IconDownload className="mr-2 h-5 w-5" />
              Export All Data
            </button>
          </header>

          {/* Key Metrics Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Performance Indicators (KPIs)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Registrations Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-6 rounded-3xl shadow-xl ring-1 ring-gray-200 flex flex-col justify-between"
              >
                <div className="flex items-center mb-2">
                  <div className="p-3 bg-blue-100 rounded-full mr-4 text-blue-600">
                    <IconUsers className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Registrations</p>
                    <p className="text-3xl font-bold text-gray-900">{totalRegistrationsCount}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">All-time count of registered users.</p>
              </motion.div>

              {/* Upcoming Registrations Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white p-6 rounded-3xl shadow-xl ring-1 ring-gray-200 flex flex-col justify-between"
              >
                <div className="flex items-center mb-2">
                  <div className="p-3 bg-blue-100 rounded-full mr-4 text-blue-600">
                    <IconChartLine className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Upcoming Registrations</p>
                    <p className="text-3xl font-bold text-gray-900">{upcomingRegistrationsCount}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Registrations with a scheduled status.</p>
              </motion.div>

              {/* Pending Registrations Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white p-6 rounded-3xl shadow-xl ring-1 ring-gray-200 flex flex-col justify-between"
              >
                <div className="flex items-center mb-2">
                  <div className="p-3 bg-yellow-100 rounded-full mr-4 text-yellow-600">
                    <IconSpinner className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Registrations</p>
                    <p className="text-3xl font-bold text-gray-900">{pendingRegistrationsCount}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Registrations awaiting review or action.</p>
              </motion.div>
              
              {/* Completed Registrations Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white p-6 rounded-3xl shadow-xl ring-1 ring-gray-200 flex flex-col justify-between"
              >
                <div className="flex items-center mb-2">
                  <div className="p-3 bg-green-100 rounded-full mr-4 text-green-600">
                    <IconCheckCircle className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed Registrations</p>
                    <p className="text-3xl font-bold text-gray-900">{completedRegistrationsCount}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Registrations that have been finalized.</p>
              </motion.div>
            </div>
          </section>

          {/* New Data Visualization Section */}
          <DataVisualizations registrations={registrations} />

          {/* Registration Data Table Section */}
          <section className="bg-white p-6 rounded-2xl shadow-xl ring-1 ring-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Registration Database</h2>
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search by name, email, or profession..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 fill-current">
                    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0" />
                    <path d="M21 21l-6-6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* New Filters and Bulk Actions Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                {/* Quick Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <button
                        onClick={() => {
                            setFilterStatus('all');
                            setCurrentPage(1);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => {
                            setFilterStatus('upcoming');
                            setCurrentPage(1);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => {
                            setFilterStatus('pending');
                            setCurrentPage(1);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => {
                            setFilterStatus('completed');
                            setCurrentPage(1);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Completed
                    </button>
                </div>

                {/* Date Range Filter */}
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 lg:mt-0">
                    <span className="text-sm font-medium text-gray-700">Date Range:</span>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => handleDatePreset('today')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${dateRangePreset === 'today' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => handleDatePreset('last7days')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${dateRangePreset === 'last7days' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            Last 7 Days
                        </button>
                        <button
                            onClick={() => handleDatePreset('last30days')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${dateRangePreset === 'last30days' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            Last 30 Days
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setDateRangePreset('custom'); }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setDateRangePreset('custom'); }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            <AnimatePresence>
                {selectedRows.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-4 bg-gray-100 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                        <span className="text-gray-700 text-sm font-medium">
                            {selectedRows.size} row(s) selected
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => handleBulkUpdate('completed')}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all duration-200 shadow-sm"
                            >
                                Mark as Completed
                            </button>
                            <button
                                onClick={() => {
                                    setExportingId(Array.from(selectedRows));
                                    setExportModalOpen(true);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 transition-all duration-200"
                            >
                                Bulk Export
                            </button>
                            <button
                                onClick={() => setSelectedRows(new Set())}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 transition-all duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="overflow-x-auto -mx-6 md:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none min-w-[100px]"
                        onClick={() => {
                            if (col.key !== 'actions' && col.key !== 'selection') {
                                toggleSort(col.key as keyof Registration);
                            }
                        }}
                      >
                        <div className="flex items-center">
                          {col.key === 'selection' ? (
                              <input
                                  type="checkbox"
                                  className="form-checkbox h-4 w-4 text-blue-600 rounded-sm"
                                  onChange={(e) => handleSelectAll(e.target.checked)}
                                  checked={selectedRows.size > 0 && paginated.every(r => selectedRows.has(r._id))}
                              />
                          ) : col.label}
                          {col.key !== 'actions' && col.key !== 'selection' && (
                            <span className="ml-2">
                              {sortKey === col.key ? (
                                sortAsc ? (
                                  <IconSortUp className="h-4 w-4 fill-current text-blue-600" />
                                ) : (
                                  <IconSortDown className="h-4 w-4 fill-current text-blue-600" />
                                )
                              ) : (
                                <IconSort className="h-4 w-4 fill-current text-gray-500 opacity-50" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {paginated.length > 0 ? (
                      paginated.map((r, index) => (
                        <motion.tr
                          key={r._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`hover:bg-gray-50 transition-colors duration-200 ${r.isExpired ? 'bg-gray-200 opacity-60' : ''}`}
                        >
                          {columns.map((col) => (
                            <td
                              key={col.key}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-[200px] overflow-hidden text-ellipsis"
                            >
                              {col.key === 'selection' ? (
                                  <input
                                      type="checkbox"
                                      className="form-checkbox h-4 w-4 text-blue-600 rounded-sm"
                                      checked={selectedRows.has(r._id)}
                                      onChange={() => handleCheckboxChange(r._id)}
                                  />
                              ) : col.key === 'actions' ? (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setViewing(r)}
                                    className="text-blue-600 hover:text-blue-800 transition-all duration-200 text-sm font-medium flex items-center hover:scale-110 active:scale-95 cursor-pointer"
                                  >
                                    <IconEye className="mr-1 h-4 w-4" /> View
                                  </button>
                                  <button
                                    onClick={() => {
                                      setExportingId(r._id);
                                      setExportModalOpen(true);
                                    }}
                                    className="text-gray-600 hover:text-gray-800 transition-all duration-200 text-sm font-medium flex items-center hover:scale-110 active:scale-95 cursor-pointer"
                                  >
                                    <IconDownload className="mr-1 h-4 w-4" /> Export
                                  </button>
                                </div>
                              ) : col.key === 'status' ? (
                                <select
                                  value={r.status}
                                  onChange={(e) => updateStatus(r._id, e.target.value as Registration['status'])}
                                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getStatusColor(r.status)} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                                >
                                  <option value="upcoming" className="bg-white text-gray-900">Upcoming</option>
                                  <option value="pending" className="bg-white text-gray-900">Pending</option>
                                  <option value="completed" className="bg-white text-gray-900">Completed</option>
                                </select>
                              ) : col.key === 'isExpired' ? (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase ${getTicketStateColor(r.isExpired)}`}>
                                  {r.isExpired ? 'Expired' : 'Active'}
                                </span>
                              ) : (
                                r[col.key as keyof Registration] as string
                              )}
                            </td>
                          ))}
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                          No registrations found. Please try a different search query.
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination & Page Size Control */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <span className="text-sm text-gray-600">Items per page:</span>
                  <select
                      value={itemsPerPage}
                      onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                  </select>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sorted.length)} to{' '}
                  {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 cursor-pointer"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 cursor-pointer"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <ViewModal isOpen={!!viewing} onClose={() => setViewing(null)} registration={viewing} />
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        exportingId={exportingId}
      />
    </div>
  );
}