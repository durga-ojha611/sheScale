import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Landmark, ArrowRight, Sparkles, TrendingUp, Shield, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const stats = [
  { label: 'Women Funded',      value: '2,400+', icon: TrendingUp },
  { label: 'Active Mentors',    value: '380+',   icon: Star },
  { label: 'Schemes Matched',   value: '10,000+', icon: Shield },
  { label: 'Avg Approval Rate', value: '78%',    icon: Sparkles },
];

const features = [
  {
    icon: Landmark,
    title: 'AI Funding Matcher',
    desc: 'AI-driven matching to government schemes and grants tailored for women entrepreneurs.',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    path: '/funding',
    tag: 'Powered by Gemini AI',
  },
  {
    icon: Target,
    title: 'Mentorship Hub',
    desc: 'Practice pitches with AI and unlock exclusive 1-on-1 sessions with top industry experts.',
    gradient: 'from-purple-500 to-fuchsia-600',
    bg: 'bg-purple-50',
    path: '/mentorship',
    tag: 'Mock Interview Ready',
  },
  {
    icon: Users,
    title: 'Peer Networking',
    desc: 'Connect with local founders and potential co-founders through our intelligent matching directory.',
    gradient: 'from-fuchsia-500 to-pink-500',
    bg: 'bg-fuchsia-50',
    path: '/networking',
    tag: 'Find Your Tribe',
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-hero">
        {/* Decorative blobs */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-60 -left-40 w-[700px] h-[700px] bg-lavender-200/20 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-brand-300/15 rounded-full blur-2xl pointer-events-none"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Content */}
            <div>
              {/* Badge */}
              <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 mb-6">
                <span className="badge-brand px-4 py-1.5 text-xs font-bold uppercase tracking-widest shadow-sm">
                  <Sparkles size={11} /> India's #1 Platform for Women Founders
                </span>
              </motion.div>

              <motion.h1
                {...fadeUp(0.1)}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-text-primary mb-6"
              >
                Empowering Women to{' '}
                <span className="gradient-text block">Build the Future.</span>
              </motion.h1>

              <motion.p
                {...fadeUp(0.2)}
                className="text-lg text-gray-500 mb-10 max-w-lg leading-relaxed"
              >
                The all-in-one ecosystem for women founders to secure funding, find mentorship, and build meaningful networks — all powered by AI.
              </motion.p>

              <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4"
                >
                  Start Building <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate('/funding')}
                  className="btn-ghost flex items-center justify-center gap-2 text-base px-8 py-4"
                >
                  Explore Funding
                </button>
              </motion.div>

              {/* Trust line */}
              <motion.p {...fadeUp(0.4)} className="mt-8 text-xs text-gray-400 font-medium">
                ✦ Free to join · No credit card required · Built for Indian women entrepreneurs
              </motion.p>
            </div>

            {/* Right: Stats cards floating */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="card-glow p-6 flex flex-col gap-3"
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  style={{ animationDelay: `${i * 0.5}s` }}
                >
                  <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-purple-sm">
                    <stat.icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold gradient-text leading-none">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS ROW (Mobile) ───────────────────────────────────────────────── */}
      <section className="bg-gradient-surface border-y border-purple-100 py-8 lg:hidden">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-extrabold gradient-text">{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.04)_0%,_transparent_70%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="badge-brand mb-4 inline-flex">Everything you need</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-text-primary mb-4">
              Your Growth,{' '}
              <span className="gradient-text">All in One Place</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Three powerful pillars designed to take you from idea to funded, mentored, and connected.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="card-soft p-8 cursor-pointer group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                onClick={() => navigate(f.path)}
              >
                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-purple-sm group-hover:shadow-purple-glow transition-all duration-300`}>
                  <f.icon size={24} className="text-white" />
                </div>
                {/* Tag */}
                <span className="badge-brand text-[10px] mb-3 inline-flex">{f.tag}</span>
                <h3 className="text-xl font-bold mb-3 text-text-primary group-hover:gradient-text transition-all">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{f.desc}</p>
                {/* CTA */}
                <div className="flex items-center gap-2 text-brand-600 text-sm font-semibold group-hover:gap-3 transition-all duration-200">
                  Explore <ArrowRight size={15} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-surface">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-6">
              <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center mx-auto shadow-purple-glow animate-float">
                <Sparkles size={28} className="text-white" />
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-text-primary mb-4">
              Ready to{' '}
              <span className="gradient-text">Scale Your Dream?</span>
            </h2>
            <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of women entrepreneurs building India's future. Start free today.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2"
            >
              Join SHEscale Free <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
