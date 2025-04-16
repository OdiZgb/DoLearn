namespace DoLearn.API.Features.Courses.CreateCourse
{
    public sealed record CourseResponse(
        int Id,
        string Title,
        string CourseCode,
        DateTime CreatedAt,
        DateTime StartDate,
        DateTime EndDate
    );
}