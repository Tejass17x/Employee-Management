import React, { useState, useEffect } from 'react';
import { List, LayoutGrid, Plus, Calendar, AlertCircle, Trash2, ArrowRight, ArrowLeft, Loader2, X } from 'lucide-react';
import api from '../../services/api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    due_date: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employee/tasks');
      setTasks(res.data);
    } catch (e) {
      console.error('Error fetching tasks details:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      await api.post('/employee/tasks', form);
      alert('Task created successfully!');
      setShowModal(false);
      setForm({ title: '', description: '', priority: 'Medium', due_date: '' });
      fetchTasks();
    } catch (error) {
      alert('Failed to create task.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/employee/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      alert('Failed to update task.');
    }
  };

  // Filter tasks for List View
  const filteredTasks = tasks.filter(t => {
    const statusMatch = statusFilter === 'All' || t.status === statusFilter;
    const priorityMatch = priorityFilter === 'All' || t.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  // Kanban Columns
  const kanbanColumns = {
    'To Do': tasks.filter(t => t.status === 'To Do'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Done': tasks.filter(t => t.status === 'Done')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading Tasks...
      </div>
    );
  }

  return (
    <div className="text-white font-sans pb-10 flex flex-col gap-6">
      
      {/* Top Header controls */}
      <div className="bg-[#12192b] p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* View Mode Toggle */}
        <div className="flex bg-[#0a0f1c] p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'list' ? 'bg-[#1e293b] text-blue-400 border border-blue-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <List size={14} /> List View
          </button>
          <button 
            onClick={() => setViewMode('kanban')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'kanban' ? 'bg-[#1e293b] text-blue-400 border border-blue-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutGrid size={14} /> Kanban Board
          </button>
        </div>

        {/* Action button */}
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <Plus size={16} /> Add Personal Task
        </button>
      </div>

      {/* List View controls */}
      {viewMode === 'list' && (
        <div className="flex gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase">Status Filter</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#12192b] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase">Priority Filter</label>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-[#12192b] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Render Main Content */}
      {viewMode === 'list' ? (
        // LIST VIEW
        <div className="bg-[#12192b] p-6 rounded-2xl border border-slate-800">
          {filteredTasks.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No tasks match selected filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                    <th className="pb-3">Task Details</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Due Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/10">
                      <td className="py-4 pr-4">
                        <p className="font-bold text-slate-200">{t.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t.description || 'No description provided.'}</p>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'High' ? 'bg-red-500/10 text-red-400' :
                          t.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>{t.priority}</span>
                      </td>
                      <td className="py-4 text-xs text-slate-400">{t.due_date ? new Date(t.due_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-4">
                        <select
                          value={t.status}
                          onChange={e => handleUpdateStatus(t.id, e.target.value)}
                          className="bg-[#0a0f1c] border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 outline-none"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Done">Done</option>
                        </select>
                      </td>
                      <td className="py-4 text-right">
                        {t.status !== 'Done' && (
                          <button 
                            onClick={() => handleUpdateStatus(t.id, 'Done')}
                            className="text-xs text-emerald-400 hover:underline"
                          >
                            Mark Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // KANBAN VIEW
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(kanbanColumns).map((colName) => {
            const colTasks = kanbanColumns[colName];
            return (
              <div key={colName} className="bg-[#12192b] p-4 rounded-2xl border border-slate-800 flex flex-col min-h-[450px]">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/80">
                  <h3 className="text-sm font-bold text-slate-200">{colName}</h3>
                  <span className="text-xs bg-[#0a0f1c] text-slate-500 px-2 py-0.5 rounded-full font-bold">{colTasks.length}</span>
                </div>

                <div className="flex-1 space-y-3.5 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="border border-dashed border-slate-800/80 rounded-xl p-6 text-center text-xs text-slate-500">No tasks here</div>
                  ) : (
                    colTasks.map((t) => (
                      <div key={t.id} className="bg-[#0a0f1c] p-4 rounded-xl border border-slate-800 flex flex-col gap-3 group transition-all hover:border-slate-700">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <h4 className="text-xs font-bold text-slate-200 leading-snug">{t.title}</h4>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                              t.priority === 'High' ? 'bg-red-500/10 text-red-400' :
                              t.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                            }`}>{t.priority}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2">{t.description || 'No description.'}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-900/60 text-[10px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'N/A'}</span>
                          <div className="flex gap-1">
                            {colName !== 'To Do' && (
                              <button 
                                onClick={() => handleUpdateStatus(t.id, colName === 'In Progress' ? 'To Do' : 'In Progress')}
                                className="p-1 bg-slate-800 rounded hover:bg-slate-700 hover:text-white"
                                title="Move Back"
                              >
                                <ArrowLeft size={10} />
                              </button>
                            )}
                            {colName !== 'Done' && (
                              <button 
                                onClick={() => handleUpdateStatus(t.id, colName === 'To Do' ? 'In Progress' : 'Done')}
                                className="p-1 bg-slate-800 rounded hover:bg-slate-700 hover:text-white"
                                title="Move Forward"
                              >
                                <ArrowRight size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12192b] border border-slate-800 rounded-2xl max-w-md w-full p-6 relative animate-zoom-in">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-6">Add Personal Task</h3>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">TASK TITLE</label>
                <input 
                  type="text" 
                  required
                  placeholder="Task title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">DESCRIPTION</label>
                <textarea 
                  rows="3"
                  placeholder="Brief details..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">PRIORITY</label>
                  <select 
                    value={form.priority} 
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">DUE DATE</label>
                  <input 
                    type="date" 
                    required
                    value={form.due_date}
                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
              >
                {submitLoading ? <Loader2 className="animate-spin" size={18} /> : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Tasks;
