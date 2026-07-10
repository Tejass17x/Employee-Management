import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, CheckCircle, Clock, Loader2, Play } from 'lucide-react';
import api from '../../services/api';

const Training = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTraining();
  }, []);

  const fetchTraining = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employee/training');
      setCourses(res.data);
    } catch (e) {
      console.error('Error fetching training details:', e);
    } finally {
      setLoading(false);
    }
  };

  const enrolledCount = courses.length;
  const completedCount = courses.filter(c => c.status === 'Completed').length;
  const inProgressCount = courses.filter(c => c.status === 'In Progress').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading Training...
      </div>
    );
  }

  return (
    <div className="text-white font-sans pb-10 flex flex-col gap-6">
      
      {/* Top Banner stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'COURSES ENROLLED', value: enrolledCount, icon: <BookOpen size={20} className="text-blue-400" />, bg: 'bg-blue-500/10' },
          { title: 'IN PROGRESS', value: inProgressCount, icon: <Clock size={20} className="text-amber-400" />, bg: 'bg-amber-500/10' },
          { title: 'COMPLETED', value: completedCount, icon: <GraduationCap size={20} className="text-emerald-400" />, bg: 'bg-emerald-500/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-slate-400 text-xs font-bold tracking-wider block mb-1">{stat.title}</span>
              <h3 className="text-3xl font-extrabold">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg}`}>{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Grid of Courses */}
      <h3 className="text-base font-bold">My Training Modules</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center col-span-full">No training courses assigned.</p>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="bg-[#12192b] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between h-[200px]">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    course.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                    course.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'
                  }`}>{course.status}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 line-clamp-2 leading-relaxed" title={course.course_name}>{course.course_name}</h4>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-500 font-bold mb-1.5">
                  <span>Progress</span>
                  <span>{course.progress_percent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                  <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${course.progress_percent}%` }}></div>
                </div>

                <button 
                  onClick={() => alert(`Launching course: ${course.course_name}`)}
                  className="w-full bg-[#1a233a] hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Play size={12} /> {course.status === 'Completed' ? 'Review Course' : 'Resume Course'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Training;
