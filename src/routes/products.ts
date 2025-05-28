import express from 'express';
import Product from '../models/Product';
import { authenMiddleware, AuthRequest } from '../middleware/authenMiddleware';

const router = express.Router();

router.get('/', async (_, res) => {
  const products = await Product.find();
  res.json(products);
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Invalid product ID' });
  }
});

router.post('/', authenMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, price, quantity, description, category } = req.body;
    const product = new Product({
      name,
      price,
      quantity,
      description,
      category,
      userId: req.user!.id
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

router.put('/:id', authenMiddleware, async (req: AuthRequest, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.userId !== req.user!.id) return res.status(403).json({ message: 'Unauthorized' });

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

router.delete('/:id', authenMiddleware, async (req: AuthRequest, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.userId !== req.user!.id) return res.status(403).json({ message: 'Unauthorized' });

    await product.remove();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;