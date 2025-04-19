using MediatR;

namespace DoLearn.API.Features.Courses.GetCourse
{
    public sealed record GetCourseQuery(int CourseId) : IRequest<CourseResponse>;
}
