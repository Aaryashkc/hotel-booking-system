const express = require('express')
const app = express();
const fileRouter = require('./routes/file.route')
const bookingRouter = require('./routes/booking.route')
const multer = require('multer')
const cors = require('cors');

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/booking', bookingRouter);
app.use('/api/file', fileRouter);

app.get('/home', (req,res) => {
  res.json({message: "you got the home"})
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

app.post('/uploads', upload.single('uploaded_file'), fileRouter)

app.listen(5000, () => {
  console.log("app is running on server 5000")
})