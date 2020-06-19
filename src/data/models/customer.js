export default (dbService, sequelize) => {
  const Customer = dbService.define('Customer', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: sequelize.INTEGER
    },
    // firstname: {
    //   type: sequelize.STRING(50),
    //   allowNull: false,
    // },
    // lastname: {
    //   type: sequelize.STRING(50),
    //   allowNull: false,
    // },
    // address: {
    //   type: sequelize.STRING(100),
    //   allowNull: false,
    // },
    username: {
      type: sequelize.STRING(100),
      unique: true,
      allowNull: false,
    },
    // mobile: {
    //   type: sequelize.STRING(50),
    //   defaultValue: '',
    // },
  });

  Customer.associate = (models) => {
    const { Order, Bonuspoint } = models;

    Customer.hasMany(Order, {
      as: 'orders',
    });
    Customer.hasMany(Bonuspoint, {
      // foreignKey: 'customerId',
      as: 'bonuspoints',
    });
  };

  return Customer;
};
