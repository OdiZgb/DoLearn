using DoLearn.API.Models;

public class Course
{
    public int Id { get; set; }
    
    // Basic Info
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string CourseCode { get; set; }
    
    // Dates
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    // Creator Tracking
    public int CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;
    
    // Relationships
    public List<Enrollment> Enrollments { get; set; } = [];
    public CoursePricing? Pricing { get; set; }
    
    // Optional: Track last updates
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}