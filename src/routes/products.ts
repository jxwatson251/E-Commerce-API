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

/**
 * @swagger
 * /api/products/delete-multiple:
 *   delete:
 *     summary: Delete multiple products by IDs
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productIds
 *             properties:
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of product IDs to delete
 *                 minItems: 1
 *           example:
 *             productIds: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *     responses:
 *       200:
 *         description: Products deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: number
 *                 deletedIds:
 *                   type: array
 *                   items:
 *                     type: string
 *             example:
 *               message: "Products deleted successfully"
 *               deletedCount: 2
 *               deletedIds: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *       400:
 *         description: Invalid request or no products found to delete
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User doesn't own some of the products
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/products/delete-all:
 *   delete:
 *     summary: Delete all products belonging to the authenticated user
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All user products deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: number
 *             example:
 *               message: "All products deleted successfully"
 *               deletedCount: 5
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

import express, { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Product from '../models/Product';
import { authenMiddleware, AuthRequest } from '../middleware/authenMiddleware';
import { validateBody } from '../middleware/validate';
import { productSchema, deleteMultipleSchema } from '../utils/validator';
import { getProductPriceInCurrency } from '../controllers/currencyController';

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

router.get('/:id/price-in/:currency', getProductPriceInCurrency);

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
      res.json({ message: 'Product deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete product' });
    }
  }
);

router.delete(
  '/delete-multiple',
  authenMiddleware,
  validateBody(deleteMultipleSchema),
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const { productIds } = authReq.body;

    try {
      const validIds = productIds.filter((id: string) => Types.ObjectId.isValid(id));
      if (validIds.length !== productIds.length) {
        res.status(400).json({ 
          message: 'One or more invalid product IDs provided',
          invalidIds: productIds.filter((id: string) => !Types.ObjectId.isValid(id))
        });
        return;
      }

      const products = await Product.find({
        _id: { $in: validIds },
        userId: authReq.user!.id
      });

      if (products.length === 0) {
        res.status(404).json({ 
          message: 'No products found that belong to you with the provided IDs' 
        });
        return;
      }

      const foundIds = products.map(p => p._id.toString());
      const unauthorizedIds = validIds.filter((id: string) => !foundIds.includes(id));
      
      if (unauthorizedIds.length > 0) {
        res.status(403).json({ 
          message: 'You are not authorized to delete some of the requested products',
          unauthorizedIds 
        });
        return;
      }

      const result = await Product.deleteMany({
        _id: { $in: validIds },
        userId: authReq.user!.id
      });

      res.json({
        message: 'Products deleted successfully',
        deletedCount: result.deletedCount,
        deletedIds: foundIds
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete products' });
    }
  }
);

router.delete(
  '/delete-all',
  authenMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;

    try {
      const result = await Product.deleteMany({ userId: authReq.user!.id });
      
      res.json({
        message: result.deletedCount > 0 
          ? 'All products deleted successfully' 
          : 'No products found to delete',
        deletedCount: result.deletedCount
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete all products' });
    }
  }
);

export default router