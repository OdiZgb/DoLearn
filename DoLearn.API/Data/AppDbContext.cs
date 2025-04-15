// Data/AppDbContext.cs
using DoLearn.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<User> Users { get; set; }
    }
}