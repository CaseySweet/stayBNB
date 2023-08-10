'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = 'Reviews';

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
        review: 'Wow I had an amazing stay!',
        stars: 5,
        userId: 1,
        spotId: 1,
      },
      {
        review: 'My family had lots of fun!',
        stars: 4,
        userId: 2,
        spotId: 2,
      },
      {
        review: 'We did not really like the cold be like liked the cabin.',
        stars: 3,
        userId: 3,
        spotId: 3,
      },
      {
        review: 'Lots of amazing views of nature',
        stars: 4,
        userId: 3,
        spotId: 4,
      },
      {
        review: 'Was too crowded',
        stars: 1,
        userId: 3,
        spotId: 5,
      }
    ], {})
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'Reviews';
    return queryInterface.bulkDelete(options, null, {});
  }
};
