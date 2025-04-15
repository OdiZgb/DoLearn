// Data/AppDbContext.cs
using DoLearn.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<User> Users { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<int>()
                .HasDefaultValue(UserRole.Student);
                modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique(); // Add this line
        }
    }
}