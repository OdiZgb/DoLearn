public class CreateCourseDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string CourseCode { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public List<DateTime> SessionStartTimes { get; set; } = [];
    public List<DateTime> SessionEndTimes { get; set; } = [];
}
