import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const otp = searchParams.get('otp');
  const email = searchParams.get('email');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!otp || !email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid OTP</h2>
          <p className="text-gray-600 mb-6">The OTP is invalid or has expired. Please request a new one.</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            Request New OTP
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          otp,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Error resetting password. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ExcelExtractor</h1>
          <h2 className="text-xl font-semibold text-gray-600">Create New Password</h2>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-green-600 text-4xl mb-3">✓</div>
            <h3 className="text-lg font-semibold text-green-700 mb-2">Password Reset Successful!</h3>
            <p className="text-gray-600">
              Your password has been reset. Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">New Password</label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faLock} 
                  className="absolute left-4 top-4 text-gray-400"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faLock} 
                  className="absolute left-4 top-4 text-gray-400"
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
