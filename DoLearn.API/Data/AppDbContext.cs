using DoLearn.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseSchedule> CourseSchedules { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<CoursePricing> CoursePricings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.Role)
                    .HasConversion<int>()
                    .HasDefaultValue(UserRole.Student);

                // A user can create many courses
                entity.HasMany(u => u.CreatedCourses)
                    .WithOne(c => c.CreatedBy)
                    .HasForeignKey(c => c.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict);


            });

            // Course Configuration
            modelBuilder.Entity<Course>(entity =>
            {
                // A course can have many enrollments


                // A course has one pricing
                entity.HasOne(c => c.Pricing)
                    .WithOne(p => p.Course)
                    .HasForeignKey<CoursePricing>(p => p.CourseId)
                    .OnDelete(DeleteBehavior.Cascade); // Delete pricing when course is deleted
            });

            // Enrollment Configuration
            modelBuilder.Entity<Enrollment>(entity =>
            {
                entity.HasKey(e => e.Id);

            });

            // CoursePricing Configuration
            modelBuilder.Entity<CoursePricing>(entity =>
            {
                entity.HasKey(p => p.Id);

                // One-to-one with Course
                entity.HasOne(p => p.Course)
                    .WithOne(c => c.Pricing)
                    .HasForeignKey<CoursePricing>(p => p.CourseId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}