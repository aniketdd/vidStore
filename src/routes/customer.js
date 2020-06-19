import express from 'express';
import validate from 'express-validation';
import {
  getBonuspointsSchema
} from '../controllers/schemas';

import {
  getBonuspoints,
  addCustomer
} from '../controllers/customer-controller';

const router = express.Router();

router.get('/:username', validate(getBonuspointsSchema), getBonuspoints);
router.post('/', addCustomer);

module.exports = router;
