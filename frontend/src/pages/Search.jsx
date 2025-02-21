import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import LoginModal from "../components/auth/LoginModal";
import HotelDetailsModal from "../components/HotelDetailsModal";

const Search = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceSort, setPriceSort] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await axios.get('/api/admin/images');
      setHotels(response.data);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (hotelId) => {
    if (!user) {
      setSelectedHotelId(hotelId);
      setShowLoginModal(true);
    } else {
      navigate(`/booking?id=${hotelId}`);
    }
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (selectedHotelId) {
      navigate(`/booking?id=${selectedHotelId}`);
    }
  };

  // Filter and sort hotels
  const filteredHotels = hotels.filter(hotel => {
    const searchLower = searchTerm.toLowerCase();
    return (
      hotel.title.toLowerCase().includes(searchLower) ||
      hotel.location.toLowerCase().includes(searchLower) ||
      hotel.description.toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => {
    if (priceSort === 'lowToHigh') {
      return parseFloat(a.price.replace(/[^0-9.]/g, '')) - parseFloat(b.price.replace(/[^0-9.]/g, ''));
    } else if (priceSort === 'highToLow') {
      return parseFloat(b.price.replace(/[^0-9.]/g, '')) - parseFloat(a.price.replace(/[^0-9.]/g, ''));
    }
    return 0;
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Find Your Trek Hotel</h1>
      
      {/* Search and Filters */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search by hotel name, location..."
          className="w-full p-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="flex flex-wrap gap-4">
          <select
            className="border p-2 rounded"
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value)}
          >
            <option value="">Sort by Price</option>
            <option value="lowToHigh">Low to High</option>
            <option value="highToLow">High to Low</option>
          </select>
        </div>
      </div>

      {/* Hotel Listings */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center">Loading hotels...</div>
        ) : filteredHotels.length === 0 ? (
          <div className="col-span-full text-center">No hotels found matching your criteria.</div>
        ) : (
          filteredHotels.map((hotel) => (
            <div key={hotel.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer">
              <div 
                className="relative h-48" 
                onClick={() => {
                  setSelectedHotel(hotel);
                  setShowHotelModal(true);
                }}
              >
                <img
                  src={hotel.path}
                  alt={hotel.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 m-2 rounded-full">
                  ${parseFloat(hotel.price.replace(/[^0-9.]/g, '')).toFixed(2)}/night
                </div>
              </div>
              <div className="p-4">
                <h2 
                  className="text-xl font-semibold mb-2 cursor-pointer hover:text-indigo-600"
                  onClick={() => {
                    setSelectedHotel(hotel);
                    setShowHotelModal(true);
                  }}
                >{hotel.title}</h2>
                <p className="text-gray-600 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {hotel.location}
                </p>
                <p className="text-gray-500 text-sm mb-4">{hotel.description}</p>
                <button
                  onClick={() => handleBookNow(hotel.id)}
                  className="block w-full bg-indigo-600 text-white text-center px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-300"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Hotel Details Modal */}
      <HotelDetailsModal
        isOpen={showHotelModal}
        onClose={() => setShowHotelModal(false)}
        hotel={selectedHotel}
        onBookNow={handleBookNow}
      />
    </div>
  );
};

export default Search;
