// Models/Courses/CourseTag.cs
public class CourseTag
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public List<Course> Courses { get; set; } = [];
}