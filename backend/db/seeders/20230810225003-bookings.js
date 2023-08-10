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
      startDate: '2023-05-11',
      endDate: '2023-05-15'
    },
    {
      spotId: 2,
      userId: 2,
      startDate: '2023-06-01',
      endDate: '2023-07-03'
    },
    {
      spotId: 3,
      userId: 3,
      startDate: '2023-01-17',
      endDate: '2023-08-04'
    },
    {
      spotId: 4,
      userId: 3,
      startDate: '2023-07-15',
      endDate: '2023-07-17'
    },
    {
      spotId: 5,
      userId: 3,
      startDate: '2023-08-01',
      endDate: '2023-08-10'
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
