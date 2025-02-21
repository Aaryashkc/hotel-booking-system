const express = require('express');
const router = express.Router();
const { saveReview, getReviews } = require('../utils/reviewUtils');

// Get all reviews for a hotel
router.get('/hotels/:hotelId/reviews', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const reviews = getReviews(hotelId);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create a new review
router.post('/hotels/:hotelId/reviews', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { content, rating, userId, userName } = req.body;

    const review = {
      id: Date.now(), // Use timestamp as ID
      content,
      rating,
      userId,
      userName,
      createdAt: new Date().toISOString()
    };

    saveReview(hotelId, review);
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

module.exports = router;
