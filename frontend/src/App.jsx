import React from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import About from './pages/About';
import Team from './pages/Team';
import PlayerProfile from './pages/PlayerProfile';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import Gallery from './pages/Gallery';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Registration from './pages/Registration';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ManagePlayers from './pages/admin/ManagePlayers';
import ManageMatches from './pages/admin/ManageMatches';
import LiveScoring from './pages/admin/LiveScoring';
import ManageGallery from './pages/admin/ManageGallery';
import ManageNews from './pages/admin/ManageNews';
import ManageRegistrations from './pages/admin/ManageRegistrations';
import ManageContacts from './pages/admin/ManageContacts';
import ManageUsers from './pages/admin/ManageUsers';

function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
        <Route path="/team/:id" element={<PlayerProfile />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/matches/:id" element={<MatchDetail />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route element={<AdminRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="players" element={<ManagePlayers />} />
          <Route path="matches" element={<ManageMatches />} />
          <Route path="matches/:id/live-scoring" element={<LiveScoring />} />
          <Route path="gallery" element={<ManageGallery />} />
          <Route path="news" element={<ManageNews />} />
          <Route path="registrations" element={<ManageRegistrations />} />
          <Route path="contacts" element={<ManageContacts />} />
          <Route path="users" element={<ManageUsers />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
