import mongoose from 'mongoose';
import Product from '../models/Product';
import User from '../models/User';
import connectDB from '../config/db';
import bcrypt from 'bcryptjs';

const sampleProducts = [
  {
    name: "iPhone 14 Pro",
    price: 999,
    quantity: 50,
    description: "Latest iPhone with advanced camera system",
    category: "Electronics",
  },
  {
    name: "Nike Air Max 270",
    price: 150,
    quantity: 100,
    description: "Comfortable running shoes with air cushioning",
    category: "Footwear",
  },
  {
    name: "Samsung 4K TV",
    price: 800,
    quantity: 25,
    description: "55-inch 4K Ultra HD Smart TV",
    category: "Electronics",
  },
  {
    name: "Levi's 501 Jeans",
    price: 80,
    quantity: 200,
    description: "Classic straight-fit jeans",
    category: "Clothing",
  },
  {
    name: "MacBook Pro 16",
    price: 2499,
    quantity: 30,
    description: "Professional laptop with M2 chip",
    category: "Electronics",
  },
  {
    name: "Coffee Maker",
    price: 120,
    quantity: 75,
    description: "Programmable drip coffee maker",
    category: "Home & Kitchen",
  },
  {
    name: "Gaming Chair",
    price: 250,
    quantity: 40,
    description: "Ergonomic gaming chair with lumbar support",
    category: "Furniture",
  },
  {
    name: "Wireless Headphones",
    price: 200,
    quantity: 60,
    description: "Noise-cancelling Bluetooth headphones",
    category: "Electronics",
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    const existingUser = await User.findOne({ email: 'admin@example.com' });
    let userId;
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const sampleUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword
      });
      const savedUser = await sampleUser.save();
      userId = savedUser._id;
      console.log('Sample user created');
    } else {
      userId = existingUser._id;
      console.log('Using existing sample user');
    }

    await Product.deleteMany({});
    console.log('Existing products cleared');

    const productsWithUserId = sampleProducts.map(product => ({
      ...product,
      userId: userId
    }));

    await Product.insertMany(productsWithUserId);
    console.log(`${sampleProducts.length} sample products added to database`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

export { seedDatabase, sampleProducts }