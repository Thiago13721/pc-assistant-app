import { Router } from 'express';
import { askAI } from '../controllers/aiController';

const router = Router();

router.post('/ask', askAI);

export default router;