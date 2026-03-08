'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if demo user already exists
    const [existingUsers] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'demo@budgetwise.com' LIMIT 1`
    );

    if (existingUsers.length > 0) {
      console.log('✓ Demo user already exists. Skipping seed.');
      return;
    }

    console.log('Seeding demo user...');
    const hashedPassword = await bcrypt.hash('Pokemon_1234', 10);
    
    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        email: 'gerald.fegalan@gmail.com',
        password: hashedPassword,
        name: 'Demo User',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});

    console.log('✓ Demo user seeded successfully!');
    console.log('  Email: gerald.fegalan@gmail.com');
    console.log('  Password: Pokemon_1234');
  },

  async down(queryInterface, Sequelize) {
    const [existingUsers] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'demo@budgetwise.com' LIMIT 1`
    );

    if (existingUsers.length === 0) {
      console.log('✓ Demo user does not exist. Nothing to remove.');
      return;
    }

    console.log('Removing demo user...');
    await queryInterface.bulkDelete('users', {
      email: 'demo@budgetwise.com'
    }, {});
    console.log('✓ Demo user removed successfully!');
  }
};
