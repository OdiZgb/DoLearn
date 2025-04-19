// in DoLearn.API.Features.Courses.Commands
using MediatR;

public record CreateCourseCommand(
    string Title,
    string? Description,
    string CourseCode,
    DateTime StartDate,
    DateTime EndDate,
    List<DateTime> SessionStartTimes,
    List<DateTime> SessionEndTimes,
    int CreatedById,
    string? ImgURL
) : IRequest<CourseResponse>;
