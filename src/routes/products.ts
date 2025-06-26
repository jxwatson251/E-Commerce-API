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
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a single product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product deleted successfully"
 *                 deletedProduct:
 *                   type: object
 *                   description: The deleted product details
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User doesn't own the product
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/products/bulk-delete:
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
 *                 minItems: 1
 *                 description: Array of product IDs to delete
 *             example:
 *               productIds: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
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
 *                   example: "3 products deleted successfully"
 *                 deletedCount:
 *                   type: number
 *                   example: 3
 *                 failedDeletions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                       reason:
 *                         type: string
 *                   description: Products that failed to delete with reasons
 *       400:
 *         description: Invalid request - no product IDs provided or invalid format
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "All products deleted successfully"
 *                 deletedCount:
 *                   type: number
 *                   example: 15
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */

import express, { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Product from '../models/Product';
import { authenMiddleware, AuthRequest } from '../middleware/authenMiddleware';
import { validateBody } from '../middleware/validate';
import { productSchema, bulkDeleteSchema } from '../utils/validator';
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
      res.json({ 
        message: 'Product deleted successfully',
        deletedProduct: {
          id: product._id,
          name: product.name,
          price: product.price
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete product' });
    }
  }
);

router.delete(
  '/bulk-delete',
  authenMiddleware,
  validateBody(bulkDeleteSchema),
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const { productIds } = authReq.body;

    try {
      const failedDeletions: Array<{ productId: string; reason: string }> = [];
      let deletedCount = 0;

      for (const productId of productIds) {
        try {
          if (!Types.ObjectId.isValid(productId)) {
            failedDeletions.push({
              productId,
              reason: 'Invalid product ID format'
            });
            continue;
          }

          const product = await Product.findById(productId);
          
          if (!product) {
            failedDeletions.push({
              productId,
              reason: 'Product not found'
            });
            continue;
          }

          if (product.userId.toString() !== authReq.user!.id) {
            failedDeletions.push({
              productId,
              reason: 'Unauthorized - You do not own this product'
            });
            continue;
          }

          await product.deleteOne();
          deletedCount++;

        } catch (error) {
          failedDeletions.push({
            productId,
            reason: 'Failed to delete product'
          });
        }
      }

      const response: any = {
        message: `${deletedCount} product${deletedCount !== 1 ? 's' : ''} deleted successfully`,
        deletedCount
      };

      if (failedDeletions.length > 0) {
        response.failedDeletions = failedDeletions;
      }

      res.json(response);
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
      const result = await Product.deleteMany({ 
        userId: new Types.ObjectId(authReq.user!.id) 
      });

      res.json({
        message: 'All products deleted successfully',
        deletedCount: result.deletedCount
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete all products' });
    }
  }
);

export default router