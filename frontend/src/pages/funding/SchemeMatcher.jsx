import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  UploadCloud, FileText, FileEdit, CheckCircle2,
  ChevronLeft, ChevronRight, Download, Brain, AlertCircle, FilePlus, Target, Plus, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import CategorySelector from './CategorySelector';
import ApplicationDraft from './ApplicationDraft';

const SchemeMatcher = () => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [fileName, setFileName] = useState('');
  const [activeSchemeIdx, setActiveSchemeIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [inputType, setInputType] = useState('upload');
  
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [generatedApplication, setGeneratedApplication] = useState('');
  const [draftSchemeName, setDraftSchemeName] = useState('');
  const [generatedPnl, setGeneratedPnl] = useState(null);
  
  const fileInputRef = useRef(null);

  const matchMutation = useMutation({
    mutationFn: async (payload) => {
      const query = `Category: ${payload.category}. Description: ${payload.description}. Document: ${payload.fileName || 'None'}`;
      const { data } = await api.post('/schemes/scan', { query });
      return data.data;
    },
    onSuccess: () => setActiveSchemeIdx(0),
  });

  const generateMutation = useMutation({
    mutationFn: async ({ schemeId, schemeName }) => {
      const businessIdeaText = description?.trim()
        ? description
        : `Business Category: ${category}. Document uploaded: ${fileName || 'None'}.`;
      const [appRes, pnlRes] = await Promise.all([
        api.post('/schemes/generate-application', { schemeId, businessIdeaText }),
        api.post('/pnl/generate-pnl', { businessIdea: businessIdeaText, category }),
      ]);
      return { application: appRes.data, pnl: pnlRes.data, schemeName };
    },
    onSuccess: (data) => {
      setGeneratedApplication(data.application.data.text);
      setGeneratedPnl(data.pnl.data);
      setDraftSchemeName(data.schemeName);
      setDraftModalOpen(true);
    },
    onError: (err) => console.error('Generate failed:', err),
  });

  const isFormValid = Boolean(category) && (Boolean(description.trim()) || Boolean(fileName));

  const handleSearch = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    matchMutation.mutate({ category, fileName, description });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFileName(file.name);
  };

  const hasResults = matchMutation.isSuccess && matchMutation.data?.length > 0;
  const activeScheme = hasResults ? matchMutation.data[activeSchemeIdx] : null;
  const activeSchemeId = activeScheme?.schemeId || activeScheme?._id || null;

  // Score Helpers
  const scoreVal = activeScheme?.matchScore || 0;
  const scoreColorClass = scoreVal >= 80 ? 'text-brand-600' : scoreVal >= 60 ? 'text-amber-500' : 'text-red-500';
  const scoreBorderClass = scoreVal >= 80 ? 'border-brand-500' : scoreVal >= 60 ? 'border-amber-400' : 'border-red-400';
  const scoreHex = scoreVal >= 80 ? '#7c3aed' : scoreVal >= 60 ? '#f59e0b' : '#ef4444'; // Purple for high score

  const attrs = [
    { label: 'Eligibility', val: scoreVal > 80 ? 95 : 72, color: 'bg-brand-500' },
    { label: 'Financial Fit', val: scoreVal > 80 ? 90 : 62, color: 'bg-brand-400' },
    { label: 'Sector Alignment', val: scoreVal > 80 ? 98 : 80, color: 'bg-brand-300' },
    { label: 'Documentation', val: 55, color: 'bg-brand-200' },
  ];

  const radarData = attrs.map(attr => ({
    subject: attr.label,
    A: attr.val,
    fullMark: 100,
  }));

  // --- Input View Layout ---
  if (!hasResults) {
    return (
      <div className="flex h-[calc(100vh-64px)] overflow-hidden w-full bg-white relative">
        
        {/* Scanning Modal exactly like screenshot */}
        <AnimatePresence>
          {matchMutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-8 max-w-[420px] w-full mx-4 shadow-2xl flex flex-col items-center text-center relative"
              >
                <div className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer">
                  {/* Close icon placeholder if needed */}
                </div>
                <div className="w-16 h-16 bg-brand-50 rounded-lg flex items-center justify-center mb-6">
                  <FileText size={32} className="text-brand-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Taking a closer look at your profile...</h2>
                
                <div className="w-full relative mb-3">
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 15, ease: 'easeOut' }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">This usually takes 1–2 minutes.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Width Form */}
        <div className="w-full p-8 lg:p-12 xl:p-16 overflow-y-auto bg-gradient-surface relative">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-300/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-4xl mx-auto pt-6 relative z-10">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-700 to-purple-600 leading-[1.15] mb-6 tracking-tight">
                Secure Your Funding Chances <br className="hidden md:block"/>With a Tailored AI Match
              </h1>
              <p className="text-gray-500 text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
                Turn applications into approved grants with personalized suggestions, eligibility scoring and auto-drafted proposals.
              </p>
            </div>

            <form onSubmit={handleSearch} className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl shadow-brand-500/5 rounded-[2rem] p-8 lg:p-12 flex flex-col gap-10">
              {/* Step 1 */}
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-100 to-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 font-black shadow-sm shadow-brand-500/20">1</div>
                  <h3 className="text-xl font-bold text-gray-800">Upload Your Business Deck<span className="text-red-500 ml-1">*</span></h3>
                </div>

                <div className="flex bg-gray-100/80 p-1.5 rounded-xl w-fit mb-6">
                  <button
                    type="button"
                    onClick={() => setInputType('upload')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      inputType === 'upload'
                        ? 'bg-white text-brand-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                  >
                    <UploadCloud size={18} /> Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputType('text')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      inputType === 'text'
                        ? 'bg-white text-brand-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                  >
                    <FileText size={18} /> Paste Text
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {inputType === 'upload' ? (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) setFileName(f.name); }}
                      className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/50 backdrop-blur-sm group ${
                        isDragging ? 'border-brand-500 bg-brand-50 scale-[1.02] shadow-xl shadow-brand-500/10' : fileName ? 'border-brand-400 bg-brand-50/60 shadow-lg shadow-brand-500/5' : 'border-gray-300 hover:border-brand-400 hover:bg-brand-50/30'
                      }`}
                    >
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                      {fileName ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30">
                            <CheckCircle2 size={28} />
                          </div>
                          <span className="font-bold text-gray-900 text-lg">{fileName}</span>
                          <span className="text-brand-600 text-sm font-semibold hover:underline">Click to change file</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                            <UploadCloud size={28} />
                          </div>
                          <span className="font-extrabold text-gray-900 text-lg">Click to upload or drag and drop</span>
                          <span className="text-gray-500 text-sm">Supported formats: PDF, DOC, DOCX</span>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.textarea
                      key="text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      rows={6}
                      className="w-full rounded-xl border border-gray-300 p-4 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none text-sm text-gray-800 bg-white"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Paste the full business description here. The more details you provide, the better we can check your fit."
                    />
                  )}
                </AnimatePresence>

                <div className="mt-3 space-y-1">
                  <p className="text-xs text-gray-500 flex items-center gap-1"><AlertCircle size={12}/> Supported formats: .pdf, .doc, .docx. Max size: 5 MB.</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><AlertCircle size={12}/> All languages supported.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-100 to-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 font-black shadow-sm shadow-brand-500/20">2</div>
                    <h3 className="text-xl font-bold text-gray-800">Select Your Business Category<span className="text-red-500 ml-1">*</span></h3>
                  </div>
                </div>
                <CategorySelector selectedCategory={category} onSelectCategory={setCategory} />
              </div>

              <div className="pt-8 flex justify-center border-t border-gray-100">
                <button
                  type="submit"
                  disabled={!isFormValid || matchMutation.isPending}
                  className="bg-gradient-to-r from-brand-600 to-purple-600 text-white px-12 py-4 rounded-xl font-extrabold text-lg w-full md:w-auto hover:from-brand-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-xl shadow-brand-500/30 hover:shadow-brand-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-3"
                >
                  <Sparkles size={20} />
                  Start AI Scan
                </button>
              </div>
            </form>
          </div>
        </div>
        {/* End of Full Width Form */}
      </div>
    );
  }

  // --- Results View Layout ---
  return (
    <div className="flex h-[calc(100vh-64px)] mt-16 w-full bg-white flex-col overflow-hidden">
      
      {/* Main Content Split */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar: Scores & Progress */}
        <div className="w-full md:w-[320px] shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 leading-tight mb-6 pr-4">{activeScheme?.schemeName}</h2>
            
            {/* Big Score Donut */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative w-[100px] h-[100px] flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                  <circle
                    cx="50" cy="50" r="44"
                    stroke={scoreHex}
                    strokeWidth="8" fill="none"
                    strokeLinecap="round"
                    strokeDasharray="276.4"
                    strokeDashoffset={276.4 - (276.4 * scoreVal) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold tracking-tighter ${scoreColorClass}`}>{scoreVal}</span>
                </div>
              </div>
              <div>
                <p className={`font-bold text-lg ${scoreColorClass}`}>14 suggestions</p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">Applications with a score of 75 or higher are more likely to pass.</p>
              </div>
            </div>

            {/* Category Progress Bars */}
            <div className="space-y-6">
              {attrs.map(attr => (
                <div key={attr.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-gray-800">{attr.label}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wide">4 suggestions</p>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex">
                    <motion.div
                      className={`h-full ${attr.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${attr.val}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Area: Radar & Details */}
        <div className="flex-1 bg-[#F8F9FA] overflow-y-auto relative">
          
          <div className="max-w-4xl mx-auto p-6 md:p-8 flex flex-col gap-6 pb-24">
            
            {/* Overview Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-1">
                   <h3 className="text-xl font-bold text-gray-900">Overview</h3>
                   <button 
                     onClick={() => generateMutation.mutate({ schemeId: activeSchemeId, schemeName: activeScheme?.schemeName })}
                     disabled={generateMutation.isPending}
                     className="bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-700 transition-colors disabled:opacity-50 shadow-sm shadow-brand-500/20"
                   >
                     {generateMutation.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileEdit size={16}/>} 
                     Generate App & P&L
                   </button>
                </div>
                <p className="text-sm font-semibold mb-3">Match Score: <span className={scoreColorClass}>{scoreVal}</span></p>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {activeScheme?.aiRationale || `Your profile shows strong alignment with ${category} requirements, leadership, and project impact, aligning well with the ${activeScheme?.schemeName} criteria. Enhancing financial projections and compliance documentation will boost alignment.`}
                </p>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                  {/* Radar Chart */}
                  <div className="w-full md:w-1/2 h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Profile"
                          dataKey="A"
                          stroke={scoreHex}
                          fill={scoreHex}
                          fillOpacity={0.15}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Highlights & Improvements */}
                  <div className="w-full md:w-1/2 flex flex-col gap-4">
                    {/* Highlights */}
                    <div className="bg-[#F0FDF4] p-4 rounded-lg border border-green-100">
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Highlights</h4>
                      <ul className="space-y-2">
                        {['Strong alignment with women entrepreneurship focus', `Solid proficiency in ${category} sector metrics`, 'Matches regional funding mandates'].map((item, i) => (
                          <li key={i} className="flex gap-2 text-xs text-gray-700 leading-tight">
                            <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Improvements */}
                    <div className="bg-[#FFFBEB] p-4 rounded-lg border border-amber-100">
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Improvements</h4>
                      <ul className="space-y-2">
                        {['Detail exact financial metrics to meet grant requirements', 'Highlight previous execution experience', 'Explicitly state projected job creation figures'].map((item, i) => (
                          <li key={i} className="flex gap-2 text-xs text-gray-700 leading-tight">
                            <AlertCircle size={14} className="text-amber-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Content Section (Dummy content to match screenshot vibe) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between cursor-pointer">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                     <FileText size={16} />
                   </div>
                   <h3 className="text-lg font-bold text-gray-900">Content</h3>
                 </div>
                 <ChevronRight size={20} className="text-gray-400" />
              </div>
              <div className="p-6 bg-gray-50/50">
                 <p className="text-sm text-gray-600 mb-6">
                   This section ensures your application includes measurable results and is free from critical omissions. This helps your proposal make a stronger impact and stand out to evaluators.
                 </p>
                 <div className="bg-[#E0F2FE] p-6 rounded-xl border border-blue-100 flex flex-col md:flex-row gap-6 items-center">
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900 mb-1">Almost there! Let's refine your content</h4>
                     <p className="text-sm text-gray-600">to make it more impactful and complete.</p>
                   </div>
                   <div className="flex gap-4">
                     <div className="bg-white py-3 px-6 rounded-lg text-center shadow-sm">
                       <span className="block text-xs font-bold text-gray-500 uppercase">Measurable Results</span>
                       <span className="text-xl font-bold text-amber-500">3</span>
                     </div>
                     <div className="bg-white py-3 px-6 rounded-lg text-center shadow-sm">
                       <span className="block text-xs font-bold text-gray-500 uppercase">Missing Docs</span>
                       <span className="text-xl font-bold text-amber-500">5</span>
                     </div>
                   </div>
                 </div>
              </div>
            </div>

          </div>
          
          {/* Bottom Floating Action Bar for pagination */}
          {matchMutation.data.length > 1 && (
            <div className="fixed bottom-0 right-0 left-0 md:left-[320px] bg-white border-t border-gray-200 p-4 flex justify-between items-center z-10">
              <button 
                onClick={() => setActiveSchemeIdx(prev => prev - 1)}
                disabled={activeSchemeIdx === 0}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-colors"
              >
                Previous Match
              </button>
              <div className="flex gap-1.5 items-center">
                <span className="text-xs font-bold text-gray-400 mr-2">Match {activeSchemeIdx + 1} of {matchMutation.data.length}</span>
                {matchMutation.data.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSchemeIdx(i)}
                    className={`h-2 rounded-full transition-all duration-200 ${i === activeSchemeIdx ? 'bg-brand-500 w-6' : 'bg-gray-200 hover:bg-gray-300 w-2'}`}
                  />
                ))}
              </div>
              <button 
                onClick={() => setActiveSchemeIdx(prev => prev + 1)}
                disabled={activeSchemeIdx === matchMutation.data.length - 1}
                className="px-4 py-2 bg-brand-50 border border-brand-100 rounded-lg text-sm font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-30 disabled:hover:bg-brand-50 transition-colors"
              >
                Next Match
              </button>
            </div>
          )}

        </div>
      </div>

      <ApplicationDraft 
        isOpen={draftModalOpen}
        onClose={() => setDraftModalOpen(false)}
        applicationText={generatedApplication}
        schemeName={draftSchemeName}
        pnlData={generatedPnl}
        isGenerating={generateMutation.isPending}
      />
    </div>
  );
};

export default SchemeMatcher;
