// Models/User.cs
using System;

namespace DoLearn.API.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public DateTime Birthdate { get; set; }
        
        public DateTime Registered { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }
        
        public bool Active { get; set; } = true;
        public bool EmailVerified { get; set; } = false;
        
        public string? EmailVerificationToken { get; set; }
        public string? PasswordResetToken { get; set; }
        public DateTime? ResetTokenExpires { get; set; }
    }
}