using System.ComponentModel.DataAnnotations;

namespace BMSApi.Models
{
    public class Account
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        [Required, MaxLength(20)]
        public string AccountNumber { get; set; } = string.Empty;

        public decimal Balance { get; set; } = 0;

        [Required, MaxLength(20)]
        public string Status { get; set; } = "Active"; // Active, Hold, Blocked

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
    }
}
