import express from 'express';
import filmsRouter from './films';
import customerRouter from './customer';
import orderRouter from './order';

const router = express.Router();
router.use('/films', filmsRouter);
router.use('/customers', customerRouter);
router.use('/orders', orderRouter);

export default router;
