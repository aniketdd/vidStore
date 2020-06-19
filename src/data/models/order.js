export default (dbService, sequelize) => {
  const Order = dbService.define('Order', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: sequelize.INTEGER
    },
    days: {
      type: sequelize.INTEGER,
      allowNull: false,
    },
    amount: {
      type: sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    issueDate: {
      type: sequelize.DATEONLY,
      allowNull: false,
      defaultValue: sequelize.NOW
    },
    expectedReturnDate: {
      type: sequelize.DATEONLY,
      allowNull: false,
    }
  });

  // Customer.associate = (models) => {
  //   const { order } = models;

  //   Customer.hasMany(order, {
  //     foreignKey: 'customerId',
  //     as: 'orders',
  //   });
  // };

  return Order;
};
