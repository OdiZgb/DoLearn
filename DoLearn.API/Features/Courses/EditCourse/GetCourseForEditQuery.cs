using MediatR;

public class GetCourseForEditQuery : IRequest<CourseEditResponse>
{
    public int CourseId { get; set; }
}
