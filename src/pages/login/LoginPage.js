// pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Styles from './login.module.css';
import { axios, setBearerToken } from '../../lib/axios';
import Toast from "../../components/Toast/toast";
import LoaderButton from "../../components/Loader/LoaderButton";
import { setLocalStorage, removeLocalStorage } from "../../utils/LocalStorage";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage?.getItem("jwt_token") ? localStorage.getItem("jwt_token") : null;

  useEffect(() => {
    if (token) {
      navigate("/contact");
    } else {
      removeLocalStorage();
    }
  }, [token]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleRegisterCall = () => {
    navigate("/register");
  }

   // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true); // Start loading
    axios.post('/auth/login', formData).then(res => {
      console.log("res.data.user => ", res.data.user);
      Toast.showSuccess(res.data.message);
      dispatch(login(res.data.user));
      setBearerToken(res.data.data.access_token);
      setLocalStorage(res.data.data.access_token, res.data.user);
      navigate("/contact");
    })
    .catch(error => {
      if (error.response) {
        const statusCode = error.response.status;
        const message = error.response.data?.message || "Something went wrong";
  
        if (statusCode === 401) {
          Toast.showError("Invalid credentials");
        } else {
          Toast.showError(`Error ${statusCode}: ${message}`);
        }
      } else {
        Toast.showError("Network error or server not reachable");
      }
    })
    .finally(() => {
        setLoading(false); // Stop loading
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
              name="email"
              id="email"
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                name="password"
                id="password"
                onChange={handleChange}
              />
              <a href="#" className="absolute right-3 top-3 cursor-pointer text-gray-500" onClick={handleTogglePassword}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </a>
            </div>
          </div>
          <div className="flex items-center mb-4">
            <input type="checkbox" className="mr-2 text-primary" />
            <label className="text-gray-700">Remember Me</label>
          </div>
          <LoaderButton 
                isLoading={loading} 
                text="Submit" 
                loadingText="Processing..."
          />
        </form>
        <p className="text-center mt-4 text-gray-600">
          Already have an account? <sapn href="#" className={`${Styles.cursor} text-black font-medium`} onClick={handleRegisterCall}>Signup</sapn>
        </p>
        <div className="flex items-center my-4">
          <div className="flex-1 border-b border-gray-300"></div>
          <span className="px-2 text-gray-500">Or</span>
          <div className="flex-1 border-b border-gray-300"></div>
        </div>
        <button className="w-full border border-gray-300 py-2 rounded flex items-center justify-center hover:bg-gray-100">
          <img
            src="./images/google-image.png"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Signup with Google
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
