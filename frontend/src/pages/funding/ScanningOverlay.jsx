import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';
import './Funding.css';

const steps = [
  { id: 1, label: 'Reading Business Pitch & Profile', minProgress: 0, maxProgress: 25 },
  { id: 2, label: 'Scanning Sector-Specific Criteria', minProgress: 25, maxProgress: 50 },
  { id: 3, label: 'Calculating Dynamic Match Score', minProgress: 50, maxProgress: 75 },
  { id: 4, label: 'Retrieving Live Government Databases', minProgress: 75, maxProgress: 90 },
  { id: 5, label: 'Compiling Rationale & Auto-Draft Blueprint', minProgress: 90, maxProgress: 100 }
];

const ScanningOverlay = ({ isScanning }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (isScanning) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 98) return prev; // Hold at 98% until complete
          return prev + 2;
        });
      }, 300);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  if (!isScanning && progress === 100) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-purple-100 flex flex-col items-center"
      >
        {/* Loading Spinner / Icon */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center bg-purple-50 rounded-full">
          <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">AI Match Analysis in Progress</h2>
        <p className="text-gray-500 text-sm mb-8 text-center">We are processing your pitch deck and calculating government scheme eligibility.</p>

        {/* Global Progress Bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-8 relative">
          <motion.div 
            className="h-full bg-brand-primary rounded-full" 
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Timeline Steps */}
        <div className="w-full space-y-4">
          {steps.map((step) => {
            const isCompleted = progress > step.maxProgress;
            const isActive = progress >= step.minProgress && progress <= step.maxProgress;
            
            return (
              <div 
                key={step.id} 
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 ${
                  isActive 
                    ? 'border-purple-200 bg-purple-50/50 shadow-sm' 
                    : isCompleted 
                      ? 'border-green-100 bg-green-50/20' 
                      : 'border-transparent opacity-50'
                }`}
              >
                <div>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${
                    isActive 
                      ? 'text-brand-primary' 
                      : isCompleted 
                        ? 'text-green-700' 
                        : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default ScanningOverlay;
