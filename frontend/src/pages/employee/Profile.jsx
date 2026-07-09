import React, { useState, useEffect } from 'react';
import { User, Shield, Briefcase, FileText, PhoneCall, Save, Loader2, Plus, X } from 'lucide-react';
import api from '../../services/api';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    user: {},
    profile: {
      phone: '',
      address: '',
      job_title: '',
      department: '',
      joining_date: '',
      employee_id: '',
      skills_json: '[]',
      certifications_json: '[]',
      emergency_contact_name: '',
      emergency_contact_relation: '',
      emergency_contact_phone: ''
    }
  });

  const [personalForm, setPersonalForm] = useState({ name: '', phone: '', address: '' });
  const [emergencyForm, setEmergencyForm] = useState({ name: '', relation: '', phone: '' });
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: '', level: 50 });
  const [certifications, setCertifications] = useState([]);
  const [newCert, setNewCert] = useState('');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employee/profile');
      setProfileData(res.data);

      const profile = res.data.profile || {};
      const user = res.data.user || {};

      setPersonalForm({
        name: user.name || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });

      setEmergencyForm({
        name: profile.emergency_contact_name || '',
        relation: profile.emergency_contact_relation || '',
        phone: profile.emergency_contact_phone || ''
      });

      try {
        setSkills(JSON.parse(profile.skills_json || '[]'));
      } catch (e) {
        setSkills([]);
      }

      try {
        setCertifications(JSON.parse(profile.certifications_json || '[]'));
      } catch (e) {
        setCertifications([]);
      }

      // Fetch docs
      const docRes = await api.get('/employee/documents');
      setDocuments(docRes.data);
    } catch (error) {
      console.error('Error fetching profile details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/employee/profile', {
        name: personalForm.name,
        phone: personalForm.phone,
        address: personalForm.address
      });
      alert('Personal details saved successfully!');
    } catch (error) {
      alert('Failed to save details.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmergency = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/employee/profile', {
        emergencyContact: {
          name: emergencyForm.name,
          relation: emergencyForm.relation,
          phone: emergencyForm.phone
        }
      });
      alert('Emergency contacts saved successfully!');
    } catch (error) {
      alert('Failed to save details.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name) return;
    const updated = [...skills, newSkill];
    setSkills(updated);
    setNewSkill({ name: '', level: 50 });
    await saveSkillsAndCerts(updated, certifications);
  };

  const handleRemoveSkill = async (index) => {
    const updated = skills.filter((_, i) => i !== index);
    setSkills(updated);
    await saveSkillsAndCerts(updated, certifications);
  };

  const handleAddCert = async () => {
    if (!newCert) return;
    const updated = [...certifications, newCert];
    setCertifications(updated);
    setNewCert('');
    await saveSkillsAndCerts(skills, updated);
  };

  const handleRemoveCert = async (index) => {
    const updated = certifications.filter((_, i) => i !== index);
    setCertifications(updated);
    await saveSkillsAndCerts(skills, updated);
  };

  const saveSkillsAndCerts = async (updatedSkills, updatedCerts) => {
    try {
      await api.put('/employee/profile', {
        skills: updatedSkills,
        certifications: updatedCerts
      });
    } catch (error) {
      console.error('Failed to sync skills/certs with server:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading Profile...
      </div>
    );
  }

  const { profile, user } = profileData;

  return (
    <div className="text-white font-sans pb-10">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Overview Card */}
        <div className="w-full lg:w-1/3 bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex flex-col items-center text-center h-fit">
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold mb-4 shadow-lg shadow-blue-500/20">
            {user.name ? user.name[0] : 'U'}
          </div>
          <h2 className="text-xl font-bold mb-1">{user.name}</h2>
          <p className="text-blue-400 text-xs font-semibold tracking-wider mb-6">{profile.job_title || 'Employee'}</p>
          <div className="w-full border-t border-slate-800 pt-6 space-y-3.5 text-left text-sm text-slate-400">
            <div className="flex justify-between"><span className="text-slate-500">Employee ID</span><span className="font-semibold text-slate-300">{profile.employee_id || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Department</span><span className="font-semibold text-slate-300">{profile.department || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Official Email</span><span className="font-semibold text-slate-300 truncate max-w-[180px]">{user.email}</span></div>
          </div>
        </div>

        {/* Right Side: Tab Interface */}
        <div className="flex-1 bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex flex-col">
          {/* Tabs header */}
          <div className="flex border-b border-slate-800 mb-6 overflow-x-auto pb-1 scrollbar-none gap-2">
            {[
              { id: 'personal', name: 'Personal', icon: <User size={16} /> },
              { id: 'employment', name: 'Employment', icon: <Briefcase size={16} /> },
              { id: 'skills', name: 'Skills & Certs', icon: <Shield size={16} /> },
              { id: 'documents', name: 'Documents', icon: <FileText size={16} /> },
              { id: 'emergency', name: 'Emergency', icon: <PhoneCall size={16} /> }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === t.id ? 'bg-[#1a233a] text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t.icon}
                {t.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {activeTab === 'personal' && (
              <form onSubmit={handleSavePersonal} className="space-y-4 max-w-lg">
                <h3 className="text-lg font-bold mb-4">Edit Personal Information</h3>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">FULL NAME</label>
                  <input
                    type="text"
                    required
                    value={personalForm.name}
                    onChange={e => setPersonalForm({ ...personalForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">CONTACT PHONE</label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={personalForm.phone}
                    onChange={e => setPersonalForm({ ...personalForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">ADDRESS</label>
                  <textarea
                    rows="3"
                    placeholder="Enter physical address"
                    value={personalForm.address}
                    onChange={e => setPersonalForm({ ...personalForm, address: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
                </button>
              </form>
            )}

            {activeTab === 'employment' && (
              <div className="space-y-4 max-w-lg">
                <h3 className="text-lg font-bold mb-4 text-slate-200">Employment Details (Read-only)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">JOB TITLE</label>
                    <div className="text-sm font-semibold text-slate-300 py-2.5 border-b border-slate-800">{profile.job_title || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">DEPARTMENT</label>
                    <div className="text-sm font-semibold text-slate-300 py-2.5 border-b border-slate-800">{profile.department || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">EMPLOYEE ID</label>
                    <div className="text-sm font-semibold text-slate-300 py-2.5 border-b border-slate-800">{profile.employee_id || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">DATE OF JOINING</label>
                    <div className="text-sm font-semibold text-slate-300 py-2.5 border-b border-slate-800">
                      {profile.joining_date ? new Date(profile.joining_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-4">Core Skills</h3>
                  {skills.length === 0 ? (
                    <p className="text-xs text-slate-500">No skills added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {skills.map((skill, index) => (
                        <div key={index} className="bg-[#0a0f1c] p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
                          <div className="flex-1 pr-4">
                            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                              <span>{skill.name}</span>
                              <span>{skill.level}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full" style={{ width: `${skill.level}%` }}></div>
                            </div>
                          </div>
                          <button onClick={() => handleRemoveSkill(index)} className="text-red-500 hover:text-red-400 p-1.5"><X size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Skill form */}
                  <div className="mt-4 flex gap-3 max-w-md">
                    <input
                      type="text"
                      placeholder="Add skill (e.g. Docker)"
                      value={newSkill.name}
                      onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-xs"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newSkill.level}
                      onChange={e => setNewSkill({ ...newSkill, level: parseInt(e.target.value) || 0 })}
                      className="w-16 px-3 py-1.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-xs"
                    />
                    <button onClick={handleAddSkill} className="bg-[#1a233a] hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"><Plus size={14} /> Add</button>
                  </div>
                </div>

                <div className="border-t border-slate-800/50 pt-6">
                  <h3 className="text-lg font-bold mb-4">Certifications</h3>
                  {certifications.length === 0 ? (
                    <p className="text-xs text-slate-500">No certifications added yet.</p>
                  ) : (
                    <div className="space-y-2 max-w-md">
                      {certifications.map((cert, index) => (
                        <div key={index} className="bg-[#0a0f1c] px-4 py-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-sm">
                          <span>{cert}</span>
                          <button onClick={() => handleRemoveCert(index)} className="text-red-500 hover:text-red-400"><X size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Add Cert Form */}
                  <div className="mt-4 flex gap-3 max-w-md">
                    <input
                      type="text"
                      placeholder="Add certification (e.g. AWS Certified)"
                      value={newCert}
                      onChange={e => setNewCert(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-xs"
                    />
                    <button onClick={handleAddCert} className="bg-[#1a233a] hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"><Plus size={14} /> Add</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">Uploaded Verification Documents</h3>
                {documents.length === 0 ? (
                  <p className="text-xs text-slate-500">No documents found.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="bg-[#0a0f1c] p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400"><FileText size={20} /></div>
                          <div>
                            <p className="text-sm font-semibold text-slate-200">{doc.file_name}</p>
                            <p className="text-[11px] text-slate-500">{doc.file_type} • Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button className="text-xs text-blue-400 hover:underline">Download</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'emergency' && (
              <form onSubmit={handleSaveEmergency} className="space-y-4 max-w-lg">
                <h3 className="text-lg font-bold mb-4">Emergency Contact Information</h3>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">CONTACT NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter name"
                    value={emergencyForm.name}
                    onChange={e => setEmergencyForm({ ...emergencyForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">RELATIONSHIP</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spouse, Father"
                    value={emergencyForm.relation}
                    onChange={e => setEmergencyForm({ ...emergencyForm, relation: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">PHONE NUMBER</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter contact phone"
                    value={emergencyForm.phone}
                    onChange={e => setEmergencyForm({ ...emergencyForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Emergency Info
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
