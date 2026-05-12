import { Router } from 'express';
import { getProductPrice } from '../controllers/priceController';

const router = Router();

router.get('/:query', getProductPrice);

export default router;