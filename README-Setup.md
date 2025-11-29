# Complete PostgreSQL Setup Guide

## Prerequisites

1. **Install PostgreSQL** on your system
2. **Start PostgreSQL service**
3. **Create the database**

## Step 1: Install PostgreSQL

### Windows:
- Download from https://www.postgresql.org/download/windows/
- Run the installer and note your password (set to `31330`)
- Make sure to install pgAdmin 4 (included)

### macOS:
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Configure PostgreSQL

1. **Set password for postgres user**:
```sql
ALTER USER postgres PASSWORD '31330';
```

2. **Create the database**:
```sql
CREATE DATABASE farming_platform;
```

## Step 3: Start the Application

### Terminal 1 - Start the Backend Server:
```bash
npm run server
```

### Terminal 2 - Start the Frontend:
```bash
npm run dev
```

## Step 4: Test Login

Open http://localhost:5173 in your browser and use these demo accounts:

- **Admin**: asha@agriplatform.com / admin123
- **Farmer**: ravi@farmers.com / farmer123  
- **Expert**: meera@experts.com / expert123
- **Public**: neha@public.com / public123

## Troubleshooting

### "connect ECONNREFUSED" Error:
- PostgreSQL is not running
- Wrong port (default is 5432)
- Wrong password (should be `31330`)

### Database doesn't exist:
```sql
CREATE DATABASE farming_platform;
```

### Server won't start:
- Check if port 3001 is available
- Make sure Node.js is installed

## Architecture

```
Frontend (Vite + React) :5173
    ↓ HTTP API calls
Backend (Express + pg) :3001
    ↓ PostgreSQL connection
PostgreSQL Database :5432
```

The frontend communicates with PostgreSQL through a REST API, solving browser compatibility issues.
