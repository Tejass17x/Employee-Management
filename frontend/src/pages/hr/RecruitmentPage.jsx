import React, { useEffect, useState } from "react";
import {
  Plus,
  Briefcase,
  Users,
  Calendar,
  BadgeCheck
} from "lucide-react";




const RecruitmentPage = () => {
  const [showModal, setShowModal] = useState(false);

  const [newJob, setNewJob] = useState({
    title: "",
    department: "",
    candidates: 0,
    status: "Open"
  });
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/hr/jobs")
      .then((res) => res.json())
      .then((data) => {
        const formattedJobs = data.map((job) => ({
          title: job.title,
          department: job.department,
          posted: new Date(job.posted_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          candidates: job.candidates,
          status: job.status,
          color:
            job.status === "Interviewing"
              ? "bg-blue-500/15 text-blue-400"
              : job.status === "Open"
                ? "bg-green-500/15 text-green-400"
                : job.status === "Closing Soon"
                  ? "bg-yellow-500/15 text-yellow-400"
                  : "bg-slate-700 text-slate-300",
        }));

        setJobs(formattedJobs);
        fetch("http://localhost:5000/api/hr/candidates")
          .then((res) => res.json())
          .then((data) => {
            const formattedCandidates = data.map((candidate) => ({
              initials: candidate.initials,
              name: candidate.name,
              role: candidate.job_title,
              stage: candidate.stage,
              color:
                candidate.stage === "Interviewing"
                  ? "bg-blue-500/15 text-blue-400"
                  : candidate.stage === "Screening"
                    ? "bg-yellow-500/15 text-yellow-400"
                    : candidate.stage === "Offer"
                      ? "bg-green-500/15 text-green-400"
                      : "bg-slate-700 text-slate-300",
            }));

            setCandidates(formattedCandidates);
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  }, []);

  const handlePostJob = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/hr/jobs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newJob),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Job posted successfully!");

        setShowModal(false);

        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to post job");
    }
  };
  return (
    <div className="flex flex-col gap-6 text-white pb-10">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Recruitment</h1>
          <p className="text-slate-400 mt-1 text-base">
            Job openings and candidate pipeline
          </p>
        </div>

        <button
  onClick={() => setShowModal(true)}
  className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold text-base transition"
>
  <Plus size={18} />
  Post Job
</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="bg-[#0F1B33] border border-[#1D2A44] rounded-xl p-5 flex justify-between items-start h-[130px]">
          <div>
            <p className="text-[#7D8FB3] text-xs tracking-[2px] uppercase">
              Open Roles
            </p>
            <h1 className="text-4xl font-bold mt-5">4</h1>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Briefcase className="text-blue-400" size={18} />
          </div>
        </div>

        <div className="bg-[#0F1B33] border border-[#1D2A44] rounded-xl p-5 flex justify-between items-start h-[130px]">
          <div>
            <p className="text-[#7D8FB3] text-xs tracking-[2px] uppercase">
              Total Candidates
            </p>
            <h1 className="text-4xl font-bold mt-5">41</h1>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Users className="text-purple-400" size={18} />
          </div>
        </div>

        <div className="bg-[#0F1B33] border border-[#1D2A44] rounded-xl p-5 flex justify-between items-start h-[130px]">
          <div>
            <p className="text-[#7D8FB3] text-xs tracking-[2px] uppercase">
              Interviews This Week
            </p>
            <h1 className="text-4xl font-bold mt-5">6</h1>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <Calendar className="text-cyan-400" size={18} />
          </div>
        </div>

        <div className="bg-[#0F1B33] border border-[#1D2A44] rounded-xl p-5 flex justify-between items-start h-[130px]">
          <div>
            <p className="text-[#7D8FB3] text-xs tracking-[2px] uppercase">
              Offers Extended
            </p>
            <h1 className="text-4xl font-bold mt-5">2</h1>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <BadgeCheck className="text-green-400" size={18} />
          </div>
        </div>

      </div>

      {/* Active Job Openings */}
      <div className="bg-[#12192b] rounded-xl border border-slate-800">
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-semibold">Active Job Openings</h2>
            <p className="text-slate-400 text-sm">
              Current positions accepting applications
            </p>
          </div>

          <button className="text-blue-400 text-sm font-medium">
            View All
          </button>
        </div>

        {jobs.map((job, index) => (
          <div
            key={index}
            className="flex justify-between items-center px-5 py-5 border-b border-slate-800"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Briefcase size={20} className="text-blue-400" />
              </div>

              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-slate-400 text-sm">
                  {job.department} • Posted {job.posted}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center min-w-[70px]">
                <h3 className="text-lg font-bold">{job.candidates}</h3>
                <p className="text-slate-400 text-sm">candidates</p>
              </div>

              <span className={`px-3 py-1.5 rounded-full text-sm ${job.color}`}>
                {job.status}
              </span>

              <button className="px-4 py-2 rounded-lg bg-[#1A2742] hover:bg-[#233252] transition">
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Candidate Pipeline */}
      <div className="bg-[#12192b] rounded-xl border border-slate-800 p-5">
        <h2 className="text-xl font-semibold">Candidate Pipeline</h2>
        <p className="text-slate-400 text-sm mt-1 mb-5">
          Track applicants through the hiring process
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#18253D] rounded-xl p-4 text-center">
            <h2 className="text-2xl font-bold">18</h2>
            <p className="text-slate-400 text-sm">Applied</p>
          </div>

          <div className="bg-[#2A2725] rounded-xl p-4 text-center">
            <h2 className="text-2xl font-bold">12</h2>
            <p className="text-slate-400 text-sm">Screening</p>
          </div>

          <div className="bg-[#132D55] rounded-xl p-4 text-center">
            <h2 className="text-2xl font-bold">8</h2>
            <p className="text-slate-400 text-sm">Interviewing</p>
          </div>

          <div className="bg-[#08353B] rounded-xl p-4 text-center">
            <h2 className="text-2xl font-bold">3</h2>
            <p className="text-slate-400 text-sm">Offer</p>
          </div>
        </div>

        <div className="space-y-3">
          {candidates.map((candidate, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-[#0F1B33] p-4 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
                  {candidate.initials}
                </div>

                <div>
                  <h3 className="font-medium">{candidate.name}</h3>
                  <p className="text-slate-400 text-sm">{candidate.role}</p>
                </div>
              </div>

              <span className={`px-3 py-1.5 rounded-full text-sm ${candidate.color}`}>
                {candidate.stage}
              </span>
            </div>
          ))}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#12192b] p-6 rounded-xl w-[400px] border border-slate-700">
            <h2 className="text-xl font-bold mb-4">Post New Job</h2>

            <input
              type="text"
              placeholder="Job Title"
              className="w-full p-3 mb-3 rounded bg-[#0b1121] border border-slate-700"
              onChange={(e) =>
                setNewJob({ ...newJob, title: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Department"
              className="w-full p-3 mb-3 rounded bg-[#0b1121] border border-slate-700"
              onChange={(e) =>
                setNewJob({ ...newJob, department: e.target.value })
              }
            />

            <select
              className="w-full p-3 mb-4 rounded bg-[#0b1121] border border-slate-700"
              onChange={(e) =>
                setNewJob({ ...newJob, status: e.target.value })
              }
            >
              <option>Open</option>
              <option>Interviewing</option>
              <option>Closing Soon</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 rounded"
              >
                Cancel
              </button>

              <button
  onClick={handlePostJob}
  className="px-4 py-2 bg-blue-600 rounded"
>
  Submit
</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RecruitmentPage;