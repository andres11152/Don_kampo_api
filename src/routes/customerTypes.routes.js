import { Router } from 'express';
import { getCustomerTypes,getCustomerTypeById,updateShippingCost, updateAllShippingCosts} from '../controllers/customerTypesController.js';

const router = Router();

router.get('/api/custom/customer-types', getCustomerTypes);  
router.get('/api/custom/customer-types/:id', getCustomerTypeById); 
router.put('/api/custom/customer-types/:id', updateShippingCost);  
router.put('/api/custom/update-customer-types', updateAllShippingCosts);  

export default router;
