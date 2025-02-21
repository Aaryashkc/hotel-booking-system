import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const dataFile = join(__dirname, '..', 'data', 'hotelImages.json');

// Ensure data directory exists
const dataDir = join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize hotelImages from JSON file
let hotelImages = [];
try {
    if (fs.existsSync(dataFile)) {
        const data = fs.readFileSync(dataFile, 'utf8');
        hotelImages = JSON.parse(data);
    } else {
        fs.writeFileSync(dataFile, '[]', 'utf8');
    }
} catch (error) {
    console.error('Error reading hotel images data:', error);
}

// Function to save hotel images to JSON file
const saveHotelImages = () => {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(hotelImages, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving hotel images data:', error);
    }
};

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = join(__dirname, '..', 'uploads', 'hotels');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        console.log('Upload directory:', uploadDir); // Debug log
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-').toLowerCase();
        console.log('Generated filename:', filename); // Debug log
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
        console.log('File rejected - invalid type:', file.originalname); // Debug log
        return cb(new Error('Only image files are allowed!'), false);
    }
    console.log('File accepted:', file.originalname); // Debug log
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Upload single image
router.post('/upload', upload.single('image'), (req, res) => {
    try {
        console.log('Upload request received');
        console.log('Request body:', req.body);
        console.log('File:', req.file);

        if (!req.file) {
            console.error('No file in request');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imageData = {
            id: Date.now(),
            filename: req.file.filename,
            path: `/uploads/hotels/${req.file.filename}`,
            title: req.body.title || 'Untitled',
            description: req.body.description || '',
            location: req.body.location || '',
            // Remove $ if it exists, then store just the number
            price: req.body.price.replace(/[$,]/g, '')
        };

        hotelImages.push(imageData);
        saveHotelImages();
        
        console.log('Image data saved successfully:', imageData);
        res.status(200).json(imageData);
    } catch (error) {
        console.error('Error in upload:', error);
        res.status(500).json({ 
            message: 'Error uploading file',
            error: error.message,
            stack: error.stack
        });
    }
});

// Get all images
router.get('/images', (req, res) => {
    try {
        // Read the latest data from file
        if (fs.existsSync(dataFile)) {
            const data = fs.readFileSync(dataFile, 'utf8');
            hotelImages = JSON.parse(data);
        }
        res.json(hotelImages);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete image
router.delete('/images/:id', (req, res) => {
    try {
        const imageId = parseInt(req.params.id);
        const imageIndex = hotelImages.findIndex(img => img.id === imageId);
        
        if (imageIndex === -1) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const image = hotelImages[imageIndex];
        const filePath = join(__dirname, '..', 'uploads', 'hotels', image.filename);

        // Delete file from filesystem
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove from array and save to JSON
        hotelImages.splice(imageIndex, 1);
        saveHotelImages();
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
