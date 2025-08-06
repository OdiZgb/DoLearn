using MediatR;

public class UpdateCourseCommand : IRequest
{
    public int CourseId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string CourseCode { get; set; } = null!;
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public List<SessionUpdateDto> Sessions { get; set; } = new();
    public List<int> DeletedSessionIds { get; set; } = new();
    public IFormFile? Image { get; set; }
    public string? ImgURL { get; set; }
}