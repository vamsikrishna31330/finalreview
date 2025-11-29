# PostgreSQL Setup for Farming Platform

## Database Configuration

The application has been configured to use PostgreSQL with the following settings:

- **Host**: localhost
- **Port**: 5432
- **Database**: farming_platform
- **User**: postgres
- **Password**: 31330

## Setup Instructions

### 1. Install PostgreSQL
Make sure PostgreSQL is installed and running on your system.

### 2. Create Database
```sql
CREATE DATABASE farming_platform;
```

### 3. Verify Connection
The application will automatically create tables and seed data on first run if they don't exist.

### 4. Demo Accounts
The following demo accounts are available:
- **Admin**: asha@agriplatform.com / admin123
- **Farmer**: ravi@farmers.com / farmer123
- **Expert**: meera@experts.com / expert123
- **Public**: neha@public.com / public123

## Changes Made

1. **Dependencies**: Replaced `sql.js` with `pg` (PostgreSQL client)
2. **Database Provider**: Updated to use PostgreSQL connection pool
3. **Schema**: Converted SQLite schema to PostgreSQL syntax
4. **Queries**: Updated parameter syntax from `?` to `$1, $2...`
5. **Authentication**: Updated to work with async PostgreSQL queries

## Running the Application

```bash
npm run dev
```

The application will automatically connect to PostgreSQL and initialize the database if needed.
