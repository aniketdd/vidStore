import Joi from 'joi';

export const getBonuspointsSchema = {
  params: {
    username: Joi.string().min(6).required()
  }
};
