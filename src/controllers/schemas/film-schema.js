import Joi from 'joi';
import filmTypes from '../../config/film-types';

export const addFilmSchema = {
  body: {
    name: Joi.string().min(2).required(),
    type: Joi.string().valid(Object.values(filmTypes).map(type => type.displayName)).required(),
  },
};

export const updateFilmSchema = {
  body: {
    type: Joi.string().valid(Object.values(filmTypes).map(type => type.displayName)).required(),
  },
  params: {
    id: Joi.number().required(),
  }
};

export const removeFilmSchema = {
  params: {
    id: Joi.number().required(),
  }
};

export const getFilmsSchema = {
  query: {
    status: Joi.string().valid('available', 'Available').optional(),
  }
};

export const getPriceSchema = {
  params: {
    id: Joi.number().required(),
  },
  query: {
    days: Joi.number().required(),
  }
};

export const getActiveRentalSchema = {
  query: {
    username: Joi.string().min(6).optional()
  }
};
