/* eslint-disable import/no-dynamic-require */
import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import { databaseService } from '../db-connection';

const basename = path.basename(__filename);
const db = {};

fs.readdirSync(__dirname)
  .filter(
    (file) => !file.startsWith('.')
      && file !== basename
      && file !== 'index.js'
      && file.slice(-3) === '.js'
  )
  .forEach((file) => {
    const fileName = path.join(__dirname, file);

    // eslint-disable-next-line global-require
    const model = require(fileName).default(databaseService, Sequelize);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = databaseService;
db.Sequelize = Sequelize;
export default db;
