import { Router } from 'express';
import { register } from '../controllers/authController';

const router = Router();

router.post('/register', register);
// Futuras rotas de login irão aqui: router.post('/login', login);

export default router;