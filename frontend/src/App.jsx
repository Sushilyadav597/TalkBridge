import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import IncomingCallModal from './components/IncomingCallModal';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Friends from './pages/Friends';
import FriendRequests from './pages/FriendRequests';
import Chat from './pages/Chat';
import VideoCall from './pages/VideoCall';
import Profile from './pages/Profile';

import './App.css';
import './index.css';

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-container">
          <Outlet />
        </main>
      </div>

      {/* Global Incoming Call Alert */}
      <IncomingCallModal />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected App Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/friend-requests" element={<FriendRequests />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/video-call" element={<VideoCall />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;