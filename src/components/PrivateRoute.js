// components/PrivateRoute.js
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { removeLocalStorage, getLocalStorage } from "../utils/LocalStorage";
import { login } from '../redux/slices/authSlice';
import { axios, setBearerToken } from '../lib/axios';

function PrivateRoute({ element }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();
  const userData = getLocalStorage();
  const [loading, setLoading] = useState(true);
  const effectRan = useRef(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt_token") ? localStorage.getItem("jwt_token") : null;
  
  useEffect(() => {
    if (effectRan.current === false) {
      if (token) {
        setBearerToken(token);
        axios.post('/auth/verify-auth')
          .then((res) => {
            // dispatch(login(userData));
          })
          .catch(() => {
            navigate('/');
            removeLocalStorage();
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        removeLocalStorage();
        setLoading(false);
      }
    } else {
      // removeLocalStorage();
      setLoading(false);
    }
    return () => { effectRan.current = true }; // Prevents re-execution
  }, [dispatch, token]);

  if (loading) return <div>Loading...</div>;

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  
  return element;
}

export default PrivateRoute;
