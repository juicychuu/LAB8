const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const path         = require('path');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();

app.use(cors({
    origin: true,      
    credentials: true  
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- STATIC FOLDERS ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ADD THIS LINE BELOW:
app.use('/avatar', express.static(path.join(__dirname, 'avatar'))); 

// Routes
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/users',    require('./routes/userRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'API is running.' }));

app.get('/', (req, res) => {
    res.send('<h1>✅ Backend is Running!</h1><p>The server is ready to receive requests.</p>');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));