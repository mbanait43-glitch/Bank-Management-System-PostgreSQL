# Bank Management System - Final Real SQL Server Version

## What is added in this final version

- React.js frontend
- ASP.NET Core Web API backend
- SQL Server database support with Entity Framework Core
- JWT authentication
- PBKDF2 password hashing
- Role-based access: User and Admin
- Deposit and Withdraw
- Money transfer between accounts
- Transaction history with search/filter
- Profile page and change password
- Admin panel
- Admin can see all users
- Admin can see all accounts
- Admin can see all transactions
- Admin can block/unblock user login
- Admin can set account status: Active, Hold, Blocked
- Hold/Blocked accounts cannot deposit, withdraw, or transfer
- PDF statement generation from browser print
- Clean responsive UI with the original blue/white theme preserved

---

## Important: SQL Server setup

This project is configured for SQL Server by default.

Current connection string in `BMSApi/appsettings.json`:

```json
"DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=BMSPlacementDb;Trusted_Connection=True;MultipleActiveResultSets=true"
```

This uses SQL Server LocalDB. If LocalDB is installed, the database will be created automatically when backend runs.

### Option A: Use LocalDB - easiest

1. Install Visual Studio or SQL Server Express LocalDB.
2. Open terminal in backend folder:

```bash
cd BMSProject/BMSApi
dotnet restore
dotnet run
```

3. Backend should start at:

```txt
http://localhost:5265/swagger/index.html
```

4. Database name will be:

```txt
BMSPlacementDb
```

You can check it in SQL Server Management Studio using server name:

```txt
(localdb)\mssqllocaldb
```

---

### Option B: Use SQL Server Express

If you installed SQL Server Express, change `DefaultConnection` in `BMSApi/appsettings.json` to:

```json
"DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=BMSPlacementDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
```

Then run backend again:

```bash
cd BMSProject/BMSApi
dotnet restore
dotnet run
```

---

## Backend run

Open first terminal:

```bash
cd BMSProject/BMSApi
dotnet restore
dotnet run
```

Keep this terminal open.

Swagger:

```txt
http://localhost:5265/swagger/index.html
```

---

## Frontend run

Open second terminal:

```bash
cd BMSProject/bms-frontend
npm install
npm run dev
```

Open frontend:

```txt
http://localhost:5173
```

---

## First test

### Create admin account

Signup with this email:

```txt
Name: Admin
Email: admin@bms.com
Password: 123456
```

Any account created with `admin@bms.com` becomes Admin automatically.

### Create normal users

Create 2 normal users so you can test transfer:

```txt
Name: Mayur
Email: mayur@test.com
Password: 123456
```

```txt
Name: Rahul
Email: rahul@test.com
Password: 123456
```

---

## Test order

1. Signup admin
2. Signup normal user
3. Login as normal user
4. Deposit money
5. Withdraw money
6. Transfer money to another account number
7. Check transaction history
8. Download statement
9. Login as admin
10. Open Admin Panel
11. Check all users, all accounts, all transactions
12. Set account status to Hold
13. Login as that user and try deposit/withdraw/transfer
14. Set account status back to Active
15. Test again

---

## Account status rules

| Status | Meaning | Transaction allowed? | Login allowed? |
|---|---|---|---|
| Active | Normal account | Yes | Yes |
| Hold | Temporary hold by admin | No | Yes |
| Blocked | Bank account blocked | No | No |

User block/unblock is separate from account status.

- User Blocked = user cannot login
- Account Hold = user can login but cannot transact
- Account Blocked = user cannot login and cannot transact

---

## Resume line

Developed a full-stack Bank Management System using React.js, ASP.NET Core Web API, SQL Server, Entity Framework Core, JWT authentication, password hashing, role-based access control, fund transfer, transaction history, admin dashboard, account hold/block controls, and PDF statement generation.

---

## Interview explanation

This project has a React frontend and ASP.NET Core Web API backend. SQL Server is used for persistent storage through Entity Framework Core. Authentication is secured using JWT tokens and password hashing. Normal users can deposit, withdraw, transfer money, view profile, change password, and download statements. Admin can manage all users, accounts, transactions, block/unblock users, and put accounts on Active, Hold, or Blocked status.
