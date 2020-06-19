import Sequelize from 'sequelize';
import settings from '../config';

const {
  dbHost,
  dbDatabase,
  dbUser,
  dbPassword
} = settings;

// eslint-disable-next-line import/prefer-default-export
export const databaseService = new Sequelize(dbDatabase, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'postgres',
  logging: console.log,
  operatorsAliases: Sequelize.Op,
  define: {
    freezeTableName: true,
  },
  // dialectOptions: {
  //   multipleStatements: true
  // },
});
