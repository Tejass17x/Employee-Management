import React, { useEffect, useState } from "react";
import { Plus, Building2, Pencil } from "lucide-react";



const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [showDepartmentModal, setShowDepartmentModal] = useState(false);

    const [newDepartment, setNewDepartment] = useState({
        name: "",
        head_name: "",
        employee_count: 0,
        budget: "",
        open_positions: 0
    });

    useEffect(() => {
        fetch("http://localhost:5000/api/hr/departments")
            .then((res) => res.json())
            .then((data) => {
                const formattedData = data.map((dept) => ({
                    name: dept.name,
                    head: dept.head_name,
                    employees: dept.employee_count,
                    budget: `${(dept.budget / 1000000).toFixed(1)}M`,
                    open: dept.open_positions,
                }));

                setDepartments(formattedData);
            })
            .catch((err) => console.error(err));
    }, []);
    const handleCreateDepartment = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/hr/departments",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newDepartment),
                }
            );

            const data = await response.json();

            if (data.success) {
                alert("Department created successfully!");

                setShowDepartmentModal(false);

                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            alert("Failed to create department");
        }
    };
    return (
        <div className="text-white flex flex-col gap-6 pb-10">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Departments</h1>
                    <p className="text-slate-400 mt-1 text-base">
                        Manage teams and organizational structure
                    </p>
                </div>

                <button
                    onClick={() => setShowDepartmentModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold transition"
                >
                    <Plus size={18} />
                    New Department
                </button>
            </div>

            {/* Department Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {departments.map((dept, index) => (
                    <div
                        key={index}
                        className="bg-[#0F1B33] border border-[#1D2A44] rounded-2xl p-5"
                    >
                        {/* Top Row */}
                        <div className="flex justify-between items-start mb-6">

                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                <Building2 className="text-blue-400" size={20} />
                            </div>

                            <span className="px-4 py-1 rounded-full bg-yellow-500/15 text-yellow-400 text-sm font-semibold">
                                {dept.open} open
                            </span>
                        </div>

                        {/* Department Details */}
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {dept.name}
                        </h2>

                        <p className="text-slate-400 mb-6">
                            Head: {dept.head}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">

                            <div className="bg-[#1A2742] rounded-xl p-4">
                                <h3 className="text-2xl font-bold text-white">
                                    {dept.employees}
                                </h3>

                                <p className="text-slate-400 mt-1">
                                    Employees
                                </p>
                            </div>

                            <div className="bg-[#1A2742] rounded-xl p-4">
                                <h3 className="text-2xl font-bold text-white">
                                    {dept.budget}
                                </h3>

                                <p className="text-slate-400 mt-1">
                                    Budget
                                </p>
                            </div>

                        </div>

                        {/* Bottom Buttons */}
                        <div className="flex gap-3">

                            <button className="flex-1 bg-[#1A2742] hover:bg-[#233252] py-2.5 rounded-xl font-semibold transition">
                                View Team
                            </button>

                            <button className="w-12 bg-[#1A2742] hover:bg-[#233252] rounded-xl flex items-center justify-center transition">
                                <Pencil size={18} />
                            </button>

                        </div>
                    </div>
                ))}

            </div>
            {showDepartmentModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#12192b] p-6 rounded-xl w-[450px] border border-slate-700">

                        <h2 className="text-xl font-bold mb-4">Create Department</h2>

                        <input
                            type="text"
                            placeholder="Department Name"
                            className="w-full p-3 mb-3 rounded bg-[#0b1121] border border-slate-700"
                            onChange={(e) =>
                                setNewDepartment({
                                    ...newDepartment,
                                    name: e.target.value
                                })
                            }
                        />

                        <input
                            type="text"
                            placeholder="Department Head"
                            className="w-full p-3 mb-3 rounded bg-[#0b1121] border border-slate-700"
                            onChange={(e) =>
                                setNewDepartment({
                                    ...newDepartment,
                                    head_name: e.target.value
                                })
                            }
                        />

                        <input
                            type="number"
                            placeholder="Employee Count"
                            className="w-full p-3 mb-3 rounded bg-[#0b1121] border border-slate-700"
                            onChange={(e) =>
                                setNewDepartment({
                                    ...newDepartment,
                                    employee_count: e.target.value
                                })
                            }
                        />

                        <input
                            type="number"
                            placeholder="Budget"
                            className="w-full p-3 mb-3 rounded bg-[#0b1121] border border-slate-700"
                            onChange={(e) =>
                                setNewDepartment({
                                    ...newDepartment,
                                    budget: e.target.value
                                })
                            }
                        />

                        <input
                            type="number"
                            placeholder="Open Positions"
                            className="w-full p-3 mb-4 rounded bg-[#0b1121] border border-slate-700"
                            onChange={(e) =>
                                setNewDepartment({
                                    ...newDepartment,
                                    open_positions: e.target.value
                                })
                            }
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDepartmentModal(false)}
                                className="px-4 py-2 bg-gray-600 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleCreateDepartment}
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

export default DepartmentsPage;