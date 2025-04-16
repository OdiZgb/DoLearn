using MediatR;

namespace DoLearn.API.Features.Courses.CreateCourse
{
    public sealed record CreateCourseCommand(
        string Title,
        string? Description,
        string CourseCode,
        DateTime StartDate,
        DateTime EndDate,
        int CreatedById
    ) : IRequest<CourseResponse>;
}
