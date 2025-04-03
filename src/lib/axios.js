import Axios from 'axios';
import { Navigate } from 'react-router-dom';
import { toast } from "react-toastify";

const token = localStorage?.getItem("jwt_token") ? localStorage.getItem("jwt_token") : null;
const axios = Axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        // 'Authorization' : `Bearer ${token}`
    },
    withCredentials: true,
    withXSRFToken: true,
})

const showError = (msg) => {
    toast.error(msg);
};

axios.interceptors.response.use(
    response => response, 
    error => {
        if (error.response) {
            // The request was made and the server responded with a status code
            if (error.response.status === 401) {
                showError(error.response.data.message);
            } else if (error.response.status === 422) {
                <Navigate to='/'/>
                showError(error.response.data.message);
            } else if (error.response.status === 403) {
            }else {
                showError('Internal Server Error. Please try again later');
            }
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Axios Error:', error.message);
        }
        return Promise.reject(error);
    }
);


// Set the Bearer auth token.
const setBearerToken = token => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export { axios, setBearerToken }
