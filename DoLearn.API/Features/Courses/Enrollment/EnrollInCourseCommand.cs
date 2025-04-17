using MediatR;

namespace DoLearn.API.Features.Courses.Commands
{
    public record EnrollInCourseCommand(int CourseId, int UserId) : IRequest<bool>;
}
