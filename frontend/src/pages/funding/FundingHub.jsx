import React, { useState } from 'react';
import { Target, Calculator, FileCheck, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SchemeMatcher from './SchemeMatcher';
import DocWhisperer from './DocWhisperer';

const FundingHub = () => {
  return (
    <div className="flex h-full w-full bg-surface">
      <SchemeMatcher />
    </div>
  );
};

export default FundingHub;
