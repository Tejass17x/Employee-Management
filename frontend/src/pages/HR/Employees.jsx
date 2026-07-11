import React, { useState } from "react";
import { Search, Filter, Download, Plus, Eye, Edit, Trash2, X,} from "lucide-react";

const initialEmployees = [
  {
    id: "EMP-001",
    name: "Alex Chen",
    email: "alex.chen@nexus.io",
    department: "Engineering",
    role: "Senior Engineer",
    salary: "$125k",
    status: "Active",
  },
  {
    id: "EMP-002",
    name: "Maria Santos",
    email: "m.santos@nexus.io",
    department: "Design",
    role: "Product Designer",
    salary: "$98k",
    status: "Active",
  },
];

const Employees = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    department: "",
    role: "",
    salary: "",
    status: "Active",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addEmployee = () => {
    if (!formData.id || !formData.name || !formData.email) {
      alert("Please fill required fields");
      return;
    }

    setEmployees([
      ...employees,
      formData,
    ]);

    setFormData({
      id: "",
      name: "",
      email: "",
      department: "",
      role: "",
      salary: "",
      status: "Active",
    });

    setShowForm(false);
  };

  const deleteEmployee = (id) => {
    setEmployees(
      employees.filter(
        (employee) => employee.id !== id
      )
    );
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      employee.email
        .toLowerCase()
        .includes(search.toLowerCase())
  );


  return (
    <div className="w-full text-white space-y-5">

      {/* Header */}

      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Employee Management
          </h1>
          <p className="text-slate-400 text-sm">
            View and manage all employees
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-lg flex items-center justify-center gap-2">
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* Add Employee Form */}
      {showForm && (
        <div className="bg-[#12192b] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Add New Employee
            </h2>
            <X
              size={20}
              className="cursor-pointer"
              onClick={() => setShowForm(false)}/>

          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              ["id", "Employee ID"],
              ["name", "Employee Name"],
              ["email", "Email"],
              ["department", "Department"],
              ["role", "Role"],
              ["salary", "Salary"],
            ].map((field) => (
              <input
                key={field[0]}
                name={field[0]}
                placeholder={field[1]}
                value={formData[field[0]]}
                onChange={handleChange}
                className="bg-[#1a2338] border border-slate-700 rounded-lg px-3 py-2 outline-none"
              />
            ))}
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="bg-[#1a2338] border border-slate-700 rounded-lg px-3 py-2"
            >
              <option>
                Active
              </option>
              <option>
                On Leave
              </option>
            </select>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={addEmployee}
              className="bg-green-600 px-5 py-2 rounded-lg">
              Save Employee
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="bg-slate-700 px-5 py-2 rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Search Section */}

      <div className="bg-[#12192b] border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col xl:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-3.5 text-slate-500"
            />
            <input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1a2338] border border-slate-700 rounded-lg py-3 pl-10 px-4 outline-none"
            />
          </div>
          <button className="bg-[#1a2338] px-5 py-3 rounded-lg flex gap-2 justify-center">
            <Filter size={18} />
            Filter
          </button>
          <button className="bg-[#1a2338] px-5 py-3 rounded-lg flex gap-2 justify-center">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>
      {/* Employee Table */}
      <div className="bg-[#12192b] border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th className="p-4 text-left">
                Employee
              </th>

              <th>ID</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              <th>Salary</th>
              <th>Actions</th>

            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (

              <tr
                key={employee.id} className="border-b border-slate-800">

                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      {employee.name.charAt(0)}
                    </div>

                    <div>

                      <p>{employee.name}</p>
                      <p className="text-sm text-slate-400">{employee.email}</p>

                    </div>
                  </div>
                </td>
                <td>
                  {employee.id}
                </td>
                <td>
                  {employee.department}
                </td>
                <td>
                  {employee.role}
                </td>
                <td><span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">{employee.status}</span></td>
                <td>{employee.salary} </td>

                <td>
                  <div className="flex justify-center gap-3">
                    <Eye size={18} className="cursor-pointer"/>
                    <Edit size={18} className="cursor-pointer"/>
                    <Trash2 size={18} onClick={() => deleteEmployee(employee.id)} className="cursor-pointer hover:text-red-400"/>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Employees;