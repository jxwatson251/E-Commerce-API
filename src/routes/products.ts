/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - quantity
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: Product's unique identifier
 *         userId:
 *           type: string
 *           description: ID of the user who owns this product
 *         name:
 *           type: string
 *           description: Product name
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Product price
 *         quantity:
 *           type: integer
 *           minimum: 0
 *           description: Available quantity
 *         description:
 *           type: string
 *           description: Product description (optional)
 *         category:
 *           type: string
 *           description: Product category
 *         img:
 *           type: string
 *           description: Product image filename (optional)
 *         imageUrl:
 *           type: string
 *           description: Product image URL (optional)
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - quantity
 *         - category
 *       properties:
 *         name:
 *           type: string
 *           description: Product name
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Product price
 *         quantity:
 *           type: integer
 *           minimum: 0
 *           description: Available quantity
 *         description:
 *           type: string
 *           description: Product description (optional)
 *         category:
 *           type: string
 *           description: Product category
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *           example:
 *             name: "iPhone 14"
 *             price: 999
 *             quantity: 50
 *             description: "Latest iPhone model"
 *             category: "Electronics"
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Failed to create product
 */

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update a product
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *           example:
 *             name: "iPhone 14 Pro"
 *             price: 1099
 *             quantity: 30
 *             description: "Updated description"
 *             category: "Electronics"
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only update your own products
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to update product
 *   delete:
 *     summary: Delete a product
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
 *                   example: "Product deleted"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only delete your own products
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to delete product
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