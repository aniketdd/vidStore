import models from '../data/models';
import { DatabaseError, logger } from '../utils';
import filmTypes from '../config/film-types';

export const addFilm = async (req, res) => {
  try {
    const { Film } = models;
    const { name, type } = req.body;
    const { keyName } = Object.values(filmTypes).filter((value) => value.displayName === type)[0];
    const result = await Film.create({ name, type: keyName, rented: false }).catch(error => {
      logger.error('Db error in updateFilm', { error });
      throw new DatabaseError('Db operation failed');
    });
    const {
      id, rented, name: filmName, type: filmType
    } = result;
    return res.status(201).json({
      id, beenRented: rented, name: filmName, type: filmTypes[filmType].displayName
    });
  } catch (error) {
    if (error instanceof DatabaseError) {
      return res.status(500).json({ errorCode: 'DB_ERROR' });
    }
    logger.error({ error });
    return res.status(500).json({ errorCode: 'GENERIC_ERROR' });
  }
};

export const updateFilm = async (req, res) => {
  try {
    const { Film } = models;
    const { id } = req.params;
    const { type } = req.body;
    const { keyName } = Object.values(filmTypes).filter((value) => value.displayName === type)[0];
    const result = await Film.update({ type: keyName }, {
      where: { id }
    }).catch(error => {
      logger.error('Db error in updateFilm', { error });
      throw new DatabaseError('Db operation failed');
    });

    return result[0] === 1 ? res.status(204).json() : res.status(404).json();
  } catch (error) {
    if (error instanceof DatabaseError) {
      return res.status(500).json({ errorCode: 'DB_ERROR' });
    }
    logger.error({ error });
    return res.status(500).json({ errorCode: 'GENERIC_ERROR' });
  }
};

export const removeFilm = async (req, res) => {
  try {
    const { Film } = models;
    const { id } = req.params;
    const result = await Film.destroy({
      where: { id }
    }).catch(error => {
      logger.error('Db error in updateFilm', { error });
      throw new DatabaseError('Db operation failed');
    });
    logger.info(result);
    return result === 1 ? res.status(204).json() : res.status(404).json();
  } catch (error) {
    if (error instanceof DatabaseError) {
      return res.status(500).json({ errorCode: 'DB_ERROR' });
    }
    logger.error({ error });
    return res.status(500).json({ errorCode: 'GENERIC_ERROR' });
  }
};

export const getFilms = async (req, res) => {
  try {
    const { Film } = models;
    const { status = '' } = req.query;
    const predicate = status.toLowerCase() === 'available' ? { rented: false } : {};
    const result = await Film.findAll({
      where: predicate
    }).catch(error => {
      logger.error('Db error in updateFilm', { error });
      throw new DatabaseError('Db operation failed');
    });
    logger.info(result);
    return res.status(200).json({
      films: result.map(film => ({
        id: film.id,
        name: film.name,
        beenRented: film.rented,
        type: filmTypes[film.type].displayName
      }))
    });
  } catch (error) {
    if (error instanceof DatabaseError) {
      return res.status(500).json({ errorCode: 'DB_ERROR' });
    }
    logger.error({ error });
    return res.status(500).json({ errorCode: 'GENERIC_ERROR' });
  }
};

export const getPrice = async (req, res) => {
  try {
    const { Film } = models;
    const { id } = req.params;
    const { days } = req.query;
    const film = await Film.findByPk(id).catch(error => {
      logger.error('Db error in getPrice', { error });
      throw new DatabaseError('Db operation failed');
    });
    if (!film) {
      return res.status(404).json({ errorCode: 'RESOURCE_NOT_FOUND' });
    }
    const { priceCalculator, displayName } = filmTypes[film.type];
    return res.status(200).json({
      price: priceCalculator.calculatePrice(+days),
      filmName: film.name,
      numberOfDays: days,
      filmType: displayName
    });
  } catch (error) {
    if (error instanceof DatabaseError) {
      return res.status(500).json({ errorCode: 'DB_ERROR' });
    }
    logger.error({ error });
    return res.status(500).json({ errorCode: 'GENERIC_ERROR' });
  }
};

export const getActiveRental = async (req, res) => {
  try {
    const { Film, Order, Customer } = models;
    const { username = '' } = req.query;
    let predicate = {};
    if (username) {
      const customer = await Customer.findOne({
        where: {
          username,
        }
      });
      if (!customer) {
        return res.status(200).json({
          films: [],
          total: 0
        });
      }
      predicate = {
        CustomerId: customer.id,
      };
    }
    const films = await Film.findAll({
      include: [ {
        model: Order,
        as: 'orders',
        where: predicate,
      } ],
      where: { rented: true },

    }).catch(error => {
      logger.error('Db error in getPrice', { error });
      throw new DatabaseError('Db operation failed');
    });

    const sanitizedFilms = films.map(film => {
      const { type, name, orders = [] } = film;
      const latestOrder = orders.sort((a, b) => b.id > a.id)[0];
      return {
        name,
        days: latestOrder.days,
        amount: latestOrder.amount,
        type: filmTypes[type].displayName
      };
    });
    // const { priceCalculator, displayName } = filmTypes[film.type];
    return res.status(200).json({
      films: sanitizedFilms,
      total: sanitizedFilms.reduce((acc, current) => acc + (+current.amount), 0)
    });
  } catch (error) {
    if (error instanceof DatabaseError) {
      return res.status(500).json({ errorCode: 'DB_ERROR' });
    }
    logger.error(error);
    return res.status(500).json({ errorCode: 'GENERIC_ERROR' });
  }
};
