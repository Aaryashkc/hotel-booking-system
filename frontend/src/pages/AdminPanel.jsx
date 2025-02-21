import { useState, useEffect } from 'react';
import axios from 'axios';
import BookingManager from '../components/BookingManager';
import MapUpload from '../components/admin/MapUpload';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('hotels');
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchImages();
    fetchCurrentUser();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get('/api/admin/images');
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(response.data);
        
        // Redirect to change password page if it's first login
        if (response.data.isFirstLogin) {
          setActiveTab('password');
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert('Please select an image');
      return;
    }

    if (!title || !location || !price) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('price', price);

    try {
      await axios.post('/api/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setTitle('');
      setDescription('');
      setLocation('');
      setPrice('');
      setSelectedFile(null);
      // Reset the file input
      document.getElementById('imageInput').value = '';
      fetchImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;

    try {
      await axios.delete(`/api/admin/images/${imageId}`);
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting hotel');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      await axios.post('/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      alert('Password changed successfully');
      
      if (currentUser?.isFirstLogin) {
        setActiveTab('hotels');
        fetchCurrentUser();
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.message || 'Error changing password');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Hotel Admin Panel</h1>
        {currentUser && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as: {currentUser.username}</p>
            <p className="text-xs text-gray-500">Role: {currentUser.role}</p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('hotels')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'hotels'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Hotels
          </button>
          <button
            onClick={() => setActiveTab('maps')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'maps'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Maps
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Change Password
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bookings'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bookings
          </button>
        </nav>
      </div>

      {activeTab === 'hotels' ? (
        <>
          {/* Hotel Upload Form */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New Hotel</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hotel Name *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Location *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., Kathmandu, Nepal"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price per Night *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[$,]/g, '');
                      // Only allow numbers and decimal point
                      if (/^\d*\.?\d*$/.test(value)) {
                        setPrice(value);
                      }
                    }}
                    className="block w-full rounded-md border border-gray-300 pl-7 pr-12 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">/night</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  rows="3"
                  placeholder="Describe the hotel and its amenities"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Hotel Image *</label>
                <input
                  id="imageInput"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Adding Hotel...' : 'Add Hotel'}
              </button>
            </form>
          </div>

          {/* Hotel Listings */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Hotel Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((hotel) => (
                <div key={hotel.id} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <div className="relative">
                    <img
                      src={hotel.path}
                      alt={hotel.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 m-2 rounded-full">
                      ${hotel.price}/night
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800">{hotel.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {hotel.location}
                    </p>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{hotel.description}</p>
                    <button
                      onClick={() => handleDelete(hotel.id)}
                      className="mt-4 w-full bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
                    >
                      Delete Hotel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : activeTab === 'maps' ? (
        <MapUpload />
      ) : activeTab === 'password' ? (
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Change Password
            </button>
          </form>
        </div>
      ) : (
        <BookingManager />
      )}
    </div>
  );
};

export default AdminPanel;
