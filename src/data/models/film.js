import filmConfig from '../../config/film-types';

export default (dbService, sequelize) => {
  const Film = dbService.define('Film', {
    id: {
      type: sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: sequelize.ENUM,
      values: Object.values(filmConfig).map(film => film.keyName),
      allowNull: false,
    },
    name: {
      type: sequelize.STRING(50),
      allowNull: false,
      unique: true,
    },
    rented: {
      type: sequelize.BOOLEAN,
      defaultValue: false,
    }
  });

  Film.associate = (models) => {
    const { Order } = models;

    Film.hasMany(Order, {
      // foreignKey: 'filmId',
      as: 'orders',
    });
  };

  return Film;
};
