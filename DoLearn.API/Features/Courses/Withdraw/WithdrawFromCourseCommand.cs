using MediatR;

namespace DoLearn.API.Features.Courses.Commands
{
    public record WithdrawFromCourseCommand(int CourseId, int UserId) : IRequest<bool>;
}
