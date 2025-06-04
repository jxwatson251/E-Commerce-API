import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authenRoutes';
import { errorHandling } from './middleware/errorHandling';
import productRoutes from './routes/products';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api', authRoutes);

app.use(errorHandling);

app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))