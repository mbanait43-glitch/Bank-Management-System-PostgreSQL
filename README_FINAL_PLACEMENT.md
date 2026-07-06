# BMS Full Stack Placement Level Project

## Tech Stack
- React.js + Vite frontend
- ASP.NET Core Web API backend
- SQL Server database through Entity Framework Core
- JWT Authentication
- PBKDF2 password hashing
- Role-based access: User and Admin

## Final Features Added
- Register and Login
- Password hashing using PBKDF2
- JWT protected APIs
- SQL Server database support
- User profile page
- Change password
- Deposit money
- Withdraw money
- Transfer money between accounts
- Transaction history
- Search and filter transactions
- Monthly transaction summary
- Download statement as PDF using browser Print / Save as PDF
- Admin panel
- Admin can view users
- Admin can view recent transactions
- Admin can block/unblock users
- Loading screen, clean alerts, responsive UI
- Existing blue/white color theme preserved

## Important SQL Server Setup
This project is set to use SQL Server by default.

Connection string is inside:
`BMSApi/appsettings.json`

Default connection:
`Server=(localdb)\\mssqllocaldb;Database=BMSPlacementDb;Trusted_Connection=True;MultipleActiveResultSets=true`

If SQL Server LocalDB is installed, simply run the backend and database will be created automatically.

If LocalDB is not installed and you only want to test quickly, open `appsettings.json` and change:
`"DatabaseProvider": "SqlServer"`
to:
`"DatabaseProvider": "Sqlite"`

## Backend Run
```bash
cd BMSProject/BMSApi
dotnet restore
dotnet run
```

Backend URL:
`http://localhost:5265/swagger/index.html`

## Frontend Run
Open a new terminal:
```bash
cd BMSProject/bms-frontend
npm install
npm run dev
```

Frontend URL:
`http://localhost:5173`

## Admin Account
Create account using this email:
`admin@bms.com`

Any password with 6+ characters will work during signup.

## Test Flow
1. Signup admin using `admin@bms.com`
2. Signup normal user using another email
3. Login normal user
4. Deposit money
5. Withdraw money
6. Transfer money to another account number
7. Search/filter transaction history
8. Download statement as PDF
9. Login admin
10. Open Admin Panel and test block/unblock

## Resume Line
Developed a full-stack Bank Management System using React.js, ASP.NET Core Web API, SQL Server, Entity Framework Core, JWT authentication, PBKDF2 password hashing, and role-based access control with deposit, withdrawal, fund transfer, transaction history, admin dashboard, user blocking, profile management, and PDF statement generation.
