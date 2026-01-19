import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: OTP verification
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('OTP sent to your email! Please check your inbox.');
        setStep(2); // Move to OTP verification step
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Error sending OTP. Please try again later.');
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('OTP verified! Redirecting to password reset...');
        setSubmitted(true);
        // Redirect to reset password page with email
        setTimeout(() => {
          navigate(`/reset-password?email=${email}&otp=${otp}`);
        }, 2000);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Error verifying OTP. Please try again.');
      console.error('OTP verification error:', err);
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
          <h2 className="text-xl font-semibold text-gray-600">
            {step === 1 ? 'Reset Your Password' : 'Enter OTP'}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Step {step} of 2
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-green-600 text-4xl mb-3">✓</div>
            <h3 className="text-lg font-semibold text-green-700 mb-2">OTP Verified!</h3>
            <p className="text-gray-600 mb-4">
              Your OTP has been verified successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to password reset page...
            </p>
          </div>
        ) : (
          <form onSubmit={step === 1 ? handleEmailSubmit : handleOtpSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Message */}
            {message && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-600 text-sm font-medium">{message}</p>
              </div>
            )}

            {step === 1 ? (
              <>
                {/* Email Input */}
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
                      disabled={loading}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Enter the email address associated with your account
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                {/* OTP Input */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-3 text-center text-2xl border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition tracking-widest font-mono"
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Enter the 6-digit OTP sent to <strong>{email}</strong>
                  </p>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                {/* Back to Email Step */}
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError('');
                    setMessage('');
                  }}
                  className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 px-4 border border-gray-300 rounded-lg transition"
                >
                  Back to Email
                </button>
              </>
            )}

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
