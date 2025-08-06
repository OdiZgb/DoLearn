public class CourseEditResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string CourseCode { get; set; } = null!;
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public string? ImgURL { get; set; }
    public List<SessionResponse> Sessions { get; set; } = new();
}