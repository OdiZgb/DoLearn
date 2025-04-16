public class CourseSchedule
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public bool IsSoftDeleted { get; set; } = false;

    public List<CourseSession> Sessions { get; set; } = [];
}
