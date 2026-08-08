import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import GlobalNavbar from './components/layout/GlobalNavbar';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
// These pages don't exist yet but we will create them
import Home from './pages/Home';
import About from './pages/About';

import FundingHub from './pages/funding/FundingHub';
import MentorshipHub from './pages/mentorship/MentorshipHub';
import NetworkingHub from './pages/networking/NetworkingHub';
import ProfileLayout from './pages/profile/ProfileLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-bg-primary pt-16 flex flex-col">
          <GlobalNavbar />
          
          <main className="flex-1 flex flex-col relative w-full h-full">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/funding/*" element={<FundingHub />} />
                <Route path="/mentorship/*" element={<MentorshipHub />} />
                <Route path="/networking/*" element={<NetworkingHub />} />
                <Route path="/profile/*" element={<ProfileLayout />} />
              </Route>
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
