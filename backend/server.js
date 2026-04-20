const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const path         = require('path');
const db           = require('./config/db'); 
const bcrypt       = require('bcryptjs');     
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();

app.use(cors({
    origin: true,      
    credentials: true  
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- AUTO-CREATE ROOT ADMIN ---
const setupAdmin = async () => {
    const rootEmail = 'Admin@gmail.com';
    const rootPass = '@dmin123';
    
    try {
        
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [rootEmail]);
        
        if (rows.length === 0) {
            const hash = await bcrypt.hash(rootPass, 10);
            await db.query(
                "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
                ['SystemRoot', rootEmail, hash, 'admin']
            );
            console.log('🛡️  Root Admin created automatically: Admin@gmail.com');
        } else {
            console.log('✅ Root Admin verified.');
        }
    } catch (err) {
       
        console.log('ℹ️  Note: Root Admin check skipped (Table may not exist yet).');
    }
};


setupAdmin();

// --- STATIC FOLDERS ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/avatar', express.static(path.join(__dirname, 'avatar'))); 

// Routes
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/users',    require('./routes/userRoutes'));
app.use('/api/cart',     require('./routes/cartRoutes'));


app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'API is running.' }));

app.get('/', (req, res) => {
    res.send('<h1>✅ Backend is Running!</h1><p>The server is ready to receive requests.</p>');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));