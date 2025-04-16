using DoLearn.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<CoursePricing> CoursePricings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // User Configuration
    modelBuilder.Entity<User>(entity =>
    {
        entity.HasIndex(u => u.Email).IsUnique();
        entity.Property(u => u.Role)
            .HasConversion<int>()
            .HasDefaultValue(UserRole.Student);
        
        entity.HasMany(u => u.CreatedCourses)
            .WithOne(c => c.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);
        
        entity.HasMany(u => u.Enrollments)
            .WithOne(e => e.Student)
            .OnDelete(DeleteBehavior.Restrict);
    });

    // Course Configuration
    modelBuilder.Entity<Course>(entity =>
    {
        entity.HasMany(c => c.Enrollments)
            .WithOne(e => e.Course)
            .OnDelete(DeleteBehavior.Restrict);
    });

    // Enrollment Configuration
    modelBuilder.Entity<Enrollment>(entity =>
    {
        entity.HasOne(e => e.Student)
            .WithMany(u => u.Enrollments)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .OnDelete(DeleteBehavior.Restrict);
    });
}
    }
}