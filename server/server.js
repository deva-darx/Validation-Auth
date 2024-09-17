import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { connectDB } from './config/db.js';
import User from '../server/models/userSchema.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; 

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: "http://localhost:3000",
}));


app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ email: user.email }, process.env.SECRET, { expiresIn: '1h' });
    
    res.cookie('token', token, { httpOnly: true });

    return res.status(201).json({ message: 'Signup successful, redirecting to dashboard', redirect: '/dashboard' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ email: user.email }, process.env.SECRET, { expiresIn: '1h' });
    
    res.cookie('token', token, { httpOnly: true });
    
    return res.status(201).json({ message: 'Login successful, redirecting to dashboard', redirect: '/dashboard' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token is not valid' });
    }
    req.user = decoded;
    next();
  });
};

app.get('/dashboard', authenticateToken, (req, res) => {
  return res.status(200).json({ message: "Welcome to the dashboard" });
});

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.status(201).json({ message: 'Successfully logged out, redirecting to login', redirect: '/login' });
});


const startServer = async () => {
  try {
    await connectDB(); 
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  }
};

startServer();
