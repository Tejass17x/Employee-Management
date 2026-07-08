import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Users, Building2, Briefcase, Activity, Mail, Lock, Eye, EyeOff, HelpCircle, KeyRound, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [roleTab, setRoleTab] = useState('Employee');
  const [loginMethod, setLoginMethod] = useState('Password');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter a valid email address first.");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false); setOtpSent(true);
      alert(`OTP sent successfully to ${email}.`);
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && !agreeTerms) return alert("Please agree to the Terms and Conditions.");
    if (isLogin && loginMethod === 'OTP' && !otp) return alert("Please enter the OTP.");

    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const payload = isLogin 
        ? { email, password: loginMethod === 'OTP' ? 'otp-bypass' : password, role: roleTab } 
        : { name, email, password, role: roleTab };

      const fetchURL = `http://localhost:5000${endpoint}`;

      const response = await fetch(fetchURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        if (!isLogin) {
          alert("Account creation requested! Please wait for Admin/HR approval.");
          setIsLogin(true); 
        } else {
          login(data.user); 
          if (data.user.role === 'Admin') navigate('/admin');
          else if (data.user.role === 'HR') navigate('/hr');
          else navigate('/employee');
        }
      } else {
        alert(`Login Failed: ${data.message || 'Invalid Credentials'}`);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert('Backend connection error! Is your backend server running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0f1c] text-white font-sans">
      <div className="hidden lg:flex lg:w-[45%] bg-[#0b1324] p-12 flex-col justify-between border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-20"><div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"><Layers size={20} className="text-white" /></div><span className="text-xl font-bold tracking-wide">Nexus Technologies</span></div>
          <h1 className="text-5xl font-bold leading-[1.15] mb-6">People-first<br />workforce platform</h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-md">Streamline HR operations, track performance, and empower your team — all in one unified workspace.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-12 max-w-lg">
          <div className="bg-[#121b2f] border border-slate-800/80 p-5 rounded-2xl"><Users size={18} className="text-blue-500 mb-4" /><h3 className="text-2xl font-bold mb-1">108</h3><p className="text-slate-500 text-xs font-medium">Employees</p></div>
          <div className="bg-[#121b2f] border border-slate-800/80 p-5 rounded-2xl"><Building2 size={18} className="text-blue-500 mb-4" /><h3 className="text-2xl font-bold mb-1">6</h3><p className="text-slate-500 text-xs font-medium">Departments</p></div>
          <div className="bg-[#121b2f] border border-slate-800/80 p-5 rounded-2xl"><Briefcase size={18} className="text-blue-500 mb-4" /><h3 className="text-2xl font-bold mb-1">8</h3><p className="text-slate-500 text-xs font-medium">Open Roles</p></div>
          <div className="bg-[#121b2f] border border-slate-800/80 p-5 rounded-2xl"><Activity size={18} className="text-blue-500 mb-4" /><h3 className="text-2xl font-bold mb-1">99.9%</h3><p className="text-slate-500 text-xs font-medium">Uptime</p></div>
        </div>
      </div>

      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 relative">
        <div className="w-full max-w-[420px]">
          <h2 className="text-[28px] font-bold mb-1">{isLogin ? 'Sign in' : 'Create Account'}</h2>
          <p className="text-slate-400 text-sm mb-8">{isLogin ? 'Welcome back to Nexus Technologies' : 'Request access to the Nexus portal'}</p>

          <div className="flex bg-[#121b2f] p-1 rounded-xl mb-8">
            {(isLogin ? ['Employee', 'HR', 'Admin'] : ['Employee', 'HR']).map((r) => (
              <button key={r} type="button" onClick={() => setRoleTab(r)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${roleTab === r ? 'bg-[#1e293b] text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>{r}</button>
            ))}
          </div>

          {isLogin && (
            <div className="flex gap-6 border-b border-slate-800 mb-8">
              {['Password', 'OTP'].map((method) => (
                <button key={method} type="button" onClick={() => { setLoginMethod(method); setOtpSent(false); }} className={`pb-3 text-sm font-semibold transition-all border-b-2 ${loginMethod === method ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{method}</button>
              ))}
            </div>
          )}

          <form onSubmit={isLogin && loginMethod === 'OTP' && !otpSent ? handleSendOTP : handleSubmit} className="space-y-5">
            {!isLogin && (
              <div><label className="text-sm font-semibold block mb-2 text-slate-300">Full Name</label><div className="relative"><Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-[#121b2f] border border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm" placeholder="John Doe" required={!isLogin} /></div></div>
            )}
            <div><label className="text-sm font-semibold block mb-2 text-slate-300">Email</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-[#121b2f] border border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm disabled:opacity-50" placeholder="admin@nexus.io" required disabled={otpSent} /></div></div>
            {isLogin && loginMethod === 'OTP' ? (
              otpSent && (<div><label className="text-sm font-semibold block mb-2 text-slate-300">Enter OTP</label><div className="relative"><KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input type="text" maxLength="4" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-[#121b2f] border border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm tracking-[0.5em] font-bold" placeholder="••••" required /></div></div>)
            ) : (
              <div><label className="text-sm font-semibold block mb-2 text-slate-300">Password</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-12 py-3 bg-[#121b2f] border border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm tracking-wide" placeholder="••••••••" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            )}
            {!isLogin && (<div className="flex items-start gap-3 pt-2"><input type="checkbox" id="terms" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-700 bg-[#121b2f] accent-blue-600" /><label htmlFor="terms" className="text-sm text-slate-400 leading-tight">I agree to the <a href="#" className="text-blue-500 hover:underline">Terms of Service</a>.</label></div>)}
            
            <button type="submit" disabled={isLoading} className="w-full bg-[#3b82f6] text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-70">
              {isLoading ? 'Processing...' : (isLogin ? (loginMethod === 'OTP' && !otpSent ? 'Send OTP' : 'Sign in') : 'Submit Request')}
              {isLogin && loginMethod === 'OTP' && !otpSent && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">{isLogin ? "Need access to the portal? " : "Already have an account? "}<button type="button" onClick={() => { if (isLogin && roleTab === 'Admin') setRoleTab('Employee'); setIsLogin(!isLogin); }} className="text-blue-500 font-semibold hover:text-blue-400 transition-colors">{isLogin ? 'Request an account' : 'Sign in'}</button></p>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;