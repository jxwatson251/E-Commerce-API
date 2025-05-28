import express from 'express';
import Product from '../models/Product';
import { authenMiddleware, AuthRequest } from '../middleware/authenMiddleware';

const router = express.Router();

// Get all products (Public)
router.get('/', async (_, res) => {
  const products = await Product.find();
  res.json(products);
});

// Get product by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch {
    res.status(400).json({ message: 'Invalid product ID' });
  }
});

// Create product (Authenticated)
router.post('/', authenMiddleware, async (req: AuthRequest, res) => {
  const { name, price, description, category } = req.body;
  const product = new Product({
    name,
    price,
    description,
    category,
    userId: req.userId
  });

  await product.save();
  res.status(201).json(product);
});

router.put('/:id', authenMiddleware, async (req: AuthRequest, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

  Object.assign(product, req.body);
  await product.save();
  res.json(product);
});

router.delete('/:id', authenMiddleware, async (req: AuthRequest, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

  await product.remove();
  res.json({ message: 'Product deleted' });
});

export default router;