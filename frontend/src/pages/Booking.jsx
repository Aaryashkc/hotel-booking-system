import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const hotelId = params.get('id');

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    numberOfGuests: 1,
    checkIn: new Date(),
    checkOut: new Date(new Date().setDate(new Date().getDate() + 1))
  });

  useEffect(() => {
    fetchHotelDetails();
  }, [hotelId]);

  const fetchHotelDetails = async () => {
    try {
      const response = await axios.get('/api/admin/images');
      const hotelData = response.data.find(h => h.id.toString() === hotelId);
      if (hotelData) {
        setHotel(hotelData);
      } else {
        navigate('/search');
      }
    } catch (error) {
      console.error('Error fetching hotel details:', error);
      setError('Error loading hotel details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const calculateNights = () => {
    const diffTime = Math.abs(formData.checkOut - formData.checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const pricePerNight = parseFloat(hotel?.price) || 0;
    return (nights * pricePerNight * formData.numberOfGuests).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Validate dates
      if (formData.checkIn >= formData.checkOut) {
        throw new Error('Check-out date must be after check-in date');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate phone number (basic validation)
      const phoneRegex = /^\+?\d{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        throw new Error('Please enter a valid phone number');
      }

      const bookingData = {
        hotelId: hotel.id,
        hotelName: hotel.title,
        ...formData,
        totalAmount: calculateTotal()
      };

      console.log('Creating booking with data:', bookingData);
      
      const response = await axios.post('/api/booking/create', bookingData);
      setCurrentBooking(response.data.booking);
      setShowPayment(true);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Error creating booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await axios.post('/api/booking/process-payment', {
        bookingId: currentBooking.id
      });
      
      if (response.data.success) {
        setShowSuccess(true);
        // Show success message for 2 seconds before redirecting
        setTimeout(() => {
          navigate('/', { 
            state: { 
              bookingSuccess: true,
              bookingId: currentBooking.id 
            }
          });
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!hotel) {
    return <div className="text-center py-10">Hotel not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hotel Details */}
          <div className="relative h-64">
            <img
              src={hotel.path}
              alt={hotel.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-2 m-4 rounded-full">
              ${hotel.price}/night
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{hotel.title}</h1>
            <p className="text-gray-600 mb-6">{hotel.description}</p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {showSuccess && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
                  <div className="text-center">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600 mb-4">Your booking has been confirmed.</p>
                    <p className="text-gray-500">Redirecting to home page...</p>
                  </div>
                </div>
              </div>
            )}

            {!showPayment ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Guest Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    name="numberOfGuests"
                    value={formData.numberOfGuests}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in Date
                    </label>
                    <DatePicker
                      selected={formData.checkIn}
                      onChange={(date) => handleDateChange(date, 'checkIn')}
                      minDate={new Date()}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out Date
                    </label>
                    <DatePicker
                      selected={formData.checkOut}
                      onChange={(date) => handleDateChange(date, 'checkOut')}
                      minDate={formData.checkIn}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Booking Summary</h3>
                  <div className="space-y-2">
                    <p>Nights: {calculateNights()}</p>
                    <p>Guests: {formData.numberOfGuests}</p>
                    <p>Price per night: ${hotel.price}</p>
                    <p className="text-lg font-bold">Total: ${calculateTotal()}</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : 'Continue to Payment'}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                  <div className="space-y-2">
                    <p>Booking ID: {currentBooking.id}</p>
                    <p>Total Amount: ${currentBooking.totalAmount}</p>
                  </div>
                </div>

                {/* Fake Payment Form */}
                <div className="border p-4 rounded-md">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value="4242 4242 4242 4242"
                        readOnly
                        className="w-full px-3 py-2 border rounded-md bg-gray-50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value="12/25"
                          readOnly
                          className="w-full px-3 py-2 border rounded-md bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value="123"
                          readOnly
                          className="w-full px-3 py-2 border rounded-md bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={submitting}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing Payment...' : 'Pay Now'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
