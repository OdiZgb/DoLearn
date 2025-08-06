public class CourseDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string ImgURL { get; set; }
    public UserDto CreatedBy { get; set; } // Simplified user data
    public int CategoryId { get; set; }
    public bool? SoftDelete { get; set; } = false; 

}

