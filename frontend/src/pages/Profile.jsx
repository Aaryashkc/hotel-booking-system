import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    profilePicture: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setUserInfo(prev => ({
        ...prev,
        name: user.displayName || "Guest",
        email: user.email || "",
        profilePicture: user.photoURL || "",
        phone: localStorage.getItem('userPhone') || "",
        location: localStorage.getItem('userLocation') || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    // Load Cloudinary Upload Widget script
    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleImageUpload = useCallback(() => {
    if (!window.cloudinary) {
      console.error("Cloudinary widget is not loaded");
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        folder: 'hotel-trek-profiles',
        maxFileSize: 2000000, // 2MB
        maxImageWidth: 800,
        maxImageHeight: 800,
        imageMinWidth: 200,
        imageMinHeight: 200,
        cropping: true,
        croppingAspectRatio: 1,
        croppingShowDimensions: true,
        croppingValidateDimensions: true,
        sources: ["local", "camera"],
        multiple: false,
        defaultSource: "local",
        showAdvancedOptions: false,
        showUploadMoreButton: false,
        singleUploadAutoClose: true,
        resourceType: "image",
        acceptedFiles: "image/*",
        clientAllowedFormats: ["png", "jpg", "jpeg", "gif"],
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#90A0B3",
            tabIcon: "#0078FF",
            menuIcons: "#5A616A",
            textDark: "#000000",
            textLight: "#FFFFFF",
            link: "#0078FF",
            action: "#FF620C",
            inactiveTabIcon: "#0E2F5A",
            error: "#F44235",
            inProgress: "#0078FF",
            complete: "#20B832",
            sourceBg: "#E4EBF1"
          }
        }
      },
      async (error, result) => {
        if (error) {
          console.error("Upload error:", error);
          return;
        }

        if (result.event === "queues-start") {
          setUploadProgress(true);
        }

        if (result.event === "success") {
          try {
            const secureUrl = result.info.secure_url;
            const publicId = result.info.public_id;

            // First update Firebase Auth profile
            await updateUserProfile({
              displayName: userInfo.name,
              photoURL: secureUrl
            });

            // Then update local state to match Firebase
            const updatedUserInfo = {
              ...userInfo,
              profilePicture: secureUrl
            };
            setUserInfo(updatedUserInfo);

            // Save additional info to localStorage
            localStorage.setItem('userProfileData', JSON.stringify({
              publicId,
              photoURL: secureUrl,
              phone: userInfo.phone,
              location: userInfo.location,
              lastUpdated: new Date().toISOString()
            }));

          } catch (error) {
            console.error("Error updating profile with new image:", error);
          } finally {
            setUploadProgress(false);
          }
        }
      }
    );

    widget.open();
  }, [userInfo.name, updateUserProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setUploadProgress(true);
    try {
      // Update Firebase Auth profile
      await updateUserProfile({
        displayName: userInfo.name,
        photoURL: userInfo.profilePicture
      });
      
      // Save additional info to localStorage
      localStorage.setItem('userProfileData', JSON.stringify({
        photoURL: userInfo.profilePicture,
        phone: userInfo.phone,
        location: userInfo.location,
        lastUpdated: new Date().toISOString()
      }));

      // Save individual fields for easier access
      localStorage.setItem('userPhone', userInfo.phone);
      localStorage.setItem('userLocation', userInfo.location);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setUploadProgress(false);
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col items-center md:flex-row md:items-start md:space-x-8">
            {/* Profile Picture Section */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-white">
                {userInfo.profilePicture ? (
                  <img
                    src={userInfo.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-5xl text-white font-semibold">
                      {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : "G"}
                    </span>
                  </div>
                )}
              </div>
              
              {isEditing && (
                <button
                  onClick={handleImageUpload}
                  className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 cursor-pointer shadow-lg transform transition-transform duration-200 hover:scale-110"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              )}
            </div>

            <div className="mt-4 md:mt-0 text-center md:text-left flex-1">
              <h2 className="text-3xl font-bold text-gray-900">Welcome back, {userInfo.name}!</h2>
              <p className="text-gray-600 mt-1">Manage your profile information</p>
              
              {error && (
                <div className="mt-2 text-red-600 bg-red-50 px-4 py-2 rounded-md">
                  {error}
                </div>
              )}
              
              {/* Form Fields */}
              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={userInfo.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userInfo.email}
                    disabled={true}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={userInfo.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={userInfo.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              
              <button
                onClick={isEditing ? handleSave : handleEdit}
                disabled={uploadProgress}
                className={`mt-6 px-6 py-2 rounded-md text-white font-medium ${
                  isEditing
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
              >
                {uploadProgress ? (
                  <span>Saving...</span>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Edit Profile"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
