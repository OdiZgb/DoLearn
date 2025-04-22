using DoLearn.API.Models;

public class CourseSession
{
    public int Id { get; set; }
    public List<Enrollment> Reservations { get; set; } = new();
    public int CourseScheduleId { get; set; }
    public CourseSchedule CourseSchedule { get; set; } = null!;

    public DateTime Start { get; set; }   // E.g., 2025-04-20 09:00 AM
    public DateTime Finish { get; set; }  // E.g., 2025-04-20 10:30 AM

    public List<int> ReservedByUserID { get; set; } = [];
    public int Capacity { get; set; } = 20; // Add capacity

    public bool IsCanceled { get; set; } = false;
}
