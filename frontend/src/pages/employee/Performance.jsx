import React, { useState, useEffect } from 'react';
import { Award, Target, AwardIcon, TrendingUp, Calendar, ArrowRight, Loader2, CheckCircle2, Circle } from 'lucide-react';
import api from '../../services/api';

const Performance = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employee/performance');
      setReviews(res.data);
      if (res.data.length > 0) {
        setSelectedReview(res.data[0]);
        try {
          setGoals(JSON.parse(res.data[0].goals_json || '[]'));
        } catch (e) {
          setGoals([]);
        }
      }
    } catch (e) {
      console.error('Error fetching performance details:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReview = (review) => {
    setSelectedReview(review);
    try {
      setGoals(JSON.parse(review.goals_json || '[]'));
    } catch (e) {
      setGoals([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading Performance...
      </div>
    );
  }

  return (
    <div className="text-white font-sans pb-10 flex flex-col gap-6">
      
      {/* Overview Score Card */}
      {selectedReview ? (
        <div className="bg-[#111c44] border border-blue-900/50 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
              <Award size={32} />
            </div>
            <div>
              <p className="text-blue-300 text-xs font-bold tracking-wider">LATEST PERFORMANCE SCORE</p>
              <h2 className="text-3xl font-extrabold mb-1">{selectedReview.score} <span className="text-sm font-semibold text-slate-400">/ 5.00</span></h2>
              <p className="text-slate-400 text-xs font-medium">Review Period: <span className="text-white font-semibold">{selectedReview.review_period}</span></p>
            </div>
          </div>

          <div className="flex-1 max-w-md bg-[#0a0f1c]/60 border border-slate-800 p-4 rounded-xl relative z-10 text-xs text-slate-300">
            <p className="font-bold text-slate-400 mb-1">Reviewer Comments</p>
            <p className="italic leading-relaxed">"{selectedReview.reviewer_comments || 'No comments provided.'}"</p>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none"></div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 text-center py-6">No performance reviews recorded yet.</p>
      )}

      {/* Grid: Goals Tracker & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Goals Tracker */}
        <div className="bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex flex-col min-h-[300px]">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2"><Target size={18} className="text-blue-400" /> Key Goals Set</h3>
          {goals.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No goals defined for this period.</p>
          ) : (
            <div className="space-y-3.5 flex-1">
              {goals.map((g, idx) => (
                <div key={idx} className="bg-[#0a0f1c] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {g.status === 'Completed' ? (
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    ) : (
                      <Circle size={18} className="text-slate-600 shrink-0" />
                    )}
                    <span className="text-sm font-semibold text-slate-200">{g.goal}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    g.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>{g.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History of Reviews */}
        <div className="bg-[#12192b] p-6 rounded-2xl border border-slate-800 min-h-[300px]">
          <h3 className="text-base font-bold mb-4">Historical Ratings</h3>
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No reviews found.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div 
                  key={r.id} 
                  onClick={() => handleSelectReview(r)}
                  className={`bg-[#0a0f1c] p-4 rounded-xl border border-slate-800/80 hover:border-blue-500/30 flex justify-between items-center cursor-pointer transition-all ${
                    selectedReview?.id === r.id ? 'border-blue-500/40 bg-[#1e293b]/20' : ''
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{r.review_period}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{r.reviewer_comments || 'No comments'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-blue-400">{r.score}</span>
                    <span className="text-[10px] text-slate-500 block">score</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Performance;
