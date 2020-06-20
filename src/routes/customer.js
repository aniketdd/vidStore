import express from 'express';
import validate from 'express-validation';
import {
  getBonuspointsSchema
} from '../controllers/schemas';

import {
  getBonuspoints,
} from '../controllers/customer-controller';

const router = express.Router();

router.get('/:username', validate(getBonuspointsSchema), getBonuspoints);

module.exports = router;
