import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const dataFile = join(__dirname, '..', 'data', 'maps.json');

// Ensure data and uploads directories exist
const dataDir = join(__dirname, '..', 'data');
const uploadsDir = join(__dirname, '..', 'uploads', 'maps');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize maps data from JSON file
let maps = [];
try {
    if (fs.existsSync(dataFile)) {
        const data = fs.readFileSync(dataFile, 'utf8');
        maps = JSON.parse(data);
    } else {
        fs.writeFileSync(dataFile, '[]', 'utf8');
    }
} catch (error) {
    console.error('Error reading maps data:', error);
}

// Function to save maps data to JSON file
const saveMaps = () => {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(maps, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving maps data:', error);
    }
};

// Configure multer for PDF upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Upload directory:', uploadsDir);
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-').toLowerCase();
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    console.log('Received file:', file);
    // Accept PDF files only
    if (!file.originalname.match(/\.pdf$/i)) {
        console.log('File rejected - invalid type:', file.originalname);
        return cb(new Error('Only PDF files are allowed!'), false);
    }
    console.log('File accepted:', file.originalname);
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Get all maps
router.get('/maps', (req, res) => {
    console.log('GET /maps - Returning maps:', maps);
    res.json(maps);
});

// Upload map
router.post('/maps/upload', upload.single('map'), (req, res) => {
    try {
        console.log('Map upload request received');
        console.log('Request body:', req.body);
        console.log('File:', req.file);

        if (!req.file) {
            console.error('No file in request');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const mapData = {
            id: Date.now().toString(),
            fileName: req.file.filename,
            originalName: req.file.originalname,
            name: req.body.name || 'Untitled',
            description: req.body.description || '',
            uploadDate: new Date().toISOString(),
            size: req.file.size,
            path: `/uploads/maps/${req.file.filename}`
        };

        maps.push(mapData);
        saveMaps();

        console.log('Map uploaded successfully:', mapData);
        res.status(201).json(mapData);
    } catch (error) {
        console.error('Error uploading map:', error);
        res.status(500).json({ message: error.message || 'Error uploading map' });
    }
});

// Download map
router.get('/maps/download/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = join(__dirname, '..', 'uploads', 'maps', filename);

        console.log('Download request for file:', filePath);

        if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            return res.status(404).json({ message: 'Map not found' });
        }

        res.download(filePath);
    } catch (error) {
        console.error('Error downloading map:', error);
        res.status(500).json({ message: 'Error downloading map' });
    }
});

// Delete map
router.delete('/maps/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = join(__dirname, '..', 'uploads', 'maps', filename);

        console.log('Delete request for file:', filePath);

        // Remove from database
        maps = maps.filter(map => map.fileName !== filename);
        saveMaps();

        // Delete file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('File deleted:', filePath);
        }

        res.json({ message: 'Map deleted successfully' });
    } catch (error) {
        console.error('Error deleting map:', error);
        res.status(500).json({ message: 'Error deleting map' });
    }
});

export default router;
