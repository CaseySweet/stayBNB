'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
   return queryInterface.bulkInsert(options, [
    {
      spotId: 4,
      userId: 1,
      startDate: '2024-05-11',
      endDate: '2024-05-15'
    },
    {
      spotId: 3,
      userId: 2,
      startDate: '2024-06-01',
      endDate: '2024-07-03'
    },
    {
      spotId: 2,
      userId: 3,
      startDate: '2024-01-17',
      endDate: '2024-08-04'
    },
    {
      spotId: 5,
      userId: 3,
      startDate: '2024-07-15',
      endDate: '2024-07-17'
    },
    {
      spotId: 1,
      userId: 2,
      startDate: '2023-08-01',
      endDate: '2023-08-10'
    }

   ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    return queryInterface.bulkDelete(options, null, {});
  }
};
