import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle, Play, Square, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import api from '../../services/api';

const Attendance = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState({ checkedIn: false, checkedOut: false, record: null });
  const [currentDate, setCurrentDate] = useState(new Date());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const statusRes = await api.get('/employee/attendance/status');
      setStatus(statusRes.data);

      const historyRes = await api.get('/employee/attendance');
      setHistory(historyRes.data);
    } catch (e) {
      console.error('Error fetching attendance details:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInOut = async () => {
    try {
      setActionLoading(true);
      if (!status.checkedIn) {
        await api.post('/employee/attendance/checkin');
        alert('Successfully checked in!');
      } else {
        await api.post('/employee/attendance/checkout');
        alert('Successfully checked out!');
      }
      fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayIndex = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayIndex(year, month);

  // Generate days grid
  const daysArray = [];
  // Padding for initial days in grid
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  const getStatusColor = (day) => {
    if (!day) return 'bg-transparent border-transparent';
    
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const record = history.find(h => h.date === dateStr);
    
    // Check if weekend
    const d = new Date(year, month, day);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    if (record) {
      if (record.status === 'Present') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      if (record.status === 'Late') return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      if (record.status === 'Half Day') return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      if (record.status === 'Absent') return 'bg-red-500/20 text-red-400 border border-red-500/30';
    }

    if (isWeekend) {
      return 'bg-slate-800/10 text-slate-600 border border-slate-800/20';
    }

    // If day is in past and no record, mark absent (unless today)
    const todayStr = new Date().toISOString().slice(0, 10);
    if (dateStr < todayStr) {
      return 'bg-red-500/10 text-red-400/70 border border-red-500/20';
    }

    return 'bg-[#0a0f1c] text-slate-400 border border-slate-800/60';
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Pagination helper
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistory = history.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(history.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading Attendance...
      </div>
    );
  }

  return (
    <div className="text-white font-sans pb-10 flex flex-col gap-6">
      
      {/* Top Banner: Clock actions */}
      <div className="bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
            <Clock size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Attendance Tracker</h2>
            <p className="text-xs text-slate-500">
              {!status.checkedIn 
                ? 'You have not checked in for today.' 
                : status.checkedOut 
                  ? 'Your attendance is logged for the day.' 
                  : `Checked in today at ${status.record?.check_in_time}.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {!status.checkedOut && (
            <button
              onClick={handleCheckInOut}
              disabled={actionLoading}
              className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                status.checkedIn 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {actionLoading ? <Loader2 className="animate-spin" size={18} /> : status.checkedIn ? <Square size={18} /> : <Play size={18} />}
              {status.checkedIn ? 'Check Out' : 'Check In Now'}
            </button>
          )}

          {status.checkedOut && (
            <div className="w-full md:w-auto bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              <CheckCircle size={18} /> Attendance Logged
            </div>
          )}
        </div>
      </div>

      {/* Grid: Calendar + Log History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold flex items-center gap-2"><Calendar size={18} className="text-blue-500" /> Monthly Grid</h3>
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="p-1.5 bg-[#0a0f1c] hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white"><ChevronLeft size={16} /></button>
              <span className="text-sm font-semibold whitespace-nowrap">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <button onClick={handleNextMonth} className="p-1.5 bg-[#0a0f1c] hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white"><ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Weekdays header */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-500">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => <div key={idx} className="py-1">{day}</div>)}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 flex-1">
            {daysArray.map((day, idx) => (
              <div 
                key={idx}
                className={`h-10 md:h-12 rounded-xl flex items-center justify-center text-sm font-semibold select-none ${getStatusColor(day)}`}
              >
                {day || ''}
              </div>
            ))}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-bold text-slate-500">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/30"></span>Present</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/30"></span>Late</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30"></span>Absent</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0a0f1c] border border-slate-800"></span>No Log / Future</div>
          </div>
        </div>

        {/* History Table (1 Col) */}
        <div className="bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-base font-bold mb-4">Log History</h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No attendance logs found.</p>
            ) : (
              <div className="space-y-3">
                {currentHistory.map((item) => (
                  <div key={item.id} className="bg-[#0a0f1c] p-3.5 rounded-xl border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{new Date(item.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</h4>
                      <p className="text-xs text-slate-500">
                        {item.check_in_time ? `In: ${item.check_in_time.slice(0, 5)}` : 'In: --'} 
                        {item.check_out_time ? ` | Out: ${item.check_out_time.slice(0, 5)}` : ' | Out: --'}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400' :
                      item.status === 'Late' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                    }`}>{item.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800/80">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="px-3 py-1 bg-[#0a0f1c] hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500 font-bold">Page {currentPage} of {totalPages}</span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="px-3 py-1 bg-[#0a0f1c] hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// Simple Mock representation for CheckCircle since it is imported but not defined
const CheckCircle = ({ size }) => <span className="text-emerald-400">✓</span>;

export default Attendance;
