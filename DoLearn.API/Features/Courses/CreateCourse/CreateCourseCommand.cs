// in DoLearn.API.Features.Courses.Commands
using MediatR;

public record CreateCourseCommand(
    string Title,
    string? Description,
    string CourseCode,
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    List<DateTimeOffset> SessionStartTimes,
    List<DateTimeOffset> SessionEndTimes,
    int CreatedById,
    int Capacity,
    string? ImgURL,
    int CategoryId
) : IRequest<CourseCreateResponse>;
