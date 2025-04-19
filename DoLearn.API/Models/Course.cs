using DoLearn.API.Models;

public class Course
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string CourseCode { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    public int CreatedById { get; set; }
    public string? ImgURL { get; set; }

    public User CreatedBy { get; set; } = null!;

    public CoursePricing? Pricing { get; set; }
    public CourseSchedule Schedule { get; set; } = null!;

    public List<User> Students { get; set; } = [];
    public List<User> Teachers { get; set; } = [];
}
