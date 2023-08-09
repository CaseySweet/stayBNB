'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Spots', [
      {
        name: 'The Sunset',
        description: 'Nice tiny home on the beach.',
        price: 124,
        ownerId: 1,
        address: '123 Sunset Dr',
        city: 'South Haven',
        state: 'Michigan',
        country: 'United States',
        lat: 42.401472,
        lng: -86.288778,
      },
      {
        name: 'The Ultimate Escape',
        description: 'Right in the center of Mexico City you will have the most fun here.',
        price: 100,
        ownerId: 2,
        address: 'Alto Casa #200 Apt 8',
        city: 'Mexico City',
        state: 'Mexico City',
        country: 'Mexico',
        lat: 19.431163,
        lng: -99.137324,
      },
      {
        name: 'Cozy Cool Cabin',
        description: 'Nice long driveway up to a big snowy cabin.',
        price: 150,
        ownerId: 3,
        address: '231 Cozy Ln',
        city: 'Packwood',
        state: 'Washington',
        country: 'United States',
        lat: 46.608124,
        lng: -121.661130,
      },
      {
        name: 'The Perfect Retreat',
        description: 'Big barndominium sitting on 32 acres!',
        price: 125,
        ownerId: 3,
        address: '132 Barns St',
        city: 'Allegan',
        state: 'Michigan',
        country: 'United States',
        lat: 42.537225,
        lng: -85.823725,
      },
      {
        name: 'The Brooklyn Penthouse',
        description: 'Amazing 4 bedroom penthouse up in the sky with amazing views',
        price: 250,
        ownerId: 2,
        address: '213 Views Dr',
        city: 'Brooklyn',
        state: 'New York',
        country: 'United States',
        lat: 40.672458,
        lng: -73.958723,
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'Spots'
    return queryInterface.bulkDelete(options, {});
  }
};
