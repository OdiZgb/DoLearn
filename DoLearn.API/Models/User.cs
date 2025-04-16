// Models/User.cs
using System;
using System.ComponentModel;

namespace DoLearn.API.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public DateTime Birthdate { get; set; }
        
        // Authentication & Status
        public DateTime Registered { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }
        public bool Active { get; set; } = true;
        public bool EmailVerified { get; set; } = false;
        
        // Security Tokens
        public string? EmailVerificationToken { get; set; }
        public string? PasswordResetToken { get; set; }
        public DateTime? ResetTokenExpires { get; set; }

        // Roles
        public UserRole Role { get; set; } = UserRole.Student; 

        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
        public List<Course> CreatedCourses { get; set; } = [];

    }

    public enum UserRole
    {
        [Description("Student")]
        Student = 0,
        
        [Description("Teacher")]
        Teacher = 1,
        
        [Description("Parent")]
        Parent = 2,
        
        [Description("Administrator")]
        Admin = 3
    }
}