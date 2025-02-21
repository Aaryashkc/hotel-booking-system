const fs = require('fs');
const path = require('path');

const REVIEWS_DIR = path.join(process.cwd(), 'reviews');

// Ensure reviews directory exists
if (!fs.existsSync(REVIEWS_DIR)) {
  fs.mkdirSync(REVIEWS_DIR, { recursive: true });
}

const getReviewFilePath = (hotelId) => {
  return path.join(REVIEWS_DIR, `hotel_${hotelId}_reviews.txt`);
};

const saveReview = (hotelId, review) => {
  const filePath = getReviewFilePath(hotelId);
  const reviewData = JSON.stringify({
    ...review,
    createdAt: new Date().toISOString()
  }) + '\n';
  
  fs.appendFileSync(filePath, reviewData, 'utf8');
};

const getReviews = (hotelId) => {
  const filePath = getReviewFilePath(hotelId);
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const reviews = content
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return reviews;
};

module.exports = {
  saveReview,
  getReviews
};
