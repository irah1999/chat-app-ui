import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from '../components/PrivateRoute';

// Lazy Load Components
const LoginPage = React.lazy(() => import('../pages/login/LoginPage'));
const DashboardPage = React.lazy(() => import('../pages/dashboard/Dashboard'));

const RegisterPage = React.lazy(() => import('../pages/login/RegisterPage'));

const HomePage = React.lazy(() => import('../pages/home/Home'));

const ContactPage = React.lazy(() => import('../pages/contact/Contact'));

const ChatPage = React.lazy(() => import('../pages/chat/Chat'));

const GroupchatPage = React.lazy(() => import('../pages/group-chat/groupChat'));


const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} />} />
          {/* <Route path="/home" element={<PrivateRoute element={<HomePage />} />} /> */}
          <Route path="/contact" element={<PrivateRoute element={<ContactPage />} />} />
          <Route path="/chat" element={<PrivateRoute element={<ChatPage />} />} />
          <Route path="/group-chat" element={<PrivateRoute element={<GroupchatPage />} />} />
        </Routes>
    </Suspense>
  );
};

export default AppRoutes;
