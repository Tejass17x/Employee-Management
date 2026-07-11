import React, { useState } from "react";
import {
  Search,
  Filter,
  Check,
  X,
  Download,
} from "lucide-react";

const leaveData = [
  {
    id: 1,
    name: "Alex Chen",
    department: "Engineering",
    type: "Casual Leave",
    from: "12 July 2026",
    to: "14 July 2026",
    days: 3,
    reason: "Family Function",
    status: "Pending",
  },
  {
    id: 2,
    name: "Maria Santos",
    department: "Design",
    type: "Sick Leave",
    from: "10 July 2026",
    to: "11 July 2026",
    days: 2,
    reason: "Health Issue",
    status: "Pending",
  },
  {
    id: 3,
    name: "James Park",
    department: "Marketing",
    type: "Casual Leave",
    from: "15 July 2026",
    to: "16 July 2026",
    days: 2,
    reason: "Personal Work",
    status: "Pending",
  },
  {
    id: 4,
    name: "Priya Sharma",
    department: "Analytics",
    type: "Earned Leave",
    from: "20 July 2026",
    to: "25 July 2026",
    days: 6,
    reason: "Vacation",
    status: "Pending",
  },
  {
    id: 5,
    name: "John Smith",
    department: "HR",
    type: "Sick Leave",
    from: "18 July 2026",
    to: "19 July 2026",
    days: 2,
    reason: "Medical Checkup",
    status: "Pending",
  },
];

const LeaveApproval = () => {
  const [search, setSearch] = useState("");
  const [leaves, setLeaves] = useState(leaveData);

  const filteredLeaves = leaves.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = (id, status) => {
    setLeaves((prevLeaves) =>
      prevLeaves.map((leave) =>
        leave.id === id
          ? { ...leave, status }
          : leave
      )
    );
  };

  const pendingCount = leaves.filter(
    (item) => item.status === "Pending"
  ).length;

  const approvedCount = leaves.filter(
    (item) => item.status === "Approved"
  ).length;

  const rejectedCount = leaves.filter(
    (item) => item.status === "Rejected"
  ).length;

  return (
    <div className="w-full text-white space-y-5">

      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">

        <div>
          <h1 className="text-2xl font-bold">
            Leave Approval
          </h1>

          <p className="text-slate-400 text-sm">
            Manage employee leave requests
          </p>
        </div>

        <button className="bg-[#1a2338] hover:bg-[#222d46] transition px-4 py-2.5 rounded-lg flex items-center gap-2">
          <Download size={17} />
          Export
        </button>

      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-[#12192b] border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">
            Pending Leaves
          </p>

          <h2 className="text-3xl font-bold text-yellow-400 mt-2">
            {pendingCount}
          </h2>
        </div>

        <div className="bg-[#12192b] border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">
            Approved This Month
          </p>

          <h2 className="text-3xl font-bold text-green-400 mt-2">
            {approvedCount}
          </h2>
        </div>

        <div className="bg-[#12192b] border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">
            Rejected Leaves
          </p>

          <h2 className="text-3xl font-bold text-red-400 mt-2">
            {rejectedCount}
          </h2>
        </div>

      </div>

      {/* Search */}

      <div className="bg-[#12192b] border border-slate-800 rounded-xl p-4">

        <div className="flex flex-col md:flex-row gap-3">

          <div className="relative flex-1">

            <Search
              size={17}
              className="absolute left-3 top-3 text-slate-500"
            />

            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1a2338] border border-slate-700 rounded-lg py-2.5 pl-10 pr-3 outline-none"
            />

          </div>

          <button className="bg-[#1a2338] hover:bg-[#222d46] transition px-4 py-2.5 rounded-lg flex items-center gap-2">
            <Filter size={17} />
            Filter
          </button>

        </div>

      </div>

      {/* Leave Requests Table */}

      <div className="bg-[#12192b] border border-slate-800 rounded-xl overflow-x-auto">

        <table className="w-full min-w-[950px]">

          <thead className="border-b border-slate-700 text-slate-400 text-sm">

            <tr>

              <th className="p-4 text-left">Employee</th>
              <th>Department</th>
              <th>Leave Type</th>
              <th>Duration</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>

            </tr>

          </thead>

          <tbody>
          {filteredLeaves.map((leave) => (
  <tr
    key={leave.id}
    className="border-b border-slate-800 hover:bg-slate-800/30 text-sm"
  >
    {/* Employee */}
    <td className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
          {leave.name.charAt(0)}
        </div>

        <div>
          <p className="font-medium">
            {leave.name}
          </p>

          <p className="text-xs text-slate-400">
            {leave.from}
          </p>
        </div>
      </div>
    </td>

    {/* Department */}
    <td>{leave.department}</td>

    {/* Leave Type */}
    <td>{leave.type}</td>

    {/* Duration */}
    <td>
      <p>{leave.days} Days</p>

      <p className="text-xs text-slate-400">
        {leave.from} - {leave.to}
      </p>
    </td>

    {/* Reason */}
    <td className="max-w-[180px]">
      <p className="truncate text-slate-300">
        {leave.reason}
      </p>
    </td>

    {/* Status */}
    <td>
      <span
        className={`px-3 py-1 rounded-full text-xs ${
          leave.status === "Approved"
            ? "bg-green-500/20 text-green-400"
            : leave.status === "Rejected"
            ? "bg-red-500/20 text-red-400"
            : "bg-yellow-500/20 text-yellow-400"
        }`}
      >
        {leave.status}
      </span>
    </td>

    {/* Action */}
    <td className="text-center">
      {leave.status === "Pending" ? (
        <div className="flex justify-center gap-2">
          <button
            onClick={() =>
              updateStatus(leave.id, "Approved")
            }
            className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
          >
            <Check size={15} />
            Approve
          </button>

          <button
            onClick={() =>
              updateStatus(leave.id, "Rejected")
            }
            className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
          >
            <X size={15} />
            Reject
          </button>
        </div>
      ) : (
        <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-xs">
          Processed
        </span>
      )}
    </td>
  </tr>
))}

          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveApproval;