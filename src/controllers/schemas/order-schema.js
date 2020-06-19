import Joi from 'joi';

export const placeOrderSchema = {
  body: {
    username: Joi.string().min(6).required(),
    useBonuspoints: Joi.boolean(),
    filmId: Joi.number().required(),
    numOfDays: Joi.number().required(),
  }
};
