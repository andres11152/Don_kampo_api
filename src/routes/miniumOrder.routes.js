import {Router} from 'express';
import {
  getMinimumOrders,
  createOrUpdateMinimumOrder,
  deleteMinimumOrder,
} from '../controllers/minimumOrder.controller.js';

const router = router();

router.get('/api/minimum-orders', getMinimumOrders);
router.post('/api/minimum-orders', createOrUpdateMinimumOrder);
router.delete('/api/minimum-orders/:id', deleteMinimumOrder);

export default router;
