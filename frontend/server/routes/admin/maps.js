const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/maps');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    cb(null, `${uniqueId}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Get all maps
router.get('/', async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../../uploads/maps');
    await fs.mkdir(uploadDir, { recursive: true }); // Create directory if it doesn't exist
    
    const files = await fs.readdir(uploadDir);
    
    const maps = await Promise.all(files.filter(file => file.endsWith('.pdf')).map(async (fileName) => {
      const filePath = path.join(uploadDir, fileName);
      const stats = await fs.stat(filePath);
      
      // Get metadata from the metadata file if it exists
      let metadata = {};
      try {
        const metadataPath = path.join(uploadDir, `${fileName}.meta.json`);
        const metadataContent = await fs.readFile(metadataPath, 'utf8');
        metadata = JSON.parse(metadataContent);
      } catch (error) {
        // If metadata file doesn't exist, use default values
        metadata = {
          name: fileName.split('_').slice(1).join('_').replace('.pdf', ''),
          description: ''
        };
      }
      
      return {
        fileName,
        name: metadata.name,
        description: metadata.description,
        size: stats.size
      };
    }));
    
    res.json(maps);
  } catch (error) {
    console.error('Error loading maps:', error);
    res.status(500).json({ message: 'Error loading maps' });
  }
});

// Upload a new map
router.post('/upload', upload.single('map'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Save metadata
    const metadata = {
      name: req.body.name,
      description: req.body.description
    };
    
    const metadataPath = path.join(req.file.destination, `${req.file.filename}.meta.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata));

    res.status(201).json({
      fileName: req.file.filename,
      ...metadata,
      size: req.file.size
    });
  } catch (error) {
    // Delete uploaded file if metadata save fails
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    res.status(400).json({ message: error.message });
  }
});

// Download a map
router.get('/download/:fileName', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../uploads/maps', req.params.fileName);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading map' });
  }
});

// Delete a map
router.delete('/:fileName', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../uploads/maps', req.params.fileName);
    const metadataPath = `${filePath}.meta.json`;
    
    await fs.unlink(filePath);
    await fs.unlink(metadataPath).catch(() => {}); // Ignore if metadata file doesn't exist
    
    res.json({ message: 'Map deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting map' });
  }
});

module.exports = router;
