public class CourseDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string ImgURL { get; set; }
    public UserDto CreatedBy { get; set; } // Simplified user data
}

