import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Styles from './login.module.css';
import { axios } from '../../lib/axios';
import Toast from "../../components/Toast/toast";
import LoaderButton from "../../components/Loader/LoaderButton";


const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
      name : "",
      email: "",
      password: "",
      confirmation_password : ""
    });

      // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true); // Start loading
    axios.post('/auth/register', formData).then(res => {
      Toast.showSuccess(res.data.message);
      navigate("/login");
    })
    .catch(error => {
    })
    .finally(() => {
        setLoading(false); // Stop loading
    });
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };
  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Register Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-primary" name="name" id="name"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email id"
                className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                name="email" id="email"
                required
                onChange={handleChange}
              />
            </div>
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
                required
                onChange={handleChange}
              />
              <span className={`${Styles.cursor} absolute right-3 top-3 cursor-pointer text-gray-500`} onClick={handleTogglePassword}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="confirmation_password" className="block text-gray-700">Confirmation Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Enter your confirm password"
                className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                name="confirmation_password"
                id="confirmation_password"
                onChange={handleChange}
                required
              />
              <a href="#" className="absolute right-3 top-3 cursor-pointer text-gray-500" onClick={handleToggleConfirmPassword}>
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </a>
            </div>
          </div>

          <p className="text-end mb-4 text-gray-600">
            <sapn href="#" className={`${Styles.cursor} text-black font-medium`} onClick={() => { navigate('/login') }}><FontAwesomeIcon icon={faArrowLeft} /> Back to Login </sapn>
          </p>
          <LoaderButton 
                isLoading={loading} 
                text="Submit" 
                loadingText="Processing..."
          />
        </form>
        
      </div>
    </div>
  )
}

export default RegisterPage