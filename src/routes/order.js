import express from 'express';
import validate from 'express-validation';
import {
  placeOrder
} from '../controllers/order-controller';
import {
  placeOrderSchema
} from '../controllers/schemas';

const router = express.Router();

router.post('/', validate(placeOrderSchema), placeOrder);

module.exports = router;
