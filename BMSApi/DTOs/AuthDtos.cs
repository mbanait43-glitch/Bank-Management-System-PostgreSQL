using System.ComponentModel.DataAnnotations;

namespace BMSApi.DTOs
{
    public class RegisterRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class MoneyRequest
    {
        [Range(1, 1000000)]
        public decimal Amount { get; set; }
    }

    public class TransferRequest
    {
        [Required]
        public string ReceiverAccountNumber { get; set; } = string.Empty;

        [Range(1, 1000000)]
        public decimal Amount { get; set; }
    }

    public class UpdateProfileRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        [Required]
        public string OldPassword { get; set; } = string.Empty;

        [Required, MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }


    public class AccountStatusRequest
    {
        [Required]
        [RegularExpression("Active|Hold|Blocked", ErrorMessage = "Status must be Active, Hold, or Blocked")]
        public string Status { get; set; } = "Active";
    }
}
