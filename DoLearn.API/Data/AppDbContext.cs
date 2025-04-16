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

                // A user can have many enrollments
                entity.HasMany(u => u.Enrollments)
                    .WithOne(e => e.Student)
                    .HasForeignKey(e => e.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Course Configuration
            modelBuilder.Entity<Course>(entity =>
            {
                // A course can have many enrollments
                entity.HasMany(c => c.Enrollments)
                    .WithOne(e => e.Course)
                    .HasForeignKey(e => e.CourseId)
                    .OnDelete(DeleteBehavior.Restrict);

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

                // Enrollment belongs to one student
                entity.HasOne(e => e.Student)
                    .WithMany(u => u.Enrollments)
                    .HasForeignKey(e => e.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Enrollment belongs to one course
                entity.HasOne(e => e.Course)
                    .WithMany(c => c.Enrollments)
                    .HasForeignKey(e => e.CourseId)
                    .OnDelete(DeleteBehavior.Restrict);
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