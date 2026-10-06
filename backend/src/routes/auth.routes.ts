import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import { RegisterSchema, LoginSchema } from '@project-mgmt/shared';

const router = Router();

router.post('/register', authRateLimiter, validateBody(RegisterSchema), AuthController.register);
router.post('/login', authRateLimiter, validateBody(LoginSchema), AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);

export default router;
