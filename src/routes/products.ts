/**
 * @swagger
 * /api/products/{id}/price-in/{currency}:
 *   get:
 *     summary: Get product price in specified currency
 *     tags: [Currency]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: currency
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[A-Z]{3}$'
 *         description: Target currency code (3 letters, e.g., EUR, GBP, JPY)
 *         example: "EUR"
 *     responses:
 *       200:
 *         description: Price converted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productId:
 *                   type: string
 *                   description: Product ID
 *                 productName:
 *                   type: string
 *                   description: Product name
 *                 originalPrice:
 *                   type: number
 *                   description: Original price in USD
 *                 currency:
 *                   type: string
 *                   description: Target currency code
 *                 convertedPrice:
 *                   type: number
 *                   description: Price converted to target currency
 *                 exchangeRate:
 *                   type: number
 *                   description: Exchange rate used for conversion
 *             example:
 *               productId: "507f1f77bcf86cd799439011"
 *               productName: "iPhone 14 Pro"
 *               originalPrice: 999
 *               currency: "EUR"
 *               convertedPrice: 849.15
 *               exchangeRate: 0.85
 *       400:
 *         description: Invalid product ID or currency code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               invalidCurrency:
 *                 summary: Invalid currency code
 *                 value:
 *                   message: "Invalid currency code. Must be 3 letters (e.g., EUR, GBP)"
 *               unsupportedCurrency:
 *                 summary: Unsupported currency
 *                 value:
 *                   message: "Currency XYZ not supported"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
 *       503:
 *         description: Currency conversion service unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Currency conversion service unavailable"
 *       500:
 *         description: Internal server error
 */

import express, { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Product from '../models/Product';
import { authenMiddleware, AuthRequest } from '../middleware/authenMiddleware';
import { validateBody } from '../middleware/validate';
import { productSchema } from '../utils/validator';

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
  validateBody(productSchema),
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
  validateBody(productSchema),
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