import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/booking/bookings');
      // Only set confirmed bookings
      setBookings(response.data.filter(booking => booking.status === 'confirmed'));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return <div className="text-center py-8">Loading bookings...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Confirmed Bookings</h2>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No confirmed bookings found</p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{booking.hotelName}</h3>
                  <p className="text-gray-600">Guest: {booking.guestName}</p>
                  <p className="text-gray-600">Email: {booking.email}</p>
                  <p className="text-gray-600">Phone: {booking.phone}</p>
                  <p className="text-gray-600">
                    Dates: {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">Guests: {booking.numberOfGuests}</p>
                  <p className="font-semibold text-indigo-600 mt-2">
                    Total Amount: ${parseFloat(booking.totalAmount).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    Confirmed
                  </span>
                  {booking.paymentId && (
                    <p className="text-sm text-gray-500 mt-1">Payment ID: {booking.paymentId}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingManager;
