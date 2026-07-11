import React, { useEffect, useState } from "react";
import { Clock, CheckCircle2, Star, Calendar } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const ratingsData = [
  { department: "Engineering", rating: 4.2 },
  { department: "Design", rating: 4.5 },
  { department: "Marketing", rating: 3.9 },
  { department: "Sales", rating: 4.0 },
  { department: "HR", rating: 4.3 },
  { department: "Finance", rating: 4.1 },
];


const PerformancePage = () => {
    const [reviews, setReviews] = useState([]);

useEffect(() => {
  fetch("http://localhost:5000/api/hr/performance")
    .then((res) => res.json())
    .then((data) => {
      const formattedReviews = data.map((review) => ({
        initials: review.initials,
        employee: review.employee_name,
        department: review.department,
        reviewer: review.reviewer,
        rating: review.rating,
        period: review.review_period,
        status: review.status,
        color:
          review.color === "blue"
            ? "bg-blue-500"
            : review.color === "purple"
            ? "bg-purple-500"
            : review.color === "green"
            ? "bg-green-500"
            : review.color === "orange"
            ? "bg-orange-500"
            : "bg-red-500",
      }));

      setReviews(formattedReviews);
    })
    .catch((err) => console.error(err));
}, []);
  return (
    <div className="text-white flex flex-col gap-5 pb-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Performance Reviews</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Team ratings and review management
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="bg-[#0F1B33] border border-[#1D2A44] rounded-xl p-5 flex justify-between h-[115px]">
          <div>
            <p className="text-[#7D8FB3] text-[11px] tracking-[2px] uppercase">
              Reviews Pending
            </p>
            <h2 className="text-3xl font-bold mt-5">8</h2>
          </div>

          <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <Clock className="text-yellow-400" size={18} />
          </div>
        </div>

        <div className="bg-[#0F1B33] border border-[#1D2A44] rounded-xl p-5 flex justify-between h-[115px]">
          <div>
            <p className="text-[#7D8FB3] text-[11px] tracking-[2px] uppercase">
              Completed
            </p>
            <h2 className="text-3xl font-bold mt-5">94</h2>
          </div>

          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="text-emerald-400" size={18} />
          </div>
        </div>

        <div className="bg-[#0F1B33] border border-[#1D2A44] rounded-xl p-5 flex justify-between h-[115px]">
          <div>
            <p className="text-[#7D8FB3] text-[11px] tracking-[2px] uppercase">
              Team Avg Rating
            </p>
            <h2 className="text-3xl font-bold mt-5">4.1</h2>
          </div>

          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Star className="text-blue-400" size={18} />
          </div>
        </div>

        <div className="bg-[#0F1B33] border border-[#1D2A44] rounded-xl p-5 flex justify-between h-[115px]">
          <div>
            <p className="text-[#7D8FB3] text-[11px] tracking-[2px] uppercase">
              Next Cycle
            </p>
            <h2 className="text-3xl font-bold mt-5">Oct 1</h2>
          </div>

          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Calendar className="text-purple-400" size={18} />
          </div>
        </div>

      </div>

      {/* Chart */}
      <div className="bg-[#0F1B33] border border-[#1D2A44] rounded-xl p-5">
        <h2 className="text-xl font-semibold mb-5">
          Department Average Ratings
        </h2>

        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingsData}>
              <XAxis dataKey="department" stroke="#94A3B8" />
              <YAxis domain={[3, 5]} stroke="#94A3B8" />
              <Tooltip />
              <Bar
                dataKey="rating"
                fill="#4F8CFF"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-[#0F1B33] border border-[#1D2A44] rounded-xl p-5">
        <h2 className="text-xl font-semibold mb-5">
          Recent Reviews
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead className="text-slate-400 text-sm border-b border-slate-700">
              <tr>
                <th className="pb-4">Employee</th>
                <th className="pb-4">Department</th>
                <th className="pb-4">Reviewer</th>
                <th className="pb-4">Rating</th>
                <th className="pb-4">Period</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {reviews.map((review, index) => (
                <tr key={index} className="border-b border-slate-800">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${review.color}`}
                      >
                        {review.initials}
                      </div>

                      <span className="text-sm font-medium">
                        {review.employee}
                      </span>
                    </div>
                  </td>

                  <td className="text-sm">{review.department}</td>
                  <td className="text-sm">{review.reviewer}</td>

                  <td>
                    <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm">
                      <Star size={13} fill="currentColor" />
                      {review.rating}
                    </div>
                  </td>

                  <td className="text-sm">{review.period}</td>

                  <td>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        review.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {review.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
};

export default PerformancePage;