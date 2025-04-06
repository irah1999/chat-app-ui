import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from '../components/PrivateRoute';

// Lazy Load Components
const LoginPage = React.lazy(() => import('../pages/login/LoginPage'));
const DashboardPage = React.lazy(() => import('../pages/dashboard/Dashboard'));

const RegisterPage = React.lazy(() => import('../pages/login/RegisterPage'));

// const HomePage = React.lazy(() => import('../pages/home/Home'));

const ContactPage = React.lazy(() => import('../pages/contact/Contact'));

const ChatPage = React.lazy(() => import('../pages/chat/Chat'));

const GroupchatPage = React.lazy(() => import('../pages/group-chat/groupChat'));

const LogoutPage = React.lazy(() => import('../pages/logout/Logout'));

const ProfilePage = React.lazy(() => import('../pages/profile/Profile'));

const GroupInfo = React.lazy(() => import('../pages/group-chat/GroupInfo'));

const GroupEdit = React.lazy(() => import('../pages/group-chat/EditGroup'));

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
          <Route path="/logout" element={<PrivateRoute element={<LogoutPage />} />} />

          <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />

          <Route path="/group-chat/info" element={<PrivateRoute element={<GroupInfo />} />} />
          <Route path="/group-chat/edit" element={<PrivateRoute element={<GroupEdit />} />} />
        </Routes>
    </Suspense>
  );
};

export default AppRoutes;
