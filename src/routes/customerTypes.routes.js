import { Router } from 'express';
import { getCustomerTypes,  updateAllShippingCosts } from '../controllers/customerTypes.Controller.js';

const router = Router();

router.get('/api/customer-types', getCustomerTypes);
router.put('/api/customer-types/shipping-costs', updateAllShippingCosts);

export default router;
