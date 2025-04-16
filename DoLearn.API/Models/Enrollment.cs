using DoLearn.API.Models;

public enum EnrollmentStatus
{
    Active,
    Completed,
    Withdrawn,
    Failed,
    Transferred
}

public class Enrollment
{
    public int Id { get; set; }

    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; } // If they dropped, completed, etc.

    public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Active;

    public string? Notes { get; set; } // Optional: reason for drop, transfer, etc.

    // Foreign keys
    public int StudentId { get; set; }
    public User Student { get; set; } = null!;

    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;
}
