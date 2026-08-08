import React from 'react';
import { motion } from 'framer-motion';
import { Target, Calculator, FileCheck, Trophy } from 'lucide-react';

const About = () => {
  return (
    <div className="w-full flex flex-col bg-bg-primary">
      {/* Hero Section */}
      <section className="bg-dark-section text-white py-24 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6 font-serif"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Empowering Women Founders. <br />
            <span className="text-accent">Engineering Financial Success.</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-purple-100 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            We are an AI-driven ecosystem designed exclusively for women entrepreneurs to navigate the complex world of fundraising, scaling, and growth.
          </motion.p>
        </div>
      </section>

      {/* The Ecosystem Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-brand-primary mb-4 font-serif">The SHEscale Ecosystem</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform offers a comprehensive suite of tools to take your business from idea to funded and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 bg-purple-50 text-brand-primary rounded-xl flex items-center justify-center mb-6">
                <Target size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3 font-serif text-brand-primary">Intelligent Scheme Matcher</h3>
              <p className="text-gray-600">
                Stop guessing which government grants you qualify for. Our AI analyzes your business profile against hundreds of active schemes (Mudra, CGTMSE) and gives you a clear path to apply.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 bg-purple-50 text-brand-primary rounded-xl flex items-center justify-center mb-6">
                <Calculator size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3 font-serif text-brand-primary">BizCalculus</h3>
              <p className="text-gray-600">
                Turn your raw ideas into bankable financial projections. Generate automated P&L statements, revenue forecasts, and unit economics that investors actually want to see.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 bg-purple-50 text-brand-primary rounded-xl flex items-center justify-center mb-6">
                <FileCheck size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3 font-serif text-brand-primary">Doc Whisperer</h3>
              <p className="text-gray-600">
                An AI-powered document verification system that pre-checks your identity and business incorporation documents before you submit them to a bank, preventing easy rejections.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 bg-purple-50 text-brand-primary rounded-xl flex items-center justify-center mb-6">
                <Trophy size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3 font-serif text-brand-primary">Gamified Mentorship Hub</h3>
              <p className="text-gray-600">
                Practice your pitch with our strict AI VC persona. Score above 80 on the Readiness Matrix to unlock exclusive 1-on-1 booking slots with top human mentors and industry leaders.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-dark-section py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-10 font-serif">Powered by Modern Tech</h2>
          
          <div className="glass-panel-dark p-10 rounded-3xl">
            <div className="flex flex-wrap justify-center gap-6">
              {['React', 'Tailwind CSS', 'Framer Motion', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'FAISS'].map((tech) => (
                <div key={tech} className="px-6 py-3 bg-white/10 rounded-full text-purple-100 font-medium backdrop-blur-md border border-white/10">
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
