import { Router } from 'express';
import { verifySession } from '../controllers/auth.controller.js';

const router = Router();

router.get('/verify', verifySession);

export default router;
