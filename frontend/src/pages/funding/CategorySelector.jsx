import React from 'react';

const CATEGORIES = [
  { id: 'd2c',        label: 'D2C / E-Commerce',       icon: '🛍️' },
  { id: 'tech',       label: 'Tech / SaaS',             icon: '💻' },
  { id: 'agtech',     label: 'Agriculture / AgTech',    icon: '🌾' },
  { id: 'msme',       label: 'Handicrafts / MSME',      icon: '🎨' },
  { id: 'healthcare', label: 'Healthcare',              icon: '🩺' },
  { id: 'services',   label: 'Services',                icon: '⚙️' },
  { id: 'food',       label: 'Food & Beverage',         icon: '🍴' },
  { id: 'education',  label: 'Education / EdTech',      icon: '📚' },
  { id: 'manufacturing', label: 'Manufacturing',        icon: '🏭' },
  { id: 'fashion',    label: 'Fashion / Textile',       icon: '👗' },
];

const CategorySelector = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.label;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.label)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
              isSelected
                ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-[0_0_0_2px_rgba(124,58,237,0.15)]'
                : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'
            }`}
          >
            <span className="text-base leading-none">{cat.icon}</span>
            <span className="leading-tight text-left">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategorySelector;
