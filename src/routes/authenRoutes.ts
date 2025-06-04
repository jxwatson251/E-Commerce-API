import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authencontroller';
import { authenMiddleware } from '../middleware/authenMiddleware';
import { validateBody } from '../middleware/validate';
import { registerSchema, loginSchema } from '../utils/validator';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);

router.get('/profile', authenMiddleware, getProfile);
router.put('/profile', authenMiddleware, updateProfile);

export default router

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);