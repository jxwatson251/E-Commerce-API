"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Product_1 = __importDefault(require("../models/Product"));
const authenMiddleware_1 = require("../middleware/authenMiddleware");
const router = express_1.default.Router();
router.get('/', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield Product_1.default.find();
    res.json(products);
}));
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
router.post('/', authenMiddleware_1.authenMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authReq = req;
    try {
        const { name, price, quantity, description, category } = authReq.body;
        const product = new Product_1.default({
            name,
            price,
            quantity,
            description,
            category,
            userId: authReq.user.id
        });
        yield product.save();
        res.status(201).json(product);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create product' });
    }
}));
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
exports.default = router;
