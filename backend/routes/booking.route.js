import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const bookingsFile = join(__dirname, '..', 'data', 'bookings.json');

// Ensure bookings file exists
if (!fs.existsSync(bookingsFile)) {
    fs.writeFileSync(bookingsFile, '[]', 'utf8');
}

// Get all bookings
router.get('/bookings', (req, res) => {
    try {
        const bookings = JSON.parse(fs.readFileSync(bookingsFile, 'utf8'));
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings' });
    }
});

// Create new booking
router.post('/create', async (req, res) => {
    try {
        console.log('Creating booking with data:', req.body);

        const bookings = JSON.parse(fs.readFileSync(bookingsFile, 'utf8'));
        const newBooking = {
            id: Date.now().toString(),
            hotelId: req.body.hotelId,
            hotelName: req.body.hotelName,
            guestName: req.body.guestName,
            email: req.body.email,
            phone: req.body.phone,
            numberOfGuests: req.body.numberOfGuests,
            checkIn: req.body.checkIn,
            checkOut: req.body.checkOut,
            totalAmount: req.body.totalAmount,
            status: 'pending',
            paymentId: Date.now().toString(),
            createdAt: new Date().toISOString()
        };

        // Save booking
        bookings.push(newBooking);
        fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2));

        console.log('Booking created successfully:', newBooking.id);

        // Create fake payment URL
        const paymentUrl = `/process-payment?bookingId=${newBooking.id}&amount=${newBooking.totalAmount}`;

        res.json({
            booking: newBooking,
            paymentUrl: paymentUrl
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ 
            message: 'Error creating booking',
            error: error.message 
        });
    }
});

// Process payment (fake)
router.post('/process-payment', (req, res) => {
    try {
        const { bookingId } = req.body;
        
        if (!bookingId) {
            return res.status(400).json({ 
                success: false,
                message: 'Booking ID is required' 
            });
        }

        // Read bookings
        const bookings = JSON.parse(fs.readFileSync(bookingsFile, 'utf8'));
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex === -1) {
            return res.status(404).json({ 
                success: false,
                message: 'Booking not found' 
            });
        }
        
        // Update booking status to confirmed
        bookings[bookingIndex].status = 'confirmed';
        bookings[bookingIndex].paymentId = `PAY-${Date.now()}`;
        bookings[bookingIndex].paidAt = new Date().toISOString();
        fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2));
        
        res.json({
            success: true,
            message: 'Payment processed successfully',
            booking: bookings[bookingIndex]
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error processing payment',
            error: error.message 
        });
    }
});

// Update booking status
router.put('/status/:bookingId', (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        console.log('Updating booking status:', { bookingId, status });
        console.log('Bookings file path:', bookingsFile);

        if (!bookingId || !status) {
            console.log('Missing required fields:', { bookingId, status });
            return res.status(400).json({ 
                success: false,
                message: 'Booking ID and status are required' 
            });
        }

        // Check if bookings file exists
        if (!fs.existsSync(bookingsFile)) {
            console.log('Bookings file does not exist, creating empty file');
            fs.writeFileSync(bookingsFile, '[]', 'utf8');
        }

        // Read bookings
        console.log('Reading bookings file...');
        const bookings = JSON.parse(fs.readFileSync(bookingsFile, 'utf8'));
        console.log('Current bookings:', bookings);

        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        console.log('Found booking at index:', bookingIndex);
        
        if (bookingIndex === -1) {
            console.log('Booking not found:', bookingId);
            return res.status(404).json({ 
                success: false,
                message: 'Booking not found' 
            });
        }
        
        // Update booking status
        const oldStatus = bookings[bookingIndex].status;
        bookings[bookingIndex].status = status;
        bookings[bookingIndex].updatedAt = new Date().toISOString();
        
        console.log(`Updating booking ${bookingId} status from ${oldStatus} to ${status}`);
        
        // Write back to file
        console.log('Writing updated bookings to file...');
        fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2));
        console.log('Successfully wrote to file');
        
        res.json({
            success: true,
            booking: bookings[bookingIndex]
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false,
            message: 'Error updating booking status',
            error: error.message 
        });
    }
});

export default router;
