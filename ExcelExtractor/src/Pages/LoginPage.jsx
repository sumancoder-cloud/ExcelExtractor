import React, { useState } from "react";
import { FaUserAstronaut } from "react-icons/fa";
import { FaEyeSlash, FaEye } from "react-icons/fa6";
import { PiSignIn, PiUserPlus } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, signup } from '../api';
import { useGoogleLogin } from '@react-oauth/google';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LoginPage = () => {
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

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
        const response = await fetch(`${API_URL}/api/auth/google-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
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
          loginUser(data.user, data.token);
          alert(`${isSignup ? 'Account created and logged in' : 'Login'} successful with Google!`);
          navigate("/main");
        } else {
          setError(data.message || 'Google authentication failed');
        }
      } catch (error) {
        console.error('Google login error:', error);
        setError('Google login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed. Please try again.');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const response = isSignup ? await signup(formData) : await login(formData);
      
      if (response.data.success) {
        loginUser(response.data.user, response.data.token);
        alert(`${isSignup ? 'Account created' : 'Login'} successful!`);
        navigate("/main");
      }
    } catch (error) {
      console.error(`${isSignup ? 'Signup' : 'Login'} error:`, error);

      if (!error.response) {
        setError('❌ Backend server is not running. Please start the backend server first.');
      } else {
        setError(error.response?.data?.message || `${isSignup ? 'Signup' : 'Login'} failed. ${isSignup ? 'Email may already exist.' : 'Check your credentials.'}`);
      }
    } finally {
      setLoading(false);
    }
  }

  const[formData,setFormData]=useState({
    email:"",
    password:"",
    fullName: "",
    confirmPassword: ""
  });

  const [errors,setErrors]=useState({});

  const handleChange=(e)=>{
   
    setFormData({
      ...formData,
      [e.target.name]:e.target.value,
    });
  };

  const validate=()=>{
    let tempErrors={};
    
    if (isSignup && !formData.fullName.trim()) {
      tempErrors.fullName = "Full Name is required";
    }

    if(!formData.email){
      tempErrors.email="Email is required";
    }else if(!/\S+@\S+\.\S+/.test(formData.email)){
        tempErrors.email="Invalid email Format";
    }

    if(!formData.password){
      tempErrors.password="Password is Required"
    }else if(!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/.test(formData.password)){
      tempErrors.password="Atleast 1 Capital Letter,Number and min 6 characters required"
    }
    
    if (isSignup && formData.confirmPassword !== formData.password) {
      tempErrors.confirmPassword = "Passwords do not match";
    }
    
  setErrors(tempErrors);
  return Object.keys(tempErrors).length===0;
  }

 
  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-100">
      <div className={`relative w-[400px] bg-white shadow-orange-500 shadow-lg rounded-lg border-4 border-dashed border-orange-500 flex flex-col items-center pt-16 ${isSignup ? 'h-[850px]' : 'h-[600px]'}`}>

        <FaUserAstronaut className="text-7xl text-white bg-orange-400 rounded-full absolute -top-10 p-3" />

        <h1 className="text-3xl font-semibold text-orange-500 mb-6">
          {isSignup ? 'SIGN UP' : 'LOGIN'}
        </h1>

        {error && (
          <div className="w-full px-8 mb-4">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <form className="w-full px-8 space-y-5" onSubmit={handleSubmit}>
          {isSignup && (
            <div>
              <label htmlFor="fullName" className="text-orange-500 font-bold text-xl">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                className="w-full border-2 rounded-lg px-4 py-2 mt-2"
              />
              {
                errors.fullName &&(
                  <p className="text-red-500">{errors.fullName}</p>
                )
              }
            </div>
          )}

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
              autoComplete="email"
              className="w-full border-2 rounded-lg px-4 py-2 mt-2"
            />
            {
              errors.email &&(
                <p className="text-red-500">{errors.email}</p>
              )
            }
          </div>

          <div className="relative">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="text-orange-500 font-bold text-xl">
                Password
              </label>
              {!isSignup && (
                <Link to="/forgot-password" className="text-blue-500 font-semibold hover:underline text-sm">
                  Forgot Password?
                </Link>
              )}
            </div>
            <input
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              type={hidePassword ? "password" : "text"}
              autoComplete="current-password"
              className="w-full border-2 rounded-lg px-4 py-2 mt-2"
            />
            {
              errors.password&&(
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

          {isSignup && (
            <div className="relative">
              <label htmlFor="confirmPassword" className="text-orange-500 font-bold text-xl">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword || ''}
                onChange={handleChange}
                type={hideConfirmPassword ? "password" : "text"}
                autoComplete="new-password"
                className="w-full border-2 rounded-lg px-4 py-2 mt-2"
              />
              {
                errors.confirmPassword&&(
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
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center gap-3 w-full bg-orange-500 py-3 rounded-lg text-xl text-white hover:bg-orange-400 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (isSignup ? 'Creating Account...' : 'Logging in...') : (isSignup ? 'Sign Up' : 'Login')} {isSignup ? <PiUserPlus /> : <PiSignIn />}
          </button>
        </form>

        <p className="mt-4 text-center">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{" "}
          <button 
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
              setFormData({
                email: formData.email,
                password: '',
                confirmPassword: '',
                fullName: isSignup ? '' : formData.fullName
              });
              setErrors({});
            }}
            className="text-blue-500 font-semibold hover:underline"
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
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

export default LoginPage;
