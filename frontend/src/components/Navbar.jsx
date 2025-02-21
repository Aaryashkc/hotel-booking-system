import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginModal from "./auth/LoginModal";
import SignupModal from "./auth/SignupModal";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-3xl font-extrabold">Hotel Trek Advisor</Link>
        <div className="hidden md:flex space-x-6">
          <Link to="/search" className="text-white text-lg font-medium hover:text-gray-300 transition duration-300">Search Hotels</Link>
          <Link to="/offline-maps" className="text-white text-lg font-medium hover:text-gray-300 transition duration-300">Offline Maps</Link>
          {user ? (
            <>
              <Link to="/profile" className="text-white text-lg font-medium hover:text-gray-300 transition duration-300">Profile</Link>
              <button
                onClick={handleLogout}
                className="text-white text-lg font-medium hover:text-gray-300 transition duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-white text-lg font-medium hover:text-gray-300 transition duration-300"
              >
                Login
              </button>
              <button
                onClick={() => setShowSignupModal(true)}
                className="text-white text-lg font-medium hover:text-gray-300 transition duration-300"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-4">
          <Link to="/search" className="block text-white text-lg hover:text-gray-300">Search Hotels</Link>
          <Link to="/offline-maps" className="block text-white text-lg hover:text-gray-300">Offline Maps</Link>
          {user ? (
            <>
              <Link to="/profile" className="block text-white text-lg hover:text-gray-300">Profile</Link>
              <button
                onClick={handleLogout}
                className="block text-white text-lg hover:text-gray-300 w-full text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowLoginModal(true)}
                className="block text-white text-lg hover:text-gray-300 w-full text-left"
              >
                Login
              </button>
              <button
                onClick={() => setShowSignupModal(true)}
                className="block text-white text-lg hover:text-gray-300 w-full text-left"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      )}

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSwitchToSignup={switchToSignup}
      />
      <SignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)} 
        onSwitchToLogin={switchToLogin}
      />
    </nav>
  );
};

export default Navbar;
