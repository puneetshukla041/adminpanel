"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import {
    ChevronUp, ChevronDown, Users, CheckCircle, Activity, Loader2,
    Download, FileText, FileSpreadsheet, Eye, Filter, SortAsc, SortDesc, ArrowUp
} from 'lucide-react';

// Reusable Modal Component (optimized for mobile)
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode; }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 md:p-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-xl w-full max-h-[95vh] overflow-y-auto transform transition-all sm:max-w-md md:max-w-3xl lg:max-w-5xl"
                        initial={{ scale: 0.9, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 50 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-end p-4">
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 md:p-8">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Reusable Card Component
const Card = ({ icon, title, value, description, delay = 0 }: { icon: React.ReactNode; title: string; value: number; description: string; delay?: number; }) => (
    <motion.div
        className="flex flex-col items-start bg-white rounded-2xl shadow-md p-6 border-2 border-gray-200 transition-transform duration-300 hover:shadow-xl hover:scale-105"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
    >
        <div className="flex items-center mb-3">
            <div className="bg-blue-100 text-blue-600 rounded-full p-2.5 flex items-center justify-center">
                {icon}
            </div>
        </div>
        <div className="flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-4xl font-extrabold text-blue-600 mb-2">{value}</p>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    </motion.div>
);

// Icon mapping for `lucide-react`
const IconUsers = Users;
const IconCheckCircle = CheckCircle;
const IconChartLine = Activity;
const IconSpinner = Loader2;
const IconDownload = Download;
const IconFilePdf = FileText;
const IconFileExcel = FileSpreadsheet;
const IconEye = Eye;
const IconFilter = Filter;
const IconSortUp = SortAsc;
const IconSortDown = SortDesc;
const IconSort = ArrowUp; // A generic sort icon, you can choose another one if preferred.

// Type definition for a single registration entry.
type Registration = {
    _id: string;
    ticketNo?: number;
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

    const formatValue = (key: keyof Registration, value: unknown) => {
        if (key === 'callDateTime' && typeof value === 'string') {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            }
        }
        if ((key === 'trainingPrograms' || key === 'additionalPrograms') && Array.isArray(value)) {
            return value.join(', ');
        }
        if (key === 'uploadId' && typeof value === 'string') {
            const fileUrl = `/api/files?id=${value}`;
            return (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium cursor-pointer">
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
        if (exportingId) {
            onExport(format, exportingId);
        }
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
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Helper function to categorize experience
    const getExperienceRange = (exp: number) => {
        if (exp >= 0 && exp <= 2) return '0-2 years';
        if (exp >= 3 && exp <= 5) return '3-5 years';
        if (exp >= 6 && exp <= 10) return '6-10 years';
        if (exp > 10) return '10+ years';
        return 'Not specified';
    };

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
    
    type PieChartData = { name: string; value: number; color: string; };

    const statusData: PieChartData[] = useMemo(() => {
        const upcomingCount = registrations.filter(r => r.status === 'upcoming').length;
        const pendingCount = registrations.filter(r => r.status === 'pending').length;
        const completedCount = registrations.filter(r => r.status === 'completed').length;
        return [
            { name: 'Upcoming', value: upcomingCount, color: '#3b82f6' },
            { name: 'Pending', value: pendingCount, color: '#f59e0b' },
            { name: 'Completed', value: completedCount, color: '#22c55e' },
        ].filter(d => d.value > 0);
    }, [registrations]);

    // Data for "How they heard about us"
    const hearAboutUsData: PieChartData[] = useMemo(() => {
        const data: { [key: string]: number } = {};
        registrations.forEach(reg => {
            if (reg.hearAboutUs) {
                const source = reg.hearAboutUs;
                data[source] = (data[source] || 0) + 1;
            }
        });
        const colors = ['#f97316', '#10b981', '#6366f1', '#ef4444', '#f59e0b', '#3b82f6'];
        return Object.entries(data).map(([name, value], index) => ({
            name,
            value,
            color: colors[index % colors.length],
        })).filter(d => d.value > 0);
    }, [registrations]);

    // Data for Training Programs
    const trainingProgramData = useMemo(() => {
        const data: { [key: string]: number } = {};
        registrations.forEach(reg => {
            if (reg.trainingPrograms) {
                reg.trainingPrograms.forEach(program => {
                    data[program] = (data[program] || 0) + 1;
                });
            }
        });
        return Object.entries(data).map(([name, registrations]) => ({ name, registrations }));
    }, [registrations]);
    
    // Data for Professional Experience
    const experienceData = useMemo(() => {
        const data: { [key: string]: number } = {};
        registrations.forEach(reg => {
            if (reg.experience) {
                const experienceValue = parseInt(reg.experience, 10);
                if (!isNaN(experienceValue)) {
                    const range = getExperienceRange(experienceValue);
                    data[range] = (data[range] || 0) + 1;
                }
            }
        });
        return Object.entries(data).map(([name, registrations]) => ({ name, registrations }));
    }, [registrations]);


    return (
        <section className="mb-8 p-6 bg-white rounded-2xl shadow-xl ring-1 ring-gray-200">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex justify-between items-center text-left py-2 cursor-pointer"
            >
                <h2 className="text-2xl font-bold text-gray-900">
                    Training Status Analytics
                </h2>
                {isCollapsed ? <ChevronDown className="h-6 w-6 text-gray-500" /> : <ChevronUp className="h-6 w-6 text-gray-500" />}
            </button>
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden pt-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                            label={(props) => {
                                                const { name, percent } = props as { name: string; percent?: number };
                                                return `${name} ${((percent ?? 0) * 100).toFixed(0)}%`;
                                            }}
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Referral Source Breakdown</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={hearAboutUsData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            label={(props) => {
                                                const { name, percent } = props as { name: string; percent?: number };
                                                return `${name} ${((percent ?? 0) * 100).toFixed(0)}%`;
                                            }}
                                        >
                                            {hearAboutUsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Popular Training Programs</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={trainingProgramData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                                            contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px' }}
                                        />
                                        <Bar dataKey="registrations" fill="#22c55e" radius={[10, 10, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Professional Experience Levels</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={experienceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                                            contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px' }}
                                        />
                                        <Bar dataKey="registrations" fill="#f59e0b" radius={[10, 10, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};


export default function App() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false); // New state for specific updates
    const [search, setSearch] = useState('');

    type SortableKey = keyof Omit<Registration, '_id' | 'trainingPrograms' | 'additionalPrograms' | 'isExpired'>;
    const [sortKey, setSortKey] = useState<SortableKey>('fullName');
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
        setIsUpdating(true); // Start the specific update loading state
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
                console.log('Failed to update status. Please try again.');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            console.log('An error occurred while updating the status.');
        } finally {
            setIsUpdating(false); // End the specific update loading state
        }
    };

    const handleBulkUpdate = async (newStatus: Registration['status']) => {
        if (selectedRows.size === 0) return;
        setIsUpdating(true); // Start the specific update loading state
        try {
            for (const _id of selectedRows) {
                await updateStatus(_id, newStatus);
            }
            setSelectedRows(new Set());
        } catch (error) {
            console.error('Error with bulk update:', error);
        } finally {
            setIsUpdating(false); // End the specific update loading state
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
            console.log('An error occurred while exporting the data.');
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
            case 'last7days': {
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                start = sevenDaysAgo.toISOString().split('T')[0];
                break;
            }
            case 'last30days': {
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                start = thirtyDaysAgo.toISOString().split('T')[0];
                break;
            }
            default:
                start = '';
                end = '';
                break;
        }

        setStartDate(start);
        setEndDate(end);
        setDateRangePreset(preset);
    };

    const toggleSort = (key: SortableKey) => {
        if (sortKey === key) setSortAsc(!sortAsc);
        else {
            setSortKey(key);
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

    const filtered = useMemo(() => {
        let result = registrations;

        if (search) {
            result = result.filter(
                (r) =>
                    r.fullName.toLowerCase().includes(search.toLowerCase()) ||
                    r.email.toLowerCase().includes(search.toLowerCase()) ||
                    (r.currentProfession && r.currentProfession.toLowerCase().includes(search.toLowerCase())) ||
                    String(r._id).includes(search) ||
                    (r.ticketNo && String(r.ticketNo).includes(search))
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
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortAsc ? aValue - bValue : bValue - aValue;
            }
            // Fallback for mixed or undefined types
            return 0;
        });
    }, [filtered, sortKey, sortAsc]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sorted.slice(start, start + itemsPerPage);
    }, [sorted, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sorted.length / itemsPerPage);

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
                                onClick={() => {
                                    setExportingId('all');
                                    setExportModalOpen(true);
                                }}
                                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all duration-200 shadow-lg cursor-pointer"
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
                    <section className="bg-white p-6 rounded-2xl shadow-xl ring-1 ring-gray-200 relative">
                        {isUpdating && (
                            <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                    className="text-blue-600"
                                >
                                    <Loader2 className="h-10 w-10" />
                                </motion.div>
                            </div>
                        )}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Training Registration Database</h2>
                        </div>
                        {/* Inline Filters and Search */}
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or profession..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 fill-current">
                                        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0" />
                                        <path d="M21 21l-6-6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                                {(['all', 'upcoming', 'pending', 'completed'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`py-2 px-4 rounded-full text-xs font-semibold transition-colors cursor-pointer ${filterStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
                                {(['all', 'today', 'last7days', 'last30days'] as const).map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => handleDatePreset(preset)}
                                        className={`py-2 px-4 rounded-full text-xs font-medium transition-colors cursor-pointer ${dateRangePreset === preset ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                    >
                                        {preset === 'all' ? 'All Time' : preset === 'today' ? 'Today' : preset === 'last7days' ? 'Last 7 Days' : 'Last 30 Days'}
                                    </button>
                                ))}
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
                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all duration-200 shadow-sm cursor-pointer"
                                        >
                                            Mark as Completed
                                        </button>
                                        <button
                                            onClick={() => {
                                                setExportingId(Array.from(selectedRows));
                                                setExportModalOpen(true);
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                                        >
                                            Bulk Export
                                        </button>
                                        <button
                                            onClick={() => setSelectedRows(new Set())}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 transition-all duration-200 cursor-pointer"
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
                                                        toggleSort(col.key as SortableKey);
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    {col.key === 'selection' ? (
                                                        <input
                                                            type="checkbox"
                                                            className="form-checkbox h-4 w-4 text-blue-600 rounded-sm cursor-pointer"
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
                                                                    className="form-checkbox h-4 w-4 text-blue-600 rounded-sm cursor-pointer"
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
                                                                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getStatusColor(r.status)} focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer`}
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
                                                                (r[col.key as keyof Registration] as string | number)
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
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm cursor-pointer"
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
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm font-medium text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
