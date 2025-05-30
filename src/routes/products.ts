import express, { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import { authenMiddleware, AuthRequest } from '../middleware/authenMiddleware';

const router = express.Router();

router.get('/', async (_: Request, res: Response) => {
  const products = await Product.find();
  res.json(products);
});

// router.get('/:id', async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: 'Product not found' });
//     res.json(product);
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ message: 'Invalid product ID' });
//   }
// });

router.post(
  '/',
  authenMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    try {
      const { name, price, quantity, description, category } = authReq.body;
      const product = new Product({
        name,
        price,
        quantity,
        description,
        category,
        userId: authReq.user!.id
      });

      await product.save();
      res.status(201).json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create product' });
    }
  }
);

// router.put(
//   '/:id',
//   authenMiddleware,
//   async (req: Request, res: Response, next: NextFunction) => {
//     const authReq = req as AuthRequest;

//     try {
//       const product = await Product.findById(authReq.params.id);
//       if (!product) return res.status(404).json({ message: 'Product not found' });
//       if (product.userId !== authReq.user!.id)
//         return res.status(403).json({ message: 'Unauthorized' });

//       Object.assign(product, authReq.body);
//       await product.save();
//       res.json(product);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: 'Failed to update product' });
//     }
//   }
// );

// router.delete(
//   '/:id',
//   authenMiddleware,
//   async (req: Request, res: Response, next: NextFunction) => {
//     const authReq = req as AuthRequest;

//     try {
//       const product = await Product.findById(authReq.params.id);
//       if (!product) return res.status(404).json({ message: 'Product not found' });
//       if (product.userId !== authReq.user!.id)
//         return res.status(403).json({ message: 'Unauthorized' });

//       await product.remove();
//       res.json({ message: 'Product deleted' });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: 'Failed to delete product' });
//     }
//   }
// );

export default router;