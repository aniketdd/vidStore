import express from 'express';
import validate from 'express-validation';
import {
  addFilmSchema,
  updateFilmSchema,
  removeFilmSchema,
  getFilmsSchema,
  getPriceSchema,
  getActiveRentalSchema,
} from '../controllers/schemas';
import {
  addFilm,
  removeFilm,
  updateFilm,
  getFilms,
  getPrice,
  getActiveRental,
} from '../controllers/film-controller';

const router = express.Router();

router.post('/', validate(addFilmSchema), addFilm);
router.get('/', validate(getFilmsSchema), getFilms);
router.put('/:id', validate(updateFilmSchema), updateFilm);
router.delete('/:id', validate(removeFilmSchema), removeFilm);
router.get('/active', validate(getActiveRentalSchema), getActiveRental);
router.get('/:id', validate(getPriceSchema), getPrice); // check for days query param

module.exports = router;
