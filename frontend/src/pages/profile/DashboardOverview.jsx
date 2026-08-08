import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle2, Target, Edit3 } from 'lucide-react';
import api from '../../services/api';

const DashboardOverview = () => {
  const { user, refreshUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    businessIdea: user?.businessDetails?.businessIdea || '',
    category: user?.businessDetails?.category || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const completedSteps = user?.checklistProgress?.completedSteps || 0;
  const totalSteps = user?.checklistProgress?.totalSteps || 4;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100) || 0;

  const score = user?.mentorshipHub?.readinessScore || 0;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      await api.put('/user/details', formData);
      await refreshUser();
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-brand-primary">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name?.split(' ')[0] || 'Founder'}. Here's your progress.</p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Onboarding Checklist Progress */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-brand-primary" /> 
                Funding Checklist
              </h3>
              <span className="text-sm font-medium text-brand-primary bg-purple-50 px-3 py-1 rounded-full">
                {completedSteps} / {totalSteps} Done
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div 
                className="bg-brand-primary h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Complete the checklist in the Funding Hub to ensure your application is bank-ready.
            </p>
          </div>
        </div>

        {/* Readiness Score */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Target size={20} className="text-brand-primary" /> 
                Readiness Score
              </h3>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${score >= 80 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {score} / 100
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {score >= 80 
                ? "You've unlocked expert mentorship! Book a session in the Mentorship Hub."
                : "Practice your pitch in the Mentorship Hub to increase your score and unlock human mentors."}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-gray-900">Personal Details</h2>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-brand-primary hover:text-brand-primary/80 flex items-center gap-2 text-sm font-medium"
            >
              <Edit3 size={16} /> Edit
            </button>
          )}
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Idea / Description</label>
              <textarea
                name="businessIdea"
                value={formData.businessIdea}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category / Domain</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-brand-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user?.name || '',
                    businessIdea: user?.businessDetails?.businessIdea || '',
                    category: user?.businessDetails?.category || '',
                  });
                  setMessage('');
                }}
                className="bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                <p className="text-gray-900 font-medium">{user?.name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                <p className="text-gray-900 font-medium">{user?.email}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500 mb-1">Business Idea / Description</p>
                <p className="text-gray-900">{user?.businessDetails?.businessIdea || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Category / Domain</p>
                <p className="text-gray-900 font-medium">{user?.businessDetails?.category || 'Not provided'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
