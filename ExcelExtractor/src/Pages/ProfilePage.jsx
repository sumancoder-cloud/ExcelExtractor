import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faArrowLeft, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Profile form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  // Change password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setFullName(data.user.fullName);
        setEmail(data.user.email);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      setError('Error loading profile');
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ fullName, email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile');
      console.error('Update profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Error changing password');
      console.error('Change password error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <button
            onClick={() => navigate('/main')}
            className="flex items-center text-orange-600 hover:text-orange-700 font-medium transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-600 font-medium">{message}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 font-medium transition ${
                activeTab === 'profile'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-4 font-medium transition ${
                activeTab === 'password'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FontAwesomeIcon icon={faLock} className="mr-2" />
              Change Password
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faUser} 
                      className="absolute left-4 top-4 text-gray-400"
                    />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faEnvelope} 
                      className="absolute left-4 top-4 text-gray-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                      disabled={saving}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Current Password</label>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faLock} 
                      className="absolute left-4 top-4 text-gray-400"
                    />
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={showCurrent ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">New Password</label>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faLock} 
                      className="absolute left-4 top-4 text-gray-400"
                    />
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faLock} 
                      className="absolute left-4 top-4 text-gray-400"
                    />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
