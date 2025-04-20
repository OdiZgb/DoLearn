using DoLearn.API.Models;

public class Enrollment
{
    public int Id { get; set; }
    public List<CourseSession> ReservedSessions { get; set; } = new();

    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }
    public string? Notes { get; set; }

    // Add session reservations
    public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Pending;

    public int StudentId { get; set; }
    public User Student { get; set; } = null!;
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;

}
