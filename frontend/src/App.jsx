import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Booking from "./pages/Booking";
import Profile from "./pages/Profile";
import OfflineMaps from "./pages/OfflineMaps";
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route 
                path="/booking" 
                element={
                  <UserProtectedRoute>
                    <Booking />
                  </UserProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <UserProtectedRoute>
                    <Profile />
                  </UserProtectedRoute>
                } 
              />
              <Route path="/offline-maps" element={<OfflineMaps />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
