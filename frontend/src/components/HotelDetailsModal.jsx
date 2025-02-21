import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const StarRating = ({ rating, onRatingChange, interactive = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          className={`${interactive ? 'cursor-pointer' : ''} p-1`}
          onClick={() => interactive && onRatingChange(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        >
          <svg
            className={`w-6 h-6 ${
              star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const HotelDetailsModal = ({ isOpen, onClose, hotel, onBookNow }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (hotel?.id) {
      fetchReviews();
    }
    if (user) {
      fetchUserProfile();
    }
  }, [hotel, user]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/hotels/${hotel.id}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    if (!user.displayName) {
      alert('Please set your name in your profile before submitting a review');
      return;
    }

    try {
      await axios.post(`/api/hotels/${hotel.id}/reviews`, {
        content: newReview,
        rating,
        userId: user.uid,
        userName: user.displayName
      });
      setNewReview('');
      setRating(5);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  if (!isOpen || !hotel) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Hotel details */}
          <div className="mb-6">
            <img src={hotel.path} alt={hotel.title} className="w-full h-64 object-cover rounded-lg mb-4" />
            <h2 className="text-2xl font-bold mb-2">{hotel.title}</h2>
            <p className="text-gray-600 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {hotel.location}
            </p>
            <p className="text-gray-700 mb-4">{hotel.description}</p>
            <p className="text-xl font-semibold text-indigo-600 mb-4">${parseFloat(hotel.price.replace(/[^0-9.]/g, '')).toFixed(2)}/night</p>
            <button
              onClick={() => onBookNow(hotel.id)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-300"
            >
              Book Now
            </button>
          </div>

          {/* Reviews section */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Reviews</h3>
            
            {/* Review form */}
            <form onSubmit={handleSubmitReview} className="mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <StarRating rating={rating} onRatingChange={setRating} interactive={true} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  className="w-full border rounded-md p-2"
                  rows="3"
                  placeholder="Write your review here..."
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
              >
                Submit Review
              </button>
            </form>

            {/* Reviews list */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{review.userName}</span>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-gray-600">{review.content}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-gray-500 text-center">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailsModal;
