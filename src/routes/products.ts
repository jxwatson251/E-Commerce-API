import express, { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Product from '../models/Product';
import { authenMiddleware, AuthRequest } from '../middleware/authenMiddleware';

const router = express.Router();

router.get('/', async (_: Request, res: Response) => {
  const products = await Product.find();
  res.json(products);
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Invalid product ID' });
  }
});

router.post(
  '/',
  authenMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthRequest;

    try {
      const { name, price, quantity, description, category } = authReq.body;
      const product = new Product({
        name,
        price,
        quantity,
        description,
        category,
        userId: new Types.ObjectId(authReq.user!.id),
      });

      await product.save();
      res.status(201).json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create product' });
    }
  }
);

router.put(
  '/:id',
  authenMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthRequest;

    try {
      const product = await Product.findById(authReq.params.id);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      if (product.userId.toString() !== authReq.user!.id) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      Object.assign(product, authReq.body);
      await product.save();
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update product' });
    }
  }
);

router.delete(
  '/:id',
  authenMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthRequest;

    try {
      const product = await Product.findById(authReq.params.id);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      if (product.userId.toString() !== authReq.user!.id) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      await product.deleteOne();
      res.json({ message: 'Product deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete product' });
    }
  }
);

export default router;