import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Sparkles, Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('entrepreneur');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/signup', { email, password, role });
      if (data.success) { login(data.data.token, data.data.user); navigate('/funding', { replace: true }); }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const perks = [
    'Match with 10+ government schemes instantly',
    'AI-generated professional applications',
    '12-month P&L projections in seconds',
    'Mentorship & networking built-in',
  ];

  return (
    <div className="min-h-screen flex bg-gradient-hero">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-brand relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.12)_0%,_transparent_60%)]" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-800/30 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-white text-2xl font-extrabold tracking-tight">SHEscale</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Join 2,400+<br />Women Building<br />India's Future.
          </h2>
          <p className="text-brand-200 text-base mb-8">Free forever. No credit card needed.</p>
          <div className="flex flex-col gap-3">
            {perks.map(p => (
              <div key={p} className="flex items-start gap-3 text-brand-100 text-sm font-medium">
                <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5 text-brand-300" />
                {p}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-brand-300 text-xs">© 2025 SHEscale · Empowering Women Founders</p>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md py-8"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-xl font-extrabold gradient-text">SHEscale</span>
          </div>

          <h1 className="text-3xl font-extrabold text-text-primary mb-2">Create your account</h1>
          <p className="text-gray-500 mb-8">Start your funding journey for free today</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm"
            >
              <AlertCircle size={17} className="flex-shrink-0" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email" disabled={isLoading}
                  className="input-base pl-11" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters" disabled={isLoading}
                  className="input-base pl-11" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password" disabled={isLoading}
                  className="input-base pl-11" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">I am a...</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isLoading}
                  className="input-base pl-11 appearance-none cursor-pointer"
                >
                  <option value="entrepreneur">Women Entrepreneur</option>
                  <option value="mentor">Mentor / Investor</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 mt-2"
            >
              {isLoading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                : <>Create Free Account <ArrowRight size={16} /></>
              }
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 font-bold hover:text-brand-700 transition-colors">
                Sign in →
              </Link>
            </p>
            <p className="text-center text-[11px] text-gray-400">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
