'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if admin user already exists
    const [existingUsers] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@budgetwise.com' LIMIT 1`
    );

    if (existingUsers.length > 0) {
      console.log('✓ Admin user already exists. Skipping seed.');
      return;
    }

    console.log('Seeding admin user...');
    const hashedPassword = await bcrypt.hash('Admin_1234', 10);
    
    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        email: 'admin@budgetwise.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});

    console.log('✓ Admin user seeded successfully!');
    console.log('  Email: admin@budgetwise.com');
    console.log('  Password: Admin_1234');
    console.log('  Role: admin');
  },

  async down(queryInterface, Sequelize) {
    const [existingUsers] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@budgetwise.com' LIMIT 1`
    );

    if (existingUsers.length === 0) {
      console.log('✓ Admin user does not exist. Nothing to remove.');
      return;
    }

    console.log('Removing admin user...');
    await queryInterface.bulkDelete('users', {
      email: 'admin@budgetwise.com'
    }, {});
    console.log('✓ Admin user removed successfully!');
  }
};
