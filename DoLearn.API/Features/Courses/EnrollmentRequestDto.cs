public class EnrollmentRequestDto
{
    public int CourseId { get; set; }
    public List<int> SelectedSessionIds { get; set; } = new();
}
