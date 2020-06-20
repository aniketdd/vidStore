import models from '../data/models';
import { DatabaseError, logger } from '../utils';

export const getBonuspoints = async (req, res) => {
  try {
    const { Customer, Bonuspoint } = models;
    const { username } = req.params;
    const customers = await Customer.findAll({
      include: [ { model: Bonuspoint, as: 'bonuspoints' } ],
      where: {
        username
      }
    }).catch(error => {
      logger.error('Db error in getBonuspoints', { error });
      throw new DatabaseError('Db operation failed');
    });
    if (customers.length < 1) {
      return res.status(404).json();
    }
    const customer = customers[0];
    const { bonuspoints, id } = customer;
    const totalPoints = bonuspoints.reduce((acc, { orderPoints = 0 }) => acc + orderPoints, 0);

    logger.info(customer);
    return res.status(200).json({
      id,
      username,
      totalPoints,
      payByBonuspoints: totalPoints > 25
    });
  } catch (error) {
    if (error instanceof DatabaseError) {
      return res.status(500).json({ errorCode: 'DB_ERROR' });
    }
    logger.error('getBonuspoints error: ', { error });
    return res.status(500).json({ errorCode: 'GENERIC_ERROR' });
  }
};
