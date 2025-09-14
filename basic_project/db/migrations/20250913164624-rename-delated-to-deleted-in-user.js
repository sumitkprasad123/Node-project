"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("user", "delatedAt", "deletedAt");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn("user", "deletedAt", "delatedAt");
  },
};
