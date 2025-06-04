import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authenRoutes';
import productRoutes from './routes/products';
import { errorHandling } from './middleware/errorHandling';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.use(errorHandling);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import { setupSwagger } from './config/swagger';

setupSwagger(app);