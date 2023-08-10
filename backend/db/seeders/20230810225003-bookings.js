'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Bookings';

    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   return queryInterface.bulkInsert(options, [
    {
      spotId: 1,
      userId: 1,
      startDate: '05-11-23',
      endDate: '05-15-23'
    },
    {
      spotId: 2,
      userId: 2,
      startDate: '06-01-23',
      endDate: '07-03-23'
    },
    {
      spotId: 3,
      userId: 3,
      startDate: '01-17-23',
      endDate: '08-04-23'
    },
    {
      spotId: 4,
      userId: 3,
      startDate: '07-15-23',
      endDate: '07-17-23'
    },
    {
      spotId: 5,
      userId: 3,
      startDate: '08-01-23',
      endDate: '08-10-23'
    }
   ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'Bookings';
    return queryInterface.bulkDelete(options, null, {});
  }
};
