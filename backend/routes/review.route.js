import express from 'express';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REVIEWS_DIR = join(__dirname, '..', 'data', 'reviews');

// Ensure reviews directory exists
async function ensureReviewsDir() {
  try {
    await fs.mkdir(REVIEWS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating reviews directory:', error);
  }
}

ensureReviewsDir();

// Get reviews file path for a hotel
const getReviewsFilePath = (hotelId) => {
  return join(REVIEWS_DIR, `hotel_${hotelId}_reviews.txt`);
};

// Get all reviews for a hotel
router.get('/hotels/:hotelId/reviews', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const filePath = getReviewsFilePath(hotelId);
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const reviews = content
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      res.json(reviews);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, return empty array
        res.json([]);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Add a new review
router.post('/hotels/:hotelId/reviews', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { content, rating, userId, userName } = req.body;

    const review = {
      id: Date.now(),
      content,
      rating,
      userId,
      userName,
      createdAt: new Date().toISOString()
    };

    const filePath = getReviewsFilePath(hotelId);
    const reviewString = JSON.stringify(review) + '\n';
    
    await fs.appendFile(filePath, reviewString, 'utf8');
    res.status(201).json(review);
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ error: 'Failed to save review' });
  }
});

export default router;
