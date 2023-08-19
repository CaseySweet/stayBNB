'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
   return queryInterface.bulkInsert(options, [
    {
      spotId: 1,
      url: 'https://i.pinimg.com/564x/1c/ed/44/1ced44eac09d3980124ef01adc2df7e7.jpg',
      preview: true
    },
    {
      spotId: 2,
      url: 'https://www.flysanjose.com/sites/default/files/sites/default/files/blog-photos/Mexico-City-Depositphotos_13449494_edited.jpg',
      preview:  true
    },
    {
      spotId: 3,
      url: 'https://hips.hearstapps.com/hmg-prod/images/best-winter-cabins-1638300737.jpg',
      preview:false
    },
    {
      spotId: 4,
      url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP-8b-Ca88OV9omY8vs2p4uFmbkfp_DPtHyw&usqp=CAU',
      preview: false
    },
    {
      spotId: 5,
      url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCn54lMjbPjHJOyyd6QbdhtAgNi8mi-h8cyetigYLFuA&s',
      preview: true
    }
   ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    return queryInterface.bulkDelete(options, null, {});
  }
};
