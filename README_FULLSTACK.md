# Bank Management System - Full Stack Version

## Tech Stack
- Frontend: React + Vite + Axios
- Backend: ASP.NET Core Web API (.NET 8)
- Database: SQLite using Entity Framework Core
- Features: Register, Login, Account Creation, Balance, Deposit, Withdraw, Transaction History

## What changed from old version
Old backend used `static List<User>`, `static List<Account>`, and `static List<Transaction>`. That data was temporary and deleted after backend restart.

This upgraded version stores data in a real database file: `bms.db`.

## Backend Run Steps
Open terminal in:

```bash
BMSProject/BMSApi
```

Run:

```bash
dotnet restore
dotnet run
```

Open Swagger:

```text
http://localhost:5265/swagger/index.html
```

The database file `bms.db` will be created automatically inside the backend folder.

## Frontend Run Steps
Open another terminal in:

```bash
BMSProject/bms-frontend
```

Run:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173/sign-in
```

## API Endpoints

```text
POST /api/Bank/register
POST /api/Bank/login
GET  /api/Bank/account/{userId}
GET  /api/Bank/balance/{userId}
POST /api/Bank/deposit?userId=1&amount=500
POST /api/Bank/withdraw?userId=1&amount=100
GET  /api/Bank/transactions/{userId}
```

## Resume Line
Developed a full-stack Bank Management System using React, ASP.NET Core Web API, Entity Framework Core, and SQLite with user registration, login, account balance management, deposit/withdraw operations, and transaction history.

## Interview Explanation
This project has a React frontend that communicates with an ASP.NET Core Web API using Axios. The backend uses Entity Framework Core to store users, accounts, and transactions in a database. When a user registers, a bank account is automatically created. Users can log in, check balance, deposit money, withdraw money, and view transaction history.
