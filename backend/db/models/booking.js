'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Booking.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
      })
      Booking.belongsTo(models.Spot, {
        foreignKey: 'spotId',
        onDelete: 'CASCADE',
      })
    }
  }
  Booking.init({
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      // validate: {
      //   isDate: true,
      // },
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      // validate: {
      //   isDate: true,
      // },
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    spotId: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};
