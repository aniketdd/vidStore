import moment from 'moment';
import models from '../data/models';
import { DatabaseError, logger } from '../utils';
import filmTypes from '../config/film-types';

const getNumberOfDaysToPayFor = (totalPoints, useBonuspoints, numOfDays) => {
  if (useBonuspoints && totalPoints > 25) {
    const numOfDaysPayableByBonuspoints = parseInt(totalPoints / 25, 10);
    if (numOfDaysPayableByBonuspoints >= numOfDays) {
      return {
        paidByBonusPointsDays: Math.min(numOfDays, numOfDaysPayableByBonuspoints),
        paidByCurrencyDays: 0,
        pointsUsed: numOfDays * 25,
        pointsRemaining: totalPoints - (numOfDays * 25)
      };
    }
    return {
      paidByBonusPointsDays: numOfDaysPayableByBonuspoints,
      paidByCurrencyDays: numOfDays - numOfDaysPayableByBonuspoints,
      pointsUsed: numOfDaysPayableByBonuspoints * 25,
      pointsRemaining: totalPoints - (numOfDaysPayableByBonuspoints * 25)
    };
  }
  return {
    paidByBonusPointsDays: 0,
    paidByCurrencyDays: numOfDays,
    pointsUsed: 0,
    pointsRemaining: totalPoints
  };
};

const processOrder = async ({
  numOfDays, amountActuallyPaid, bonuspointsEarned, pointsUsed
}, film, customer) => {
  const {
    Order, Bonuspoint, Film, sequelize
  } = models;

  return sequelize.transaction(t => Order.create({
    days: numOfDays,
    amount: amountActuallyPaid,
    expectedReturnDate: moment().add(numOfDays, 'd').format('YYYY-MM-DD'),
    CustomerId: customer.id,
    FilmId: film.id
  }, { transaction: t })
    .then(order => {
      logger.info('ORDER created ===>', order);
      return Film.update({ rented: true }, {
        where: { id: film.id },
        transaction: t
      }).then((updatedFilm) => {
        logger.info('FILM updated ===>', updatedFilm);
        return order;
      });
    })
    .then(order => Bonuspoint.create({
      orderPoints: bonuspointsEarned,
      OrderId: order.id,
      CustomerId: customer.id
    }, { transaction: t }).then((bonuspointRecord) => {
      logger.info('Bonuspoint added for new rental', bonuspointRecord);
      return order;
    }))
    .then((order) => (pointsUsed > 0 ? Bonuspoint.create({
      orderPoints: pointsUsed * -1,
      OrderId: order.id,
      CustomerId: customer.id
    }, { transaction: t }).then((bonuspointRecord) => {
      logger.info('Bonuspoint redeemed for new rental', bonuspointRecord);
      return order;
    }) : order))).then(result => result).catch(error => {
    logger.error('error in order processing', { error });
    throw new DatabaseError('Order failed');
  });
};

export const placeOrder = async (req, res) => {
  try {
    const {
      Customer, Bonuspoint, Film
    } = models;
    const {
      username, useBonuspoints = false, filmId, numOfDays
    } = req.body;
    const customers = await Customer.findAll({
      include: [ { model: Bonuspoint, as: 'bonuspoints' } ],
      where: {
        username
      }
    }).catch(error => {
      logger.error('Db error in getPrice', { error });
      throw new DatabaseError('Db operation failed');
    });
    let customer;
    if (customers.length < 1) {
      customer = await Customer.create({ username }).catch(error => {
        logger.error('Db error ', { error });
        throw new DatabaseError('Db operation failed');
      });
    } else {
    // eslint-disable-next-line prefer-destructuring
      customer = customers[0];
    }
    logger.info('customer ===>', customer);
    const film = await Film.findOne({
      where: {
        rented: false,
        id: filmId
      }
    }).catch(error => {
      logger.error('Db error in getting Film', { error });
      throw new DatabaseError('Db operation failed');
    });
    if (!film) {
      return res.status(404).json({});
    }
    const { type: filmType, name } = film;
    const { priceCalculator, displayName, bonuspointsEarned } = filmTypes[filmType];

    const { bonuspoints = [] } = customer;
    const totalPoints = bonuspoints.reduce((acc, { orderPoints = 0 }) => acc + orderPoints, 0);

    const {
      paidByCurrencyDays,
      pointsUsed,
      pointsRemaining
    } = getNumberOfDaysToPayFor(totalPoints, useBonuspoints, numOfDays);

    const amountActuallyPaid = paidByCurrencyDays > 0
      ? priceCalculator.calculatePrice(paidByCurrencyDays) : 0;

    const processedOrder = await processOrder({
      numOfDays, amountActuallyPaid, bonuspointsEarned, pointsUsed
    }, film, customer);

    return res.status(200).json({
      filmName: name,
      filmType: displayName,
      numOfDays,
      pointsUsed,
      pointsRemaining: +pointsRemaining + +bonuspointsEarned,
      orderId: processedOrder.id,
      paidAmount: processedOrder.amount
    });
  } catch (error) {
    if (error instanceof DatabaseError) {
      return res.status(500).json({ errorCode: 'DB_ERROR' });
    }
    logger.error({ error });
    return res.status(500).json({ errorCode: 'GENERIC_ERROR' });
  }
};
