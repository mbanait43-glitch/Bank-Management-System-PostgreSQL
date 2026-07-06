using BMSApi.Data;
using BMSApi.DTOs;
using BMSApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Security.Cryptography;

namespace BMSApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BankController : ControllerBase
    {
        private readonly BankDbContext _context;
        private readonly IConfiguration _configuration;

        public BankController(BankDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var email = request.Email.Trim().ToLower();
            if (await _context.Users.AnyAsync(u => u.Email == email))
                return BadRequest("User already exists");

            var user = new User
            {
                Name = request.Name.Trim(),
                Email = email,
                PasswordHash = HashPassword(request.Password),
                IsAdmin = email == "admin@bms.com"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var account = new Account
            {
                UserId = user.Id,
                AccountNumber = GenerateAccountNumber(user.Id),
                Balance = 0,
                Status = "Active"
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            return Ok(AuthResponse(user, account));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var email = request.Email.Trim().ToLower();

            var user = await _context.Users.Include(u => u.Account)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
                return Unauthorized("Invalid email or password");

            if (user.IsBlocked)
                return Unauthorized("Your user profile is blocked. Please contact admin.");

            if (user.Account?.Status == "Blocked")
                return Unauthorized("Your bank account is blocked. Please contact admin.");

            return Ok(AuthResponse(user, user.Account));
        }

        [Authorize]
        [HttpGet("profile/{userId}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            if (!CanAccess(userId)) return Forbid();

            var user = await _context.Users.Include(u => u.Account).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound("User not found");

            return Ok(new { user.Id, user.Name, user.Email, user.IsAdmin, user.IsBlocked, user.CreatedAt, user.Account!.AccountNumber, user.Account.Balance, AccountStatus = user.Account.Status });
        }

        [Authorize]
        [HttpPut("profile/{userId}")]
        public async Task<IActionResult> UpdateProfile(int userId, UpdateProfileRequest request)
        {
            if (!CanAccess(userId)) return Forbid();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            user.Name = request.Name.Trim();
            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated", user.Name });
        }

        [Authorize]
        [HttpPut("profile/{userId}/password")]
        public async Task<IActionResult> ChangePassword(int userId, ChangePasswordRequest request)
        {
            if (!CanAccess(userId)) return Forbid();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");
            if (!VerifyPassword(request.OldPassword, user.PasswordHash)) return BadRequest("Old password is incorrect");
            user.PasswordHash = HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Password changed successfully" });
        }

        [Authorize]
        [HttpGet("balance/{userId}")]
        public async Task<IActionResult> GetBalance(int userId)
        {
            if (!CanAccess(userId)) return Forbid();
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.UserId == userId);
            if (account == null) return NotFound("Account not found");
            return Ok(account.Balance);
        }

        [Authorize]
        [HttpPost("deposit/{userId}")]
        public async Task<IActionResult> Deposit(int userId, MoneyRequest request)
        {
            if (!CanAccess(userId)) return Forbid();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.UserId == userId);
            if (account == null) return NotFound("Account not found");
            if (account.Status != "Active") return BadRequest($"Account is {account.Status}. Transactions are not allowed.");

            account.Balance += request.Amount;
            _context.Transactions.Add(new Transaction { UserId = userId, Type = "Deposit", Amount = request.Amount, BalanceAfterTransaction = account.Balance, Description = "Amount deposited" });
            await _context.SaveChangesAsync();
            return Ok(new { message = "Amount Deposited", balance = account.Balance });
        }

        [Authorize]
        [HttpPost("withdraw/{userId}")]
        public async Task<IActionResult> Withdraw(int userId, MoneyRequest request)
        {
            if (!CanAccess(userId)) return Forbid();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.UserId == userId);
            if (account == null) return NotFound("Account not found");
            if (account.Status != "Active") return BadRequest($"Account is {account.Status}. Transactions are not allowed.");
            if (account.Balance < request.Amount) return BadRequest("Insufficient balance");

            account.Balance -= request.Amount;
            _context.Transactions.Add(new Transaction { UserId = userId, Type = "Withdraw", Amount = request.Amount, BalanceAfterTransaction = account.Balance, Description = "Amount withdrawn" });
            await _context.SaveChangesAsync();
            return Ok(new { message = "Amount Withdrawn", balance = account.Balance });
        }

        [Authorize]
        [HttpPost("transfer/{userId}")]
        public async Task<IActionResult> Transfer(int userId, TransferRequest request)
        {
            if (!CanAccess(userId)) return Forbid();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var sender = await _context.Accounts.FirstOrDefaultAsync(a => a.UserId == userId);
            var receiver = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountNumber == request.ReceiverAccountNumber.Trim());

            if (sender == null) return NotFound("Sender account not found");
            if (receiver == null) return NotFound("Receiver account not found");
            if (sender.Status != "Active") return BadRequest($"Sender account is {sender.Status}. Transfer is not allowed.");
            if (receiver.Status != "Active") return BadRequest($"Receiver account is {receiver.Status}. Transfer is not allowed.");
            if (sender.AccountNumber == receiver.AccountNumber) return BadRequest("Cannot transfer to same account");
            if (sender.Balance < request.Amount) return BadRequest("Insufficient balance");

            sender.Balance -= request.Amount;
            receiver.Balance += request.Amount;

            _context.Transactions.Add(new Transaction { UserId = userId, Type = "Transfer Sent", Amount = request.Amount, BalanceAfterTransaction = sender.Balance, ReceiverAccountNumber = receiver.AccountNumber, Description = "Money transferred" });
            _context.Transactions.Add(new Transaction { UserId = receiver.UserId, Type = "Transfer Received", Amount = request.Amount, BalanceAfterTransaction = receiver.Balance, SenderAccountNumber = sender.AccountNumber, Description = "Money received" });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Money transferred successfully", balance = sender.Balance });
        }

        [Authorize]
        [HttpGet("transactions/{userId}")]
        public async Task<IActionResult> GetTransactions(int userId, [FromQuery] string? search, [FromQuery] string? type)
        {
            if (!CanAccess(userId)) return Forbid();
            var query = _context.Transactions.Where(t => t.UserId == userId);
            if (!string.IsNullOrWhiteSpace(type) && type != "All") query = query.Where(t => t.Type.Contains(type));
            if (!string.IsNullOrWhiteSpace(search)) query = query.Where(t => t.Type.Contains(search) || (t.Description ?? "").Contains(search) || (t.ReceiverAccountNumber ?? "").Contains(search) || (t.SenderAccountNumber ?? "").Contains(search));
            return Ok(await query.OrderByDescending(t => t.TransactionDate).ToListAsync());
        }

        [Authorize]
        [HttpGet("summary/{userId}")]
        public async Task<IActionResult> GetSummary(int userId)
        {
            if (!CanAccess(userId)) return Forbid();
            var transactions = await _context.Transactions.Where(t => t.UserId == userId).ToListAsync();
            var month = DateTime.Now.Month;
            var year = DateTime.Now.Year;
            var monthly = transactions.Where(t => t.TransactionDate.Month == month && t.TransactionDate.Year == year).ToList();
            return Ok(new
            {
                totalDeposited = transactions.Where(t => t.Type == "Deposit" || t.Type == "Transfer Received").Sum(t => t.Amount),
                totalWithdrawn = transactions.Where(t => t.Type == "Withdraw" || t.Type == "Transfer Sent").Sum(t => t.Amount),
                monthlyDeposited = monthly.Where(t => t.Type == "Deposit" || t.Type == "Transfer Received").Sum(t => t.Amount),
                monthlyWithdrawn = monthly.Where(t => t.Type == "Withdraw" || t.Type == "Transfer Sent").Sum(t => t.Amount),
                transactionCount = transactions.Count,
                monthlyTransactionCount = monthly.Count
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users.Include(u => u.Account).OrderByDescending(u => u.CreatedAt).Select(u => new
            {
                u.Id, u.Name, u.Email, u.IsAdmin, u.IsBlocked, u.CreatedAt,
                AccountNumber = u.Account != null ? u.Account.AccountNumber : "",
                Balance = u.Account != null ? u.Account.Balance : 0,
                AccountStatus = u.Account != null ? u.Account.Status : "Not Created"
            }).ToListAsync();
            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/accounts")]
        public async Task<IActionResult> GetAllAccounts()
        {
            var accounts = await _context.Accounts.Include(a => a.User)
                .OrderBy(a => a.Id)
                .Select(a => new { a.Id, a.UserId, UserName = a.User!.Name, UserEmail = a.User.Email, a.AccountNumber, a.Balance, a.Status, a.CreatedAt })
                .ToListAsync();
            return Ok(accounts);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("admin/accounts/{accountId}/status")]
        public async Task<IActionResult> UpdateAccountStatus(int accountId, AccountStatusRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var account = await _context.Accounts.Include(a => a.User).FirstOrDefaultAsync(a => a.Id == accountId);
            if (account == null) return NotFound("Account not found");
            if (account.User != null && account.User.IsAdmin) return BadRequest("Admin account status cannot be changed");

            account.Status = request.Status;
            _context.Transactions.Add(new Transaction
            {
                UserId = account.UserId,
                Type = "Account Status",
                Amount = 0,
                BalanceAfterTransaction = account.Balance,
                Description = $"Admin changed account status to {request.Status}"
            });
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Account status changed to {request.Status}", account.Id, account.Status });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/transactions")]
        public async Task<IActionResult> GetAllTransactions()
        {
            var transactions = await _context.Transactions.Include(t => t.User)
                .OrderByDescending(t => t.TransactionDate)
                .Select(t => new { t.Id, t.UserId, UserName = t.User.Name, UserEmail = t.User.Email, t.Type, t.Amount, t.BalanceAfterTransaction, t.ReceiverAccountNumber, t.SenderAccountNumber, t.Description, t.TransactionDate })
                .ToListAsync();
            return Ok(transactions);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("admin/users/{userId}/block")]
        public async Task<IActionResult> ToggleBlock(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");
            if (user.IsAdmin) return BadRequest("Admin cannot be blocked");
            user.IsBlocked = !user.IsBlocked;
            await _context.SaveChangesAsync();
            return Ok(new { message = user.IsBlocked ? "User blocked" : "User unblocked", user.IsBlocked });
        }

        private object AuthResponse(User user, Account? account)
        {
            return new { message = "Success", userId = user.Id, name = user.Name, email = user.Email, accountNumber = account?.AccountNumber, isAdmin = user.IsAdmin, token = GenerateJwtToken(user) };
        }

        private bool CanAccess(int userId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");
            return isAdmin || currentUserId == userId.ToString();
        }


        private string HashPassword(string password)
        {
            byte[] salt = RandomNumberGenerator.GetBytes(16);
            byte[] hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100000, HashAlgorithmName.SHA256, 32);
            return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
        }

        private bool VerifyPassword(string password, string storedHash)
        {
            var parts = storedHash.Split('.');
            if (parts.Length != 2) return false;
            byte[] salt = Convert.FromBase64String(parts[0]);
            byte[] expectedHash = Convert.FromBase64String(parts[1]);
            byte[] actualHash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100000, HashAlgorithmName.SHA256, 32);
            return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(6),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateAccountNumber(int userId)
        {
            return $"BMS{DateTime.Now:yyyyMMdd}{userId:D4}";
        }
    }
}
