# BMS Full Stack Project - Placement Level Upgrade

## Tech Stack
- Frontend: React + Vite + Axios
- Backend: ASP.NET Core Web API
- Database: SQLite
- ORM: Entity Framework Core
- Security: JWT Authentication + Password Hashing

## New Features Added
- Real database storage
- JWT based login authentication
- Password hashing
- Protected backend APIs
- Deposit and withdraw
- Money transfer between accounts
- Transaction history with sender/receiver info
- Profile page and name update
- Admin panel to view users and block/unblock users
- Clean UI with original blue/white color theme preserved

## How to Run Backend
Open terminal in:

```bash
BMSProject/BMSApi
```

Run:

```bash
dotnet restore
dotnet run
```

Swagger:

```text
http://localhost:5265/swagger/index.html
```

If old database causes issue, delete this file once and run backend again:

```text
BMSProject/BMSApi/bank.db
```

## How to Run Frontend
Open another terminal in:

```bash
BMSProject/bms-frontend
```

Run:

```bash
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173/sign-in
```

## Admin Login
To create admin account, sign up with:

```text
Email: admin@bms.com
Password: any password with 6+ characters
```

Then login with the same details. Admin Panel will appear in sidebar.

## Testing Money Transfer
1. Create user 1 and deposit money.
2. Create user 2 and copy user 2 account number from profile/dashboard.
3. Login as user 1.
4. Open Transfer Money.
5. Enter user 2 account number and amount.

## Resume Point
Developed a full-stack Bank Management System using React, ASP.NET Core Web API, SQLite, Entity Framework Core, and JWT Authentication, featuring secure login, profile management, deposit/withdraw operations, account-to-account money transfer, transaction history, and admin user management.
