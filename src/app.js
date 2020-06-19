// var path = require("path");
import createError from 'http-errors';
import logger from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as expressValidation from 'express-validation';

import indexRouter from './routes';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet({
  hsts: true,
  ieNoOpen: true,
  noCache: true,
  noSniff: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: { policy: 'strict-origin' },
  xssFilter: true,
}));

app.use('/v1', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  if (err instanceof expressValidation.ValidationError) {
    const errorMessage = err.errors
      .map((error) => error.messages.reduce(
        (acc, message) => `${message} in ${error.location}. ${acc}`,
        '',
      ),)
      .join('');
    return res.status(403).json({ errorCode: 'InputValidationError' });
  }

  // render the error page
  res.status(err.status || 500).json({ errorCode: 'INTERNAL_SERVER_ERROR' });
});

module.exports = app;
