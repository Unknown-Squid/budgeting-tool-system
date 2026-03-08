# Budgeting System

A full-stack budgeting application with joint account support, built with Next.js and Node.js.

## Features

- **User Management**: Create, edit, and manage users with role-based access (admin/user)
- **Budget Management**: Create budgets with custom categories, limits, and timeframes
- **Transaction Tracking**: Track income and expenses with detailed descriptions
- **Joint Accounts**: Link two users to share budgets and transactions
- **Reports**: Generate comprehensive financial reports with charts and breakdowns
- **Activity Logs**: Track all user activities and changes
- **Auto-cleanup**: Automatic deletion of expired budgets after 15-day retention period
- **Dashboard**: Visual overview with charts and statistics

## Tech Stack

### Frontend
- Next.js 14
- React
- Tailwind CSS
- Recharts

### Backend
- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL/SQLite

## Project Structure

```
budgeting-tool-system/
├── budgeting-tool-client/    # Next.js frontend
│   ├── app/
│   │   ├── components/      # Reusable React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── dashboard/       # Dashboard page
│   │   └── admin/           # Admin panel
│   └── lib/                 # API utilities
│
└── budgeting-tool-server/    # Express backend
    ├── src/
    │   ├── controllers/     # Route controllers
    │   ├── models/          # Database models
    │   ├── routes/          # API routes
    │   └── services/       # Business logic
    └── middleware/          # Auth, validation, etc.
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL (or SQLite for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/budgeting-system.git
cd budgeting-system
```

2. Install client dependencies:
```bash
cd budgeting-tool-client
npm install
```

3. Install server dependencies:
```bash
cd ../budgeting-tool-server
npm install
```

4. Configure environment variables:
   - Create `.env` files in both client and server directories
   - Set up database connection strings
   - Configure JWT secrets

5. Run database migrations:
```bash
cd budgeting-tool-server
npm run migrate
```

6. Start the development servers:
   - Server: `cd budgeting-tool-server && npm start`
   - Client: `cd budgeting-tool-client && npm run dev`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Admin
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/joint-accounts` - Link joint account
- `DELETE /api/admin/joint-accounts/:id` - Unlink joint account

## License

MIT
