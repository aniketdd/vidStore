export default (dbService, sequelize) => {
  const Bonuspoint = dbService.define('Bonuspoint', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: sequelize.INTEGER
    },
    orderPoints: {
      type: sequelize.INTEGER,
      allowNull: false
    }

  });

  Bonuspoint.associate = (models) => {
    const { Order, Customer } = models;

    Bonuspoint.belongsTo(Order);
    Bonuspoint.belongsTo(Customer);
  };

  return Bonuspoint;
};
