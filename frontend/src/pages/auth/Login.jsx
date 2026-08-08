import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

// Custom Animated Input Component
const AnimatedInput = ({ icon: Icon, label, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
      <div 
        className={`relative flex items-center transition-all duration-300 rounded-2xl bg-white/60 backdrop-blur-sm border-2 overflow-hidden
        ${isFocused ? 'border-brand-500 shadow-[0_0_20px_-3px_rgba(168,85,247,0.3)] bg-white' : 'border-purple-100 hover:border-purple-200'}`}
      >
        <div className={`absolute left-4 transition-all duration-300 ${isFocused ? 'text-brand-600 scale-110' : 'text-gray-400'}`}>
          <Icon size={20} />
        </div>
        <input
          {...props}
          onFocus={(e) => { setIsFocused(true); if(props.onFocus) props.onFocus(e); }}
          onBlur={(e) => { setIsFocused(false); if(props.onBlur) props.onBlur(e); }}
          className="w-full bg-transparent px-4 py-4 pl-12 text-gray-800 placeholder:text-gray-400 outline-none font-medium"
        />
      </div>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/funding';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) { 
        login(data.data.token, data.data.user); 
        navigate(from, { replace: true }); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-hero relative overflow-hidden">
      
      {/* Abstract Background Orbs for overall page glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-brand-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-pink-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />

      {/* Left Panel — Decorative Premium Branding */}
      <div className="hidden lg:flex w-[45%] bg-brand-900 relative overflow-hidden flex-col justify-between p-16 shadow-2xl z-10 rounded-r-[3rem] border-r border-brand-800/50">
        <div className="absolute inset-0 bg-gradient-brand opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.25)_0%,_transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-brand-950/80 to-transparent" />
        
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgyMHYyMEgxeiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=')] [background-size:30px_30px]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="text-white text-2xl font-extrabold tracking-tight">SHEscale</span>
        </div>

        <div className="relative z-10 mt-20 flex-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-5xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              Unlock Your<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-pink-300">
                Funding Potential.
              </span>
            </h2>
            <p className="text-brand-100 text-lg leading-relaxed max-w-sm mb-10 font-medium">
              Join thousands of visionary women entrepreneurs who have secured capital and mentorship through our AI-driven platform.
            </p>
            
            <div className="space-y-4">
              {[
                'AI-Matched to 10+ Government Schemes', 
                'Automated Grant Applications', 
                'Smart P&L Projections'
              ].map((feature, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
                  key={feature} 
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 w-max hover:bg-white/15 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-300/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={14} className="text-brand-100" />
                  </div>
                  <span className="text-brand-50 text-sm font-semibold">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <p className="relative z-10 text-brand-300/80 text-sm font-medium">© 2025 SHEscale · For the Future of Founders</p>
      </div>

      {/* Right Panel — Interactive Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 lg:p-12 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px]"
        >
          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden">
            
            {/* Subtle inner top highlight */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-50" />

            {/* Mobile logo */}
            <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
              <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="text-2xl font-extrabold gradient-text">SHEscale</span>
            </div>

            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3 tracking-tight">Welcome back</h1>
              <p className="text-gray-500 font-medium">Log in to continue building your empire.</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="flex items-center gap-3 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl text-red-700 text-sm font-semibold shadow-sm">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <AnimatedInput
                icon={Mail}
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@startup.com"
                autoComplete="email"
                disabled={isLoading}
              />

              <AnimatedInput
                icon={Lock}
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
              />

              <div className="flex justify-end -mt-2 mb-2">
                <a href="#" className="text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors">
                  Forgot Password?
                </a>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full py-4 rounded-2xl font-bold text-white text-lg shadow-[0_8px_25px_-8px_rgba(124,58,237,0.6)] hover:shadow-[0_12px_30px_-8px_rgba(124,58,237,0.7)] transition-all duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-brand group-hover:scale-[1.05] transition-transform duration-500" />
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authenticating...</>
                  ) : (
                    <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </div>
              </motion.button>
            </form>
          </div>

          <p className="text-center text-sm font-medium text-gray-500 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 font-extrabold hover:text-brand-800 transition-colors ml-1">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

