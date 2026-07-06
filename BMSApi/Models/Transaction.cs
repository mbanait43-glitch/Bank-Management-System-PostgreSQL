using System.ComponentModel.DataAnnotations;

namespace BMSApi.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        [Required, MaxLength(30)]
        public string Type { get; set; } = string.Empty;

        public decimal Amount { get; set; }
        public decimal BalanceAfterTransaction { get; set; }
        public string? ReceiverAccountNumber { get; set; }
        public string? SenderAccountNumber { get; set; }
        public string? Description { get; set; }
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
    }
}
