"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import * as XLSX from 'xlsx'; // Assuming you have this library installed for Excel export.
import {
  IconSort, IconSortUp, IconSortDown, IconUsers, IconCheckCircle, IconChartLine, IconSpinner,
  IconDownload, IconFilePdf, IconFileExcel, IconEye, IconFilter, IconUser, IconMail, IconBriefcase
} from './ui/Icons';
import { Modal } from './ui/Modal';
import { Card } from './ui/Card';

// Type definition for a single registration entry.
type Registration = {
  _id: string;
  ticketNo?: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  dob?: string;
  experience?: number;
  institution?: string;
  callDateTime?: string;
  hearAboutUs?: string;
  currentProfession?: string;
  specialization?: string;
  learningGoals?: string;
  trainingPrograms: string[];
  additionalPrograms: string[];
  uploadId?: string;
  status: 'upcoming' | 'pending' | 'completed';
  isExpired: boolean;
};

// Reusable Modal for Viewing Details
const ViewModal = ({ isOpen, onClose, registration }: { isOpen: boolean; onClose: () => void; registration: Registration | null; }) => {
  if (!registration) return null;

  const labelMap: Record<keyof Registration, string> = {
    _id: 'Internal ID',
    ticketNo: 'Ticket No.',
    fullName: 'Full Name',
    email: 'Email Address',
    phoneNumber: 'Phone Number',
    dob: 'Date of Birth',
    experience: 'Professional Experience',
    institution: 'Institution',
    callDateTime: 'Registration Date',
    hearAboutUs: 'Heard About Us',
    currentProfession: 'Current Profession',
    specialization: 'Area of Specialization',
    learningGoals: 'Learning Goals',
    trainingPrograms: 'Training Programs',
    additionalPrograms: 'Additional Programs',
    uploadId: 'ID Card Upload',
    status: 'Training Status',
    isExpired: 'Ticket State',
  };

  const formatValue = (key: keyof Registration, value: any) => {
    if (key === 'callDateTime' && value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      }
    }
    if ((key === 'trainingPrograms' || key === 'additionalPrograms') && Array.isArray(value)) {
      return value.join(', ');
    }
    if (key === 'uploadId' && value) {
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
        Registration Details
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Comprehensive profile for <span className="font-semibold text-blue-600">{registration.fullName}</span>.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[70vh] pr-4">
        {Object.entries(registration)
          .filter(([key]) => key !== "__v" && key !== "uploadName")
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
    </Modal>
  );
};

// Reusable Modal for Exporting Data
const ExportModal = ({ isOpen, onClose, onExport, exportingId }: { isOpen: boolean; onClose: () => void; onExport: (format: 'pdf' | 'excel', registrationId: string | string[] | 'all') => void; exportingId: string | string[] | 'all' | undefined; }) => {
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-2xl relative max-w-sm w-full border-2 border-gray-200" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-5">{description}</p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleExport('pdf')}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 hover:bg-red-700 active:scale-95 cursor-pointer"
          >
            <IconFilePdf className="mr-2 h-5 w-5" /> Export as PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 hover:bg-green-700 active:scale-95 cursor-pointer"
          >
            <IconFileExcel className="mr-2 h-5 w-5" /> Export as Excel
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Data Visualization Component
const DataVisualizations = ({ registrations }: { registrations: Registration[]; }) => {
  const monthlyData = useMemo(() => {
    const data: { [key: string]: number } = {};
    registrations.forEach(reg => {
      if (reg.callDateTime) {
        const date = new Date(reg.callDateTime);
        if (!isNaN(date.getTime())) {
          const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          data[monthYear] = (data[monthYear] || 0) + 1;
        }
      }
    });
    return Object.entries(data).map(([name, count]) => ({ name, registrations: count }));
  }, [registrations]);

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

  return (
    <section className="mb-8 p-6 bg-white rounded-2xl shadow-xl ring-1 ring-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Training Status Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Training Status Distribution</h3>
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

// Filter Sidebar Component (New)
const FilterSidebar = ({
  isOpen, onClose, filterStatus, setFilterStatus, startDate, setStartDate, endDate, setEndDate, handleDatePreset, dateRangePreset
}: {
  isOpen: boolean;
  onClose: () => void;
  filterStatus: 'all' | 'upcoming' | 'pending' | 'completed';
  setFilterStatus: (status: 'all' | 'upcoming' | 'pending' | 'completed') => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  handleDatePreset: (preset: string) => void;
  dateRangePreset: string;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-lg p-6 overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <IconFilter className="mr-2 h-6 w-6" /> Advanced Filters
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Training Status</label>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('upcoming')}
                  className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${filterStatus === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${filterStatus === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${filterStatus === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Date Range</label>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => handleDatePreset('all')}
                  className={`py-1.5 px-3 rounded-full text-xs font-medium transition-colors ${dateRangePreset === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  All Time
                </button>
                <button
                  onClick={() => handleDatePreset('today')}
                  className={`py-1.5 px-3 rounded-full text-xs font-medium transition-colors ${dateRangePreset === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Today
                </button>
                <button
                  onClick={() => handleDatePreset('last7days')}
                  className={`py-1.5 px-3 rounded-full text-xs font-medium transition-colors ${dateRangePreset === 'last7days' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => handleDatePreset('last30days')}
                  className={`py-1.5 px-3 rounded-full text-xs font-medium transition-colors ${dateRangePreset === 'last30days' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Last 30 Days
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/registrations');
      if (!res.ok) throw new Error('Failed to fetch registrations data.');
      const { data } = await res.json();
      setRegistrations(data);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const updateStatus = async (_id: string, newStatus: Registration['status']) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/registrations/${_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, isExpired: newStatus === 'completed' }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations(prev =>
          prev.map(reg => {
            if (reg._id === _id) {
              return { ...reg, status: newStatus, isExpired: newStatus === 'completed' };
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
        break;
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
          r.currentProfession?.toLowerCase().includes(search.toLowerCase()) ||
          String(r._id).includes(search) ||
          String(r.ticketNo).includes(search)
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(r => r.status === filterStatus);
    }

    if (startDate && endDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      result = result.filter(r => {
        if (!r.callDateTime) return false;
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
    { label: 'Ticket No.', key: 'ticketNo' },
    { label: 'Full Name', key: 'fullName' },
    { label: 'Email', key: 'email' },
    { label: 'Profession', key: 'currentProfession' },
    { label: 'Institution', key: 'institution' },
    { label: 'Status', key: 'status' },
    { label: 'Ticket State', key: 'isExpired' },
    { label: 'Actions', key: 'actions' },
  ];

  const getStatusColor = (status: Registration['status'] | undefined) => {
    if (typeof status !== 'string') {
      return 'bg-gray-100 text-gray-800';
    }
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
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
    <div className="flex min-h-screen text-gray-900 font-sans bg-gray-50">
      <div className="flex-1 p-4 md:p-8 transition-all duration-300">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Training Dashboard</h1>
              <p className="text-lg text-gray-600 mt-1">
                A comprehensive overview of surgical training registrations and their status.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setIsFilterSidebarOpen(true)}
                className="w-full sm:w-auto bg-gray-200 text-gray-800 px-6 py-3 rounded-xl flex items-center justify-center hover:bg-gray-300 transition-all duration-200 shadow-md"
              >
                <IconFilter className="mr-2 h-5 w-5" />
                Advanced Filters
              </button>
              <button
                onClick={() => {
                  setExportingId('all');
                  setExportModalOpen(true);
                }}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all duration-200 shadow-lg"
              >
                <IconDownload className="mr-2 h-5 w-5" />
                Export All Data
              </button>
            </div>
          </header>

          {/* Key Metrics Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Training Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card
                icon={<IconUsers className="h-7 w-7" />}
                title="Total Registrations"
                value={totalRegistrationsCount}
                description="All-time count of registered users."
              />
              <Card
                icon={<IconChartLine className="h-7 w-7" />}
                title="Upcoming Trainings"
                value={upcomingRegistrationsCount}
                description="Trainings scheduled for the future."
                delay={0.1}
              />
              <Card
                icon={<IconSpinner className="h-7 w-7" />}
                title="Pending Trainings"
                value={pendingRegistrationsCount}
                description="Trainings awaiting review or action."
                delay={0.2}
              />
              <Card
                icon={<IconCheckCircle className="h-7 w-7" />}
                title="Completed Trainings"
                value={completedRegistrationsCount}
                description="Trainings that have been successfully finalized."
                delay={0.3}
              />
            </div>
          </section>

          {/* Data Visualization Section */}
          <DataVisualizations registrations={registrations} />

          {/* Registration Data Table Section */}
          <section className="bg-white p-6 rounded-2xl shadow-xl ring-1 ring-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Training Registration Database</h2>
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
                                r[col.key as keyof Registration] as string | number
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
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <FilterSidebar
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        handleDatePreset={handleDatePreset}
        dateRangePreset={dateRangePreset}
      />
    </div>
  );
}