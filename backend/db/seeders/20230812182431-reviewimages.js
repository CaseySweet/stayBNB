'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';

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
        reviewId: 1,
        url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4YHwsm40gq7x9MuZ6EOKUh2lpODWEsWe4Aw&usqp=CAU'
      },
      {
        reviewId: 2,
        url: 'https://www.fodors.com/wp-content/uploads/2021/05/UltimateMexicoCity__HERO_shutterstock_1058054480.jpg'
      },
      {
        reviewId: 3,
        url: 'https://media.istockphoto.com/id/1297264792/photo/sunny-winter-landscape.jpg?s=612x612&w=0&k=20&c=OqH7KoNK3L63vikwC68w0s4tBD3k0hqXJuF4_McDQac='
      },
      {
        reviewId: 3,
        url: 'https://media.istockphoto.com/id/613034406/photo/green-grass-field-of-public-park-in-morning-light.jpg?s=612x612&w=0&k=20&c=-uNlgILjNtqLe4SzvbXB5QwXgIeCAVpA4PjFQTMX4x0='
      },
      {
        reviewId: 3,
        url: 'https://cdn.vox-cdn.com/thumbor/wIzpa_yKILKLNmOqCopufU_zI7E=/0x0:4000x2667/920x613/filters:focal(1680x1014:2320x1654):format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/65027193/shutterstock_788608396.0.jpg'
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
    options.tableName = 'ReviewImages';
    return queryInterface.bulkDelete(options, null, {});
  }
};
