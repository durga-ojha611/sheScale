import React, { useState } from 'react';
import { Shield, Key, Mail } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const SecuritySettings = () => {
  const { user, refreshUser } = useAuth();
  
  const [emailData, setEmailData] = useState({ email: user?.email || '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const [emailStatus, setEmailStatus] = useState({ loading: false, message: '', isError: false });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, message: '', isError: false });

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailStatus({ loading: true, message: '', isError: false });
    try {
      await api.put('/user/settings/email', emailData);
      await refreshUser();
      setEmailStatus({ loading: false, message: 'Email updated successfully', isError: false });
    } catch (err) {
      setEmailStatus({ 
        loading: false, 
        message: err.response?.data?.message || 'Failed to update email', 
        isError: true 
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ loading: false, message: 'New passwords do not match', isError: true });
      return;
    }

    setPasswordStatus({ loading: true, message: '', isError: false });
    try {
      await api.put('/user/settings/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordStatus({ loading: false, message: 'Password updated successfully', isError: false });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordStatus({ 
        loading: false, 
        message: err.response?.data?.message || 'Failed to update password', 
        isError: true 
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-brand-primary">Security Settings</h1>
        <p className="text-gray-600 mt-2">Manage your email and password.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm">
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Mail size={20} className="text-brand-primary" /> Update Email
        </h2>
        
        {emailStatus.message && (
          <div className={`p-4 rounded-lg mb-6 text-sm ${emailStatus.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {emailStatus.message}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={emailData.email}
              onChange={(e) => setEmailData({ email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              required
            />
          </div>
          <button
            type="submit"
            disabled={emailStatus.loading || emailData.email === user?.email}
            className="bg-brand-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-70"
          >
            {emailStatus.loading ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm">
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Key size={20} className="text-brand-primary" /> Change Password
        </h2>

        {passwordStatus.message && (
          <div className={`p-4 rounded-lg mb-6 text-sm ${passwordStatus.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {passwordStatus.message}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={passwordStatus.loading}
            className="bg-brand-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-70"
          >
            {passwordStatus.loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecuritySettings;
