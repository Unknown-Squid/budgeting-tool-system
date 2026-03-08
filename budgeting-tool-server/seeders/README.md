# Database Seeders

This folder contains database seeders for populating the database with initial or test data.

## Running Seeders

To run all seeders:
```bash
npx sequelize-cli db:seed:all
```

To run a specific seeder:
```bash
npx sequelize-cli db:seed --seed 20240101000000-demo-user.js
npx sequelize-cli db:seed --seed 20240102000000-admin-user.js
```

To undo the last seeder:
```bash
npx sequelize-cli db:seed:undo
```

To undo all seeders:
```bash
npx sequelize-cli db:seed:undo:all
```

## Available Seeders

- `20240101000000-demo-user.js` - Creates a demo user (email: gerald.fegalan@gmail.com, password: Pokemon_1234)
- `20240102000000-admin-user.js` - Creates an admin user (email: admin@budgetwise.com, password: Admin_1234, role: admin)

## Seeder File Naming Convention

Seeders should be named with a timestamp prefix followed by a descriptive name:
- Format: `YYYYMMDDHHMMSS-description.js`
- Example: `20240101000000-demo-user.js`

## Creating New Seeders

You can create seeders manually or use Sequelize CLI:

```bash
npx sequelize-cli seed:generate --name demo-data
```
