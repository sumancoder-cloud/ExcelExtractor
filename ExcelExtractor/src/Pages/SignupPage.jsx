import React, { useState } from "react";
import { FaUserAstronaut } from "react-icons/fa";
import { FaEyeSlash, FaEye } from "react-icons/fa6";
import { PiUserPlus } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import { signup } from '../api';
import { useGoogleLogin } from '@react-oauth/google';

const SignupPage = () => {
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Google OAuth login
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setError('');
        setLoading(true);
        
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        const userInfo = await userInfoResponse.json();
        
        // Send to backend for authentication
        const response = await fetch('http://localhost:5000/api/auth/google-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            googleId: userInfo.id,
            email: userInfo.email,
            fullName: userInfo.name,
            picture: userInfo.picture,
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          alert('Account created and logged in successfully with Google!');
          navigate("/main");
        } else {
          setError(data.message || 'Google signup failed');
        }
      } catch (error) {
        console.error('Google signup error:', error);
        setError('Google signup failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google signup failed. Please try again.');
    },
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...signupData } = formData;
      const response = await signup(signupData);
      
      if (response.data.success) {
        alert('Account created successfully! Please login.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);

      if (!error.response) {
        setError('❌ Backend server is not running. Please start the backend server first.');
      } else {
        setError(error.response?.data?.message || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    let textErrors = {}
    if (!formData.fullName) {
      textErrors.fullName = "Fullname is Required"
    } else if (!/^[A-Za-z0-9 ]+$/.test(formData.fullName)) {
      textErrors.fullName = "Invalid Format"
    }

    if (!formData.email) {
      textErrors.email = "Email is Required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      textErrors.email = "Invalid Email Format"
    }

    if (!formData.password) {
      textErrors.password = "Password is Required"
    } else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/.test(formData.password)) {
      textErrors.password = "Atleast 1 Capital Letter, Number and min 6 characters required"
    }

    if (!formData.confirmPassword) {
      textErrors.confirmPassword = "You have to fill this Field also"
    } else if (formData.password !== formData.confirmPassword) {
      textErrors.confirmPassword = "Both Passwords Must and should Match"
    }
    setErrors(textErrors);
    return Object.keys(textErrors).length === 0;
  }
  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-100">
      <div className="relative w-[400px] bg-white h-[1050px] shadow-orange-500 shadow-lg rounded-lg border-4 border-dashed border-orange-500 flex flex-col items-center pt-16">

        <FaUserAstronaut className="text-7xl text-white bg-orange-400 rounded-full absolute -top-10 p-3" />

        <h1 className="text-3xl font-semibold text-orange-500 mb-6">
          SIGN UP
        </h1>

        {error && (
          <div className="w-full px-8 mb-4">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <form className="w-full px-8 space-y-4" onSubmit={handleSubmit}>

          <div>
            <label htmlFor="name" className="text-orange-500 font-bold text-xl">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.fullName}
              name="fullName"
              onChange={handleChange}
              placeholder="Your name"
              className="w-full border-2 rounded-lg px-4 py-2 mt-2"
            />
            {
              errors.fullName && (
                <p className="text-red-400">{errors.fullName}</p>
              )
            }
          </div>

          <div>
            <label htmlFor="email" className="text-orange-500 font-bold text-xl">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className="w-full border-2 rounded-lg px-4 py-2 mt-2"
              required
            />
            {
              errors.email &&(
                <p className="text-red-400">{errors.email}</p>
              )
            }
          </div>

          <div className="relative">
            <label htmlFor="password" className="text-orange-500 font-bold text-xl">
              Password
            </label>
            <input
              id="password"
              value={formData.password}
              name="password"
              onChange={handleChange}
              type={hidePassword ? "password" : "text"}
              className="w-full border-2 rounded-lg px-4 py-2 mt-2"
            />
            {
              errors.password && (
                <p className="text-red-400">{errors.password}</p>
              )
            }
            <button
              type="button"
              onClick={() => setHidePassword(!hidePassword)}
              className="absolute right-4 top-15 -translate-y-1/2 text-xl cursor-pointer"
            >
              {hidePassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="text-orange-500 font-bold text-xl">
              Confirm Password
           </label >
            <input

              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              name="confirmPassword"
              type={hideConfirmPassword ? "password" : "text"}
              className="w-full border-2 rounded-lg px-4 py-2 mt-2"
            />
            {
              errors.confirmPassword &&
              (
                <p className="text-red-400">{errors.confirmPassword}</p>
              )
            }
            <button
              type="button"
              onClick={() => setHideConfirmPassword(!hideConfirmPassword)}
              className="absolute right-4 top-15 -translate-y-1/2 text-xl cursor-pointer"
            >
              {hideConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
             
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center gap-3 w-full bg-orange-500 py-3 rounded-lg text-xl text-white hover:bg-orange-400 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Sign Up'} <PiUserPlus />
          </button>
        </form>

        <p className="mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 font-semibold cursor-pointer ">
            Login
          </a>
        </p>

        <button
          type="button"
          onClick={() => googleLogin()}
          disabled={loading}
          className="flex items-center justify-center gap-3 border-2 w-[85%] py-2 rounded-lg mt-4 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          <FcGoogle className="text-2xl" />
          <span className="font-semibold">Continue with Google</span>
        </button>

      </div>
    </div>
  );
};

export default SignupPage;
